import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext, maskCandidate } from "@/lib/clientAuth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const jobId = params.id

  // Verify job belongs to client
  const { data: job } = await supabaseAdmin.from("jobs").select("id").eq("id", jobId).eq("client_id", ctx.clientId).maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  const { data: rows, error } = await supabaseAdmin
    .from("client_job_unlocked_candidates")
    .select(
      `
      candidate_id,
      unlocked_at,
      candidates (*)
    `
    )
    .eq("client_id", ctx.clientId)
    .eq("job_id", jobId)
    .order("unlocked_at", { ascending: false })

  if (error) {
    console.error("Error fetching job unlocked profiles:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  // Job unlocked tab should show full profiles (they are globally unlocked already)
  const results = (rows || [])
    .map((r: any) => {
      const rawCandidate = r.candidates
      if (!rawCandidate) return null
      return { ...maskCandidate(rawCandidate, true), unlocked_at: r.unlocked_at }
    })
    .filter(Boolean)

  return NextResponse.json({ profiles: results })
}

