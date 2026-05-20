import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"

export async function POST(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { candidate_id, job_id, source } = await request.json()
  if (!candidate_id) return NextResponse.json({ error: "candidate_id required" }, { status: 400 })

  // Check credits
  const { data: credits } = await supabaseAdmin
    .from("client_credits")
    .select("profile_unlock_credits")
    .eq("client_id", ctx.clientId)
    .single()

  if (!credits || credits.profile_unlock_credits < 1) {
    return NextResponse.json({ error: "Insufficient profile unlock credits. Request more from the Credits page." }, { status: 402 })
  }

  // Check if already unlocked
  const { data: existing } = await supabaseAdmin
    .from("client_unlocked_candidates")
    .select("id")
    .eq("client_id", ctx.clientId)
    .eq("candidate_id", candidate_id)
    .maybeSingle()

  if (existing) {
    // Already unlocked — return full profile without charging
    const { data: candidate } = await supabaseAdmin
      .from("candidates")
      .select("id,name,email,phone,current_role,location,total_experience,highest_qualification,degree,university,technical_skills,soft_skills,linkedin_profile,github_profile,portfolio_url,file_url,current_salary,expected_salary,summary")
      .eq("id", candidate_id)
      .single()
    return NextResponse.json({ candidate, already_unlocked: true })
  }

  // Deduct 1 unlock credit
  const { error: updateErr } = await supabaseAdmin
    .from("client_credits")
    .update({ profile_unlock_credits: credits.profile_unlock_credits - 1, updated_at: new Date().toISOString() })
    .eq("client_id", ctx.clientId)

  if (updateErr) return NextResponse.json({ error: "Failed to deduct credit" }, { status: 500 })

  // Log transaction
  await supabaseAdmin.from("client_credit_transactions").insert({
    client_id: ctx.clientId,
    type: "use_unlock",
    amount: -1,
    note: `Profile unlock — candidate ${candidate_id}`
  })

  // Save unlock record
  await supabaseAdmin.from("client_unlocked_candidates").insert({
    client_id: ctx.clientId,
    candidate_id
  })

  // Optionally track job-scoped unlocks (used by Job Dashboard "Unlocked Profiles" tab)
  if (job_id) {
    await supabaseAdmin.from("client_job_unlocked_candidates").upsert(
      {
        client_id: ctx.clientId,
        job_id,
        candidate_id,
        source: typeof source === "string" ? source : "suggested",
      } as any,
      { onConflict: "client_id,job_id,candidate_id" }
    )
  }

  // Return full candidate data
  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id,name,email,phone,current_role,location,total_experience,highest_qualification,degree,university,technical_skills,soft_skills,linkedin_profile,github_profile,portfolio_url,file_url,current_salary,expected_salary,summary")
    .eq("id", candidate_id)
    .single()

  return NextResponse.json({ candidate, already_unlocked: false })
}
