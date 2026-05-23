import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"

export async function GET(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: jobs } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("client_id", ctx.clientId)
    .order("created_at", { ascending: false })

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ jobs: [] })
  }

  const jobIds = jobs.map(j => j.id)

  const [appStats, matchStats] = await Promise.all([
    supabaseAdmin
      .from("applications")
      .select("job_id, status")
      .in("job_id", jobIds),
    supabaseAdmin
      .from("job_match_runs")
      .select("job_id, total_matches, last_matched_at")
      .in("job_id", jobIds)
  ])

  const matchStatsMap = new Map((matchStats.data || []).map((m: any) => [m.job_id, m]))

  const jobsWithStats = jobs.map(job => {
    const jobApps = (appStats.data || []).filter((a: any) => a.job_id === job.id)
    const totalApplicants = jobApps.length
    const newApplicants = jobApps.filter((a: any) => a.status === "new" || a.status === "pending").length
    const run = matchStatsMap.get(job.id)
    return {
      ...job,
      totalApplicants,
      newApplicants,
      match_count: run?.total_matches || 0,
      last_matched_at: run?.last_matched_at || null,
      needs_matchmaking: !run || !run.total_matches
    }
  })

  return NextResponse.json({ jobs: jobsWithStats })
}

export async function POST(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check job post credits
  const { data: credits } = await supabaseAdmin
    .from("client_credits").select("job_post_credits").eq("client_id", ctx.clientId).single()

  if (!credits || credits.job_post_credits < 1) {
    return NextResponse.json({ error: "Insufficient job post credits. Request more from the Credits page." }, { status: 402 })
  }

  const body = await request.json()
  const { 
    title, location, description,
    industry, sub_category, city, apply_type, external_apply_url,
    salary_type, salary_min, salary_max, shift_type, employment_type,
    urgency_tag, openings, education_min, experience_min_years, experience_max_years,
    languages_required, english_level, license_type, age_min, age_max,
    gender_preference, role_category, department_category,
    skills_must_have, skills_good_to_have, source, is_external_link,
    external_link, auto_matchmaking_enabled, messaging_preferences, sections
  } = body

  if (!title?.trim() || !location?.trim()) {
    return NextResponse.json({ error: "Title and location are required" }, { status: 400 })
  }

  const normalizeOptionalString = (value: unknown) => {
    if (typeof value !== "string") return null
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  }

  const normalizedEmploymentType = typeof employment_type === "string" ? employment_type : null
  const normalizedShiftType = typeof shift_type === "string" ? shift_type : null
  const normalizedSalaryType = typeof salary_type === "string" ? salary_type : null
  const normalizedOpenings = typeof openings === "number" ? openings : null
  const normalizedApplyType = apply_type === "external" ? "external" : "in_platform"
  const normalizedExternalApplyUrl = normalizeOptionalString(external_apply_url)
  const safeArray = (v: any): any[] | null => (Array.isArray(v) ? v.filter((x) => x !== null && x !== undefined) : null)

  const { data: job, error } = await supabaseAdmin
    .from("jobs")
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      location: location.trim(),
      industry: normalizeOptionalString(industry),
      sub_category: normalizeOptionalString(sub_category),
      city: normalizeOptionalString(city),
      apply_type: normalizedApplyType,
      external_apply_url: normalizedApplyType === "external" ? normalizedExternalApplyUrl : null,
      salary_type: normalizedSalaryType,
      salary_min: typeof salary_min === "number" ? salary_min : null,
      salary_max: typeof salary_max === "number" ? salary_max : null,
      shift_type: normalizedShiftType,
      employment_type: normalizedEmploymentType,
      urgency_tag: normalizeOptionalString(urgency_tag),
      openings: normalizedOpenings,
      education_min: normalizeOptionalString(education_min),
      experience_min_years: typeof experience_min_years === "number" ? experience_min_years : null,
      experience_max_years: typeof experience_max_years === "number" ? experience_max_years : null,
      languages_required: safeArray(languages_required),
      english_level: normalizeOptionalString(english_level),
      license_type: normalizeOptionalString(license_type),
      age_min: typeof age_min === "number" ? age_min : null,
      age_max: typeof age_max === "number" ? age_max : null,
      gender_preference: normalizeOptionalString(gender_preference),
      role_category: normalizeOptionalString(role_category),
      department_category: normalizeOptionalString(department_category),
      skills_must_have: safeArray(skills_must_have),
      skills_good_to_have: safeArray(skills_good_to_have),
      source: normalizeOptionalString(source) || "truckinzy",
      is_external_link: is_external_link === true,
      external_link: is_external_link === true ? normalizeOptionalString(external_link) : null,
      auto_matchmaking_enabled: auto_matchmaking_enabled !== false,
      messaging_preferences: normalizeOptionalString(messaging_preferences) || "both",
      client_id: ctx.clientId,
      status: "open",
      created_by: ctx.user.id
    })
    .select("id").single()

  if (error) {
    console.error("Job creation error:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }

  const jobId = job.id

  if (Array.isArray(sections) && sections.length > 0) {
    try {
      const rows = sections
        .filter((s: any) => s && typeof s.section_key === "string" && typeof s.heading === "string" && typeof s.body_md === "string")
        .map((s: any, idx: number) => ({
          job_id: jobId,
          section_key: s.section_key,
          heading: s.heading,
          body_md: s.body_md,
          sort_order: typeof s.sort_order === "number" ? s.sort_order : idx,
          is_visible: typeof s.is_visible === "boolean" ? s.is_visible : true,
        }))
      if (rows.length) {
        await supabaseAdmin.from("job_sections").insert(rows)
      }
    } catch (e) {
      console.warn("Failed to save job sections:", e)
    }
  }

  // Deduct 1 job post credit
  await supabaseAdmin.from("client_credits")
    .update({ job_post_credits: credits.job_post_credits - 1, updated_at: new Date().toISOString() })
    .eq("client_id", ctx.clientId)

  await supabaseAdmin.from("client_credit_transactions").insert({
    client_id: ctx.clientId, type: "use_job", amount: -1, note: `Job posted: ${title}`
  })

  return NextResponse.json({ job, success: true })
}
