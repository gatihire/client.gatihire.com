import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext, maskCandidate } from "@/lib/clientAuth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { generateEmbedding } from "@/lib/embedding"
import { searchRL } from "@/lib/rateLimit"
import { redis } from "@/lib/redis"
import crypto from "crypto"
import { calculateCandidateScore, applySidebarFilters } from "@/lib/scoring"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const ROLE_SYNONYMS: Record<string, string[]> = {
  "fleet manager": ["fleet management", "transportation manager", "logistics manager", "transport manager", "fleet supervisor"],
  "truck driver": ["driver", "heavy vehicle driver", "commercial driver", "truck operator", "vehicle driver"],
  "logistics coordinator": ["logistics executive", "supply chain coordinator", "transport coordinator", "dispatch executive"],
  "operations manager": ["operations executive", "operations head", "fleet manager", "branch manager"],
  "dispatcher": ["dispatch executive", "dispatch coordinator", "fleet dispatcher"],
  "supply chain": ["procurement", "warehouse", "inventory", "logistics", "distribution"],
  "driver": ["truck driver", "vehicle operator", "commercial driver", "delivery driver"],
}

function expandRoleVariants(role: string): string[] {
  const q = (role || "").trim().toLowerCase()
  if (!q) return []
  const out = new Set<string>([role.trim()])
  for (const [key, synonyms] of Object.entries(ROLE_SYNONYMS)) {
    if (q.includes(key) || key.includes(q)) synonyms.forEach(s => out.add(s))
  }
  return Array.from(out)
}

function buildWebsearchQuery(terms: string[], max = 15): string {
  return terms.slice(0, max).map(t => t.includes(" ") ? `"${t}"` : t).filter(Boolean).join(" OR ")
}

export async function POST(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Apply Rate Limiting
  const { success } = await searchRL.limit(ctx.clientId)
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
  }

  const body = await request.json().catch(() => ({}))
  const { jd, offset: reqOffset = 0, limit: reqLimit = 20, filters = {}, refresh = false } = body
  if (!jd?.trim()) return NextResponse.json({ error: "Job description required" }, { status: 400 })

  const offset = parseInt(reqOffset, 10) || 0
  const limit  = parseInt(reqLimit, 10) || 20

  // Check Redis Cache for AI Extraction to save 2-3 seconds
  const jdHash = crypto.createHash('md5').update(jd.trim().toLowerCase()).digest('hex')
  const cacheKey = `jd_search_criteria:${jdHash}`
  let criteriaResult: any = null
  let embedding: number[] = []

  if (redis && !refresh) {
    const cachedData = await redis.get<{ criteria: any, embedding: number[] }>(cacheKey)
    if (cachedData) {
      criteriaResult = cachedData.criteria
      embedding = cachedData.embedding
    }
  }

  if (!criteriaResult) {
    // 1. Extract criteria + embedding in parallel
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" })
    const prompt = `Analyze this job description and extract key hiring criteria for candidate matching.
JD: """${jd.slice(0, 3000)}"""
Return ONLY valid JSON:
{"title": string, "required_skills": string[], "preferred_skills": string[], "min_experience_years": number|null, "location": string|null, "key_keywords": string[]}`

    const [extracted, emb] = await Promise.all([
      model.generateContent(prompt).then(r => {
        const text = r.response.text().replace(/```json\n?|\n?```/g, "").trim()
        return JSON.parse(text)
      }).catch(() => ({ title: "", required_skills: [], preferred_skills: [], key_keywords: [] })),
      generateEmbedding(jd.slice(0, 7000)).catch(() => [] as number[]),
    ])
    
    criteriaResult = extracted
    embedding = emb

    if (redis && embedding.length > 0) {
      await redis.set(cacheKey, { criteria: criteriaResult, embedding }, { ex: 3600 * 24 }) // Cache for 24 hours
    }
  }

  const criteria = criteriaResult

  // 2. Build websearch query from extracted keywords
  const roleVariants = expandRoleVariants(criteria.title || "")
  const allKeyTerms = [...roleVariants, ...(criteria.required_skills || []), ...(criteria.key_keywords || [])].filter(Boolean)
  const websearchQ = buildWebsearchQuery(allKeyTerms, 15).replace(/[()]/g, " ").trim()

  // 3. Map both JD criteria and Frontend Filters to RPC filters
  const rpcFilters: any = {}
  
  // From JD Extracted Criteria
  if (criteria.location) rpcFilters.currentCity = [criteria.location]
  if (criteria.min_experience_years) rpcFilters.exp_min = criteria.min_experience_years.toString()
  if (allKeyTerms.length > 0) rpcFilters.must_kw = allKeyTerms

  // From Frontend (overrides JD if both present)
  if (filters.currentCity && filters.currentCity.length > 0) rpcFilters.currentCity = filters.currentCity
  if (filters.experience?.min) rpcFilters.exp_min = filters.experience.min
  if (filters.experience?.max) rpcFilters.exp_max = filters.experience.max
  if (filters.mustHaveKeywords && filters.mustHaveKeywords.length > 0) {
    rpcFilters.must_kw = [...(rpcFilters.must_kw || []), ...filters.mustHaveKeywords]
  }
  if (filters.excludeKeywords && filters.excludeKeywords.length > 0) rpcFilters.exclude_kw = filters.excludeKeywords
  if (filters.industries && filters.industries.length > 0) rpcFilters.industries = filters.industries
  if (filters.companies && filters.companies.length > 0) rpcFilters.companies = filters.companies
  if (filters.education && filters.education.length > 0) rpcFilters.education = filters.education

  // 4. Unlocked set
  const { data: unlocked } = await supabaseAdmin.from("client_unlocked_candidates").select("candidate_id").eq("client_id", ctx.clientId)
  const unlockedSet = new Set((unlocked || []).map((u: any) => u.candidate_id))

  // 5. Run Hybrid Search RPC
  const { data, error } = await supabaseAdmin.rpc("search_candidates_hybrid", {
    p_query_text: websearchQ,
    p_query_embedding: embedding.length ? embedding : null,
    p_match_threshold: 0.15,
    p_filters: rpcFilters,
    p_limit: 500,
    p_offset: 0
  })

  if (error) {
    console.error("JD Search RPC Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const mappedCriteria = {
    role: criteria.title,
    location: criteria.location,
    min_experience_years: criteria.min_experience_years,
    skills: [...(criteria.required_skills || []), ...(criteria.preferred_skills || [])]
  }

  let results = (data || [])
    .map((row: any) => {
      const rawCandidate = row.candidate_data
      const calculatedScore = calculateCandidateScore(mappedCriteria, rawCandidate)
      const finalScore = Math.max(calculatedScore, row.match_score * 100)
      return { ...maskCandidate(rawCandidate, unlockedSet.has(rawCandidate.id)), match_score: Math.round(finalScore) }
    })
    .filter((c: any) => c.match_score >= 12)

  results.sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0))
  results = results.map((c: any) => ({ ...c, match_score: Math.min(100, c.match_score) }))
  results = applySidebarFilters(results, filters)

  const total = results.length
  const paginatedResults = results.slice(offset, offset + limit)

  return NextResponse.json({ results: paginatedResults, criteria: mappedCriteria, total, offset })
}
