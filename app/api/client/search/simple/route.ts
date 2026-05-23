import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext, maskCandidate } from "@/lib/clientAuth"
import { searchRL } from "@/lib/rateLimit"

// ── Candidate SELECT columns ─────────────────────────────────────────────────
const CANDIDATE_SELECT = [
  "id", "name", "email", "phone", "current_role", "current_company",
  "location", "total_experience", "highest_qualification", "degree",
  "university", "education_year", "technical_skills", "soft_skills",
  "current_salary", "expected_salary", "linkedin_profile", "file_url",
  "file_name", "file_type", "gender", "summary", "notice_period",
  "previous_companies", "job_titles"
].join(",")

// ── Role synonym expansion ────────────────────────────────────────────────────
const ROLE_SYNONYMS: Record<string, string[]> = {
  "fleet manager": ["fleet management", "transportation manager", "logistics manager", "operations manager", "fleet operations manager", "transport manager", "fleet supervisor"],
  "truck driver": ["driver", "heavy vehicle driver", "commercial driver", "truck operator", "hgv driver", "trailer driver", "vehicle driver"],
  "logistics coordinator": ["logistics executive", "supply chain coordinator", "logistics specialist", "transport coordinator", "dispatch executive"],
  "operations manager": ["operations executive", "operations head", "operations supervisor", "fleet manager", "branch manager"],
  "accounts manager": ["accountant", "finance manager", "finance executive", "accounts executive", "billing executive"],
  "supply chain": ["procurement", "warehouse", "inventory", "logistics", "distribution"],
  "driver": ["truck driver", "vehicle operator", "commercial driver", "HGV", "LGV", "delivery driver"],
  "dispatcher": ["dispatch executive", "dispatch coordinator", "fleet dispatcher", "logistics dispatcher"],
}

function expandRoleVariants(query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const out = new Set<string>([query.trim()])
  for (const [key, synonyms] of Object.entries(ROLE_SYNONYMS)) {
    if (q.includes(key) || key.includes(q)) synonyms.forEach(s => out.add(s))
  }
  return Array.from(out)
}

function buildWebsearchQuery(terms: string[], maxTerms = 15): string {
  return terms.slice(0, maxTerms).map(t => { const v = t.trim(); return v.includes(" ") ? `"${v}"` : v }).filter(Boolean).join(" OR ")
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
  const { query: q = "", offset = 0, limit = 20, filters = {} } = body

  if (!q.trim() && Object.keys(filters).length === 0) {
    return NextResponse.json({ results: [], total: 0, offset })
  }

  const { data: unlocked } = await supabaseAdmin.from("client_unlocked_candidates").select("candidate_id").eq("client_id", ctx.clientId)
  const unlockedSet = new Set((unlocked || []).map((u: any) => u.candidate_id))

  // Map frontend filters to RPC expected format
  const rpcFilters: any = {}
  if (filters.currentCity && filters.currentCity.length > 0) rpcFilters.currentCity = filters.currentCity
  if (filters.experience?.min) rpcFilters.exp_min = filters.experience.min
  if (filters.experience?.max) rpcFilters.exp_max = filters.experience.max
  if (filters.mustHaveKeywords && filters.mustHaveKeywords.length > 0) rpcFilters.must_kw = filters.mustHaveKeywords
  if (filters.excludeKeywords && filters.excludeKeywords.length > 0) rpcFilters.exclude_kw = filters.excludeKeywords
  if (filters.industries && filters.industries.length > 0) rpcFilters.industries = filters.industries
  if (filters.companies && filters.companies.length > 0) rpcFilters.companies = filters.companies
  if (filters.education && filters.education.length > 0) rpcFilters.education = filters.education

  // Run Hybrid Search RPC (Keyword Only)
  const { data, error } = await supabaseAdmin.rpc("search_candidates_hybrid", {
    p_query_text: buildWebsearchQuery(expandRoleVariants(q.trim())),
    p_query_embedding: null,
    p_match_threshold: 0,
    p_filters: rpcFilters,
    p_limit: limit,
    p_offset: offset
  })

  if (error) {
    console.error("Simple Search RPC Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const total = data && data.length > 0 ? Number(data[0].total_count) : 0

  let results = (data || []).map((row: any) => {
    const rawCandidate = row.candidate_data
    const finalScore = row.match_score * 100
    return { ...maskCandidate(rawCandidate, unlockedSet.has(rawCandidate.id)), match_score: Math.round(finalScore) }
  })

  return NextResponse.json({ results, total, offset })
}
