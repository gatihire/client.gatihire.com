import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext, maskCandidate } from "@/lib/clientAuth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { generateEmbedding } from "@/lib/embedding"
import { calculateCandidateScore, applySidebarFilters } from "@/lib/scoring"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const CANDIDATE_SELECT = [
  "id", "name", "email", "phone", "current_role", "current_company",
  "location", "total_experience", "highest_qualification", "degree",
  "university", "technical_skills", "soft_skills", "current_salary",
  "expected_salary", "linkedin_profile", "file_url", "file_name", "file_type",
  "gender", "summary", "notice_period", "previous_companies", "job_titles"
].join(",")

function buildWebsearchQuery(terms: string[], max = 15): string {
  return terms.slice(0, max).map(t => t.includes(" ") ? `"${t}"` : t).filter(Boolean).join(" OR ")
}

export async function POST(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { jd, offset: reqOffset = 0, limit: reqLimit = 100, filters = {} } = body
  if (!jd?.trim()) return NextResponse.json({ error: "Job description required" }, { status: 400 })

  const offset = parseInt(reqOffset, 10) || 0
  const limit  = parseInt(reqLimit, 10) || 100

  // 1. Extract criteria + embedding in parallel
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const prompt = `Analyze this job description and extract key hiring criteria for candidate matching.
JD: """${jd.slice(0, 3000)}"""
Return ONLY valid JSON:
{"title": string, "required_skills": string[], "preferred_skills": string[], "min_experience_years": number|null, "location": string|null, "key_keywords": string[]}`

  const [criteriaResult, embedding] = await Promise.all([
    model.generateContent(prompt).then(r => {
      const text = r.response.text().replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(text)
    }).catch(() => ({ title: "", required_skills: [], preferred_skills: [], key_keywords: [] })),
    generateEmbedding(jd.slice(0, 7000)).catch(() => [] as number[]),
  ])

  const criteria = criteriaResult

  // 2. Build websearch query from extracted keywords
  const allKeyTerms = [...(criteria.required_skills || []), ...(criteria.key_keywords || []), criteria.title || ""].filter(Boolean)
  const websearchQ = buildWebsearchQuery(allKeyTerms, 15).replace(/[()]/g, " ").trim()

  // 3. Map both JD criteria and Frontend Filters to RPC filters
  const rpcFilters: any = {}
  
  // From JD Extracted Criteria
  if (criteria.location) rpcFilters.location = criteria.location
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

  // 5. Run RPC (fetch a large pool to score properly, like admin portal)
  const { data, error } = await supabaseAdmin.rpc("search_candidates_v2", {
    p_query_text: websearchQ,
    p_query_embedding: embedding.length ? embedding : null,
    p_match_threshold: 0.15, // lower threshold to get more candidates in the pool
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
      const finalScore = Math.max(
        calculatedScore,
        rawCandidate.match_score ? rawCandidate.match_score * 100 : 0
      )
      return { ...maskCandidate(rawCandidate, unlockedSet.has(rawCandidate.id)), match_score: Math.round(finalScore) }
    })
    .filter((c: any) => c.match_score >= 12) // Filter out low relevance candidates
  
  // Sort by the newly calculated match score
  results.sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0))

  // clamp max score to 100
  results = results.map((c: any) => ({ ...c, match_score: Math.min(100, c.match_score) }))

  // Apply JS sidebar filters
  results = applySidebarFilters(results, filters)

  const total = results.length
  
  // Apply pagination
  const paginatedResults = results.slice(offset, offset + limit)

  return NextResponse.json({ results: paginatedResults, criteria, total, offset })
}
