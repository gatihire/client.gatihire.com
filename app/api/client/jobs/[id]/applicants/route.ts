import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Verify this job belongs to this client
  const { data: job } = await supabaseAdmin
    .from("jobs").select("id").eq("id", params.id).eq("client_id", ctx.clientId).maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  const { data: applicants, error } = await supabaseAdmin
    .from("applications")
    .select(`
      id, status, applied_at, notes, source, match_score,
      candidates (
        id, name, email, phone, current_role, current_company, location, total_experience,
        desired_role, preferred_location, current_salary, expected_salary, notice_period,
        highest_qualification, degree, specialization, university, education_year,
        summary, linkedin_profile, portfolio_url, github_profile,
        technical_skills, soft_skills, languages_known, certifications,
        file_name, file_url, file_size, file_type
      )
    `)
    .eq("job_id", params.id)
    .order("applied_at", { ascending: false })

  if (error) {
    console.error("Error fetching applicants:", error)
  }

  return NextResponse.json({ applicants: applicants || [] })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: job } = await supabaseAdmin
    .from("jobs").select("id").eq("id", params.id).eq("client_id", ctx.clientId).maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  const { application_id, status, notes } = await request.json()
  if (!application_id) return NextResponse.json({ error: "application_id required" }, { status: 400 })

  const updates: Record<string, any> = {}
  if (status) updates.status = status
  if (notes !== undefined) updates.notes = notes

  const { error } = await supabaseAdmin
    .from("applications")
    .update(updates)
    .eq("id", application_id)
    .eq("job_id", params.id)

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 })
  return NextResponse.json({ success: true })
}
