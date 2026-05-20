import { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function getClientContext(request: NextRequest) {
  const token = (request.headers.get("authorization") || "").replace("Bearer ", "")
  if (!token) return null
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null
  const { data: cu } = await supabaseAdmin
    .from("client_users")
    .select("client_id, onboarding_completed")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (!cu?.onboarding_completed) return null
  return { user, clientId: cu.client_id, userEmail: user.email }
}

// Returns "B Sikder" format (first initial + full last name)
function maskCandidate(c: any, isUnlocked: boolean) {
  const nameParts = (c.name || "").split(" ").filter(Boolean)
  const displayName = nameParts.length >= 2
    ? `${nameParts[0][0]} ${nameParts[nameParts.length - 1]}`
    : nameParts[0] || "—"

  return {
    id: c.id,
    // Always show abbreviated name; spread full name below if unlocked
    initials: displayName,
    current_role: c.current_role,
    location: c.location,
    total_experience: c.total_experience,
    highest_qualification: c.highest_qualification,
    degree: c.degree,
    university: c.university,
    education_year: c.education_year,
    technical_skills: c.technical_skills,
    soft_skills: c.soft_skills,
    current_salary: c.current_salary,
    expected_salary: c.expected_salary,
    is_unlocked: isUnlocked,
    // Preview fields — safe to expose before unlock (no PII)
    current_company: c.current_company || null,
    summary: c.summary || null,
    notice_period: c.notice_period || null,
    previous_companies: Array.isArray(c.previous_companies) ? c.previous_companies : [],
    job_titles: Array.isArray(c.job_titles) ? c.job_titles : [],
    // Full PII only if unlocked
    ...(isUnlocked ? {
      name: c.name,
      email: c.email,
      phone: c.phone,
      linkedin_profile: c.linkedin_profile,
      file_url: c.file_url,
      file_name: c.file_name,
      file_type: c.file_type,
    } : {}),
  }
}

export { maskCandidate }
