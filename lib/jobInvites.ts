import { supabaseAdmin } from "./supabaseAdmin"
import { randomBytes } from "node:crypto"
import { sendInviteEmail } from "./mailer"

function nowIso() {
  return new Date().toISOString()
}

function createToken() {
  return randomBytes(24).toString("base64url")
}

export async function sendBulkJobInvites(
  jobId: string,
  candidates: any[],
  options?: {
    sendEmail?: boolean
    metadata?: Record<string, any>
  }
) {
  const { sendEmail = true, metadata = {} } = options || {}

  // Get job details
  const { data: job, error: jobError } = await supabaseAdmin
    .from("jobs")
    .select("title, client_name, description, location, salary_min, salary_max, experience_min_years, experience_max_years")
    .eq("id", jobId)
    .single()

  if (jobError || !job) {
    console.error("Job not found for invites:", jobError)
    return { success: false, error: "Job not found" }
  }

  const jobTitle = job.title || "a role"
  const companyName = job.client_name || "Truckinzy"
  const from = process.env.INVITES_FROM || process.env.POSTMARK_FROM || process.env.SMTP_USER || ""

  // Build experience and compensation strings
  let experience = ""
  if (job.experience_min_years && job.experience_max_years) {
    experience = `${job.experience_min_years}–${job.experience_max_years} years`
  } else if (job.experience_min_years) {
    experience = `${job.experience_min_years}+ years`
  }

  let compensation = ""
  if (job.salary_min && job.salary_max) {
    compensation = `₹${job.salary_min}–${job.salary_max} LPA`
  } else if (job.salary_min) {
    compensation = `₹${job.salary_min}+ LPA`
  }

  if (sendEmail && !from) {
    console.warn("No from email configured, skipping email sends")
  }

  const results: {
    candidateId: string | null
    email: string
    success: boolean
    error?: string
    inviteId?: string
    token?: string
  }[] = []

  for (const candidate of candidates) {
    const email = candidate.email?.toLowerCase().trim()
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      results.push({
        candidateId: candidate.id,
        email: email || "unknown",
        success: false,
        error: "Invalid or missing email"
      })
      continue
    }

    const token = createToken()
    try {
      const { data: invite, error: insertError } = await supabaseAdmin
        .from("job_invites")
        .insert({
          job_id: jobId,
          candidate_id: candidate.id,
          email,
          token,
          status: "sent",
          sent_at: nowIso(),
          created_at: nowIso(),
          updated_at: nowIso(),
          metadata: { source: "auto_matchmaking", ...metadata }
        })
        .select("id, token")
        .single()

      if (insertError) {
        // Check if invite already exists
        if (
          String(insertError.message).toLowerCase().includes("job_invites_job_email_unique") ||
          insertError.code === "23505"
        ) {
          results.push({
            candidateId: candidate.id,
            email,
            success: false,
            error: "Invite already sent"
          })
          continue
        }
        console.error("Failed to insert invite for", email, insertError)
        results.push({
          candidateId: candidate.id,
          email,
          success: false,
          error: insertError.message || "Failed to create invite"
        })
        continue
      }

      let emailSent = false
      if (sendEmail && from) {
        try {
          // Get board app base URL
          const baseUrl = process.env.NEXT_PUBLIC_BOARD_APP_BASE_URL || process.env.NEXT_PUBLIC_URL || "https://talent.gatihire.com"
          const inviteLink = `${baseUrl}/invite/${token}`

          const subject = `${companyName}: Invitation to apply — ${jobTitle}`

          await sendInviteEmail({
            to: email,
            from,
            subject,
            jobTitle,
            candidateName: candidate.name,
            inviteLink,
            companyName,
            jobDescription: job.description,
            location: job.location,
            experience,
            compensation,
            clientName: job.client_name
          })
          emailSent = true

          await supabaseAdmin
            .from("job_invites")
            .update({ sent_at: nowIso(), updated_at: nowIso() })
            .eq("id", invite.id)
        } catch (emailErr) {
          console.error("Failed to send email to", email, emailErr)
        }
      }

      results.push({
        candidateId: candidate.id,
        email,
        success: true,
        inviteId: invite.id,
        token,
        error: emailSent ? undefined : "Email not sent"
      })
    } catch (err) {
      console.error("Unexpected error sending invite to", email, err)
      results.push({
        candidateId: candidate.id,
        email,
        success: false,
        error: "Unexpected error"
      })
    }
  }

  const successCount = results.filter(r => r.success).length
  return { success: true, results, successCount }
}
