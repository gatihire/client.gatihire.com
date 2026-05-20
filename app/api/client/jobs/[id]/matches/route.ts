import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext, maskCandidate } from "@/lib/clientAuth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: jobId } = params

  // 1. Verify job belongs to client
  const { data: job } = await supabaseAdmin.from("jobs").select("id, description").eq("id", jobId).eq("client_id", ctx.clientId).maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "25", 10)
  const offset = (page - 1) * limit

  // 2. Check if we have matches in job_matches table
  let { data: matches, count, error } = await supabaseAdmin
    .from("job_matches")
    .select(`
      candidate_id,
      relevance_score,
      candidates (*)
    `, { count: 'exact' })
    .eq("job_id", jobId)
    .order("relevance_score", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching job matches:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  // 3. If no matches found, we should run matchmaking and store
  if (!matches || matches.length === 0) {
    if (count === 0) {
        return NextResponse.json({ results: [], total: 0, needs_matchmaking: true })
    }
  }

  // 4. Get unlocked candidate ids
  const { data: unlocked } = await supabaseAdmin.from("client_unlocked_candidates").select("candidate_id").eq("client_id", ctx.clientId)
  const unlockedSet = new Set((unlocked || []).map((u: any) => u.candidate_id))

  // 5. Format results
  const results = (matches || []).map((m: any) => {
    const rawCandidate = m.candidates
    if (!rawCandidate) return null
    return { 
        ...maskCandidate(rawCandidate, unlockedSet.has(rawCandidate.id)), 
        match_score: m.relevance_score || 0 
    }
  }).filter(Boolean)

  return NextResponse.json({ results, total: count || 0, needs_matchmaking: false })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: jobId } = params

  const { data: job } = await supabaseAdmin.from("jobs").select("id, description").eq("id", jobId).eq("client_id", ctx.clientId).maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  if (!job.description) {
      return NextResponse.json({ error: "Job description is required for matchmaking" }, { status: 400 })
  }

  const baseUrl = request.nextUrl.origin
  const authHeader = request.headers.get("authorization") || ""
  const res = await fetch(`${baseUrl}/api/client/search/jd`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          // Forward client auth so getClientContext() succeeds
          "Authorization": authHeader,
      },
      body: JSON.stringify({ jd: job.description, limit: 100 })
  })
  
  if (!res.ok) {
      const errText = await res.text().catch(() => "")
      console.error("Matchmaking failed:", res.status, errText)
      return NextResponse.json({ error: "Failed to generate matches" }, { status: 500 })
  }

  const data = await res.json()
  const results = data.results || []

  if (results.length > 0) {
      const matchInserts = results.map((c: any) => ({
          job_id: jobId,
          candidate_id: c.id,
          relevance_score: c.match_score,
          source: 'client_auto_match'
      }))

      await supabaseAdmin.from("job_matches").upsert(matchInserts, { onConflict: 'job_id, candidate_id' })
  }

  return NextResponse.json({ success: true, count: results.length })
}