import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: jobId } = params
  const { candidate_ids, unlock_first, default_stage = "screening" } = await request.json()

  if (!candidate_ids || !Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return NextResponse.json({ error: "candidate_ids array is required" }, { status: 400 })
  }

  // Verify job belongs to client
  const { data: job } = await supabaseAdmin.from("jobs").select("id").eq("id", jobId).eq("client_id", ctx.clientId).maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  if (unlock_first) {
      // Deduct credits and insert to unlocked table
      const { data: creditsRow } = await supabaseAdmin
        .from("client_credits")
        .select("profile_unlock_credits")
        .eq("client_id", ctx.clientId)
        .single()
      const credits = creditsRow?.profile_unlock_credits || 0
      
      // Filter candidates that are already unlocked
      const { data: alreadyUnlocked } = await supabaseAdmin.from("client_unlocked_candidates").select("candidate_id").eq("client_id", ctx.clientId).in("candidate_id", candidate_ids)
      const alreadyUnlockedSet = new Set((alreadyUnlocked || []).map((u:any) => u.candidate_id))
      
      const toUnlock = candidate_ids.filter(id => !alreadyUnlockedSet.has(id))
      
      if (toUnlock.length > credits) {
          return NextResponse.json({ error: `Not enough credits. You need ${toUnlock.length} but have ${credits}.` }, { status: 400 })
      }
      
      if (toUnlock.length > 0) {
          // update credits
          await supabaseAdmin
            .from("client_credits")
            .update({ profile_unlock_credits: credits - toUnlock.length, updated_at: new Date().toISOString() })
            .eq("client_id", ctx.clientId)
          
          // insert unlocks
          const unlocks = toUnlock.map(id => ({ client_id: ctx.clientId, candidate_id: id }))
          await supabaseAdmin.from("client_unlocked_candidates").insert(unlocks)

          // job-scoped unlocks for this job
          const jobUnlocks = toUnlock.map((id: string) => ({ client_id: ctx.clientId, job_id: jobId, candidate_id: id, source: "suggested" }))
          await supabaseAdmin.from("client_job_unlocked_candidates").upsert(jobUnlocks as any, { onConflict: "client_id,job_id,candidate_id" })
      }
  }

  // Create applications for all candidate_ids if they don't exist
  // UPSERT: on conflict (job_id, candidate_id) do update set status = default_stage
  const inserts = candidate_ids.map(id => ({
      job_id: jobId,
      candidate_id: id,
      status: default_stage,
      source: 'client_added'
  }))

  const { error } = await supabaseAdmin.from("applications").upsert(inserts, { onConflict: 'job_id, candidate_id' })

  if (error) {
      console.error("Batch add to pipeline error:", error)
      return NextResponse.json({ error: "Failed to add to pipeline" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}