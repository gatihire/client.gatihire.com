import nodemailer from "nodemailer"

type SendInviteEmailInput = {
  to: string
  from: string
  subject: string
  jobTitle: string
  inviteLink: string
  candidateName?: string | null
  html?: string
  companyName?: string | null
  jobDescription?: string | null
  location?: string | null
  experience?: string | null
  compensation?: string | null
  clientName?: string | null
  phone?: string | null
  website?: string | null
}

type SendCreditRequestNotificationInput = {
  clientName: string
  clientEmail: string
  requestType: string
  requestedAmount: number
  message?: string
  adminUrl: string
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com"
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = process.env.SMTP_SECURE !== "false"
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  return { host, port, secure, user, pass }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

const transporter = nodemailer.createTransport(getSmtpConfig())

async function sendEmail(input: { to: string; from: string; subject: string; html: string }) {
  return transporter.sendMail(input)
}

export async function sendInviteEmail(input: SendInviteEmailInput) {
  const candidateGreeting = input.candidateName ? `Hi ${escapeHtml(input.candidateName)},` : "Hi,"
  const companyName = input.companyName || "GatiHire"
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 7) // Expires in 7 days
  const formattedExpiry = expiryDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

  // Extract 1-2 lines from job description
  let jobDescriptionSnippet = ""
  if (input.jobDescription) {
    const sentences = input.jobDescription.trim().split(/(?<=[.!?])\s+/).filter(s => s.length > 0)
    if (sentences.length > 0) {
      jobDescriptionSnippet = sentences.slice(0, 2).map(s => s.trim()).join(" ")
      if (jobDescriptionSnippet.length > 250) {
        jobDescriptionSnippet = jobDescriptionSnippet.substring(0, 247) + "..."
      }
    }
  }

  const defaultHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Job Invite from ${escapeHtml(companyName)}</title>
    <style>
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        line-height: 1.6;
        color: #111827;
        background-color: #f9fafb;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .header {
        margin-bottom: 24px;
      }
      .greeting {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px;
      }
      .lead {
        font-size: 16px;
        margin: 0 0 20px;
      }
      .snippet {
        background-color: #f3f4f6;
        padding: 16px;
        border-radius: 8px;
        margin: 0 0 24px;
      }
      .details {
        margin: 0 0 28px;
      }
      .detail-row {
        display: flex;
        gap: 8px;
        margin: 8px 0;
      }
      .detail-label {
        font-weight: 600;
        color: #4b5563;
        min-width: 100px;
      }
      .cta {
        display: inline-block;
        background-color: #4a6cf7;
        color: #ffffff !important;
        text-decoration: none !important;
        padding: 14px 32px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 20px;
      }
      .link-fallback {
        font-size: 14px;
        color: #6b7280;
        margin: 0 0 8px;
      }
      .link-url {
        color: #4a6cf7;
        word-break: break-all;
        font-size: 14px;
      }
      .expiry {
        margin: 20px 0;
        padding: 16px;
        background-color: #fff3cd;
        border-radius: 8px;
        border: 1px solid #ffc107;
      }
      .footer {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
      }
      .signature {
        margin: 0 0 8px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <p class="greeting">${candidateGreeting}</p>
      </div>
      <p class="lead">
        We came across your profile and were impressed by your background — it closely matches what we're looking for in our <strong>${escapeHtml(input.jobTitle)}</strong> role at <strong>${escapeHtml(companyName)}</strong>.
      </p>
      <p class="lead">
        A quick snapshot of the role:
      </p>
      ${jobDescriptionSnippet ? `
        <div class="snippet">
          ${escapeHtml(jobDescriptionSnippet)}
        </div>
      ` : ""}
      <div class="details">
        ${input.location ? `
          <div class="detail-row">
            <span class="detail-label">Location:</span>
            <span>${escapeHtml(input.location)}</span>
          </div>
        ` : ""}
        ${input.experience ? `
          <div class="detail-row">
            <span class="detail-label">Experience:</span>
            <span>${escapeHtml(input.experience)}</span>
          </div>
        ` : ""}
        ${input.compensation ? `
          <div class="detail-row">
            <span class="detail-label">Compensation:</span>
            <span>${escapeHtml(input.compensation)}</span>
          </div>
        ` : ""}
      </div>
      <p style="margin: 0 0 16px;">
        If this sounds like the right fit, we'd love to hear from you. Applying takes less than 2 minutes:
      </p>
      <a href="${escapeHtml(input.inviteLink)}" class="cta">
        View Invite & Apply
      </a>
      <p class="link-fallback">If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="link-url">${escapeHtml(input.inviteLink)}</p>
      <div class="expiry">
        This invitation is exclusive to you and expires on <strong>${escapeHtml(formattedExpiry)}</strong>, so don't wait too long!
      </div>
      <p style="margin: 0 0 24px;">
        Have questions before applying? Just reply to this email — we're happy to help.
      </p>
      <div class="footer">
        <p class="signature">Warm regards,</p>
        ${input.clientName ? `<p class="signature">${escapeHtml(input.clientName)}</p>` : ""}
        <p class="signature">Hiring Team, ${escapeHtml(companyName)}</p>
        ${input.phone || input.website ? `
          <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">
            ${input.phone ? `Phone: ${escapeHtml(input.phone)}` : ""}
            ${input.phone && input.website ? " | " : ""}
            ${input.website ? `<a href="${escapeHtml(input.website)}" style="color: #4a6cf7; text-decoration: none;">${escapeHtml(input.website)}</a>` : ""}
          </p>
        ` : ""}
      </div>
    </div>
  </body>
  </html>
  `.trim()

  let html = (input.html || "").trim()
  if (!html) {
    html = defaultHtml
  } else if (!html.includes(input.inviteLink)) {
    html = `
      ${html}
      <div style="margin-top:16px;color:#6b7280;font-size:13px">
        <p style="margin:0 0 4px;">If the button doesn’t work, copy and paste this link:</p>
        <p style="margin:0;color:#374151;word-break:break-all">${escapeHtml(input.inviteLink)}</p>
      </div>
    `.trim()
  }

  return sendEmail({ to: input.to, from: input.from, subject: input.subject, html })
}

export async function sendCreditRequestNotification({
  clientName,
  clientEmail,
  requestType,
  requestedAmount,
  message,
  adminUrl,
}: SendCreditRequestNotificationInput) {
  const from = process.env.INVITES_FROM || process.env.SMTP_USER
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER

  const subject = `🔔 Credit Request — ${clientName} wants ${requestedAmount} ${requestType === "profile_unlock" ? "unlock" : "job post"} credits`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f4f7; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0a0f1e 0%, #101828 100%); padding: 28px 32px; }
    .header-logo { font-size: 22px; font-weight: 700; color: #e8c96d; letter-spacing: -0.5px; }
    .header-sub { font-size: 11px; color: #5a637a; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; }
    .body { padding: 32px; }
    .alert-banner { background: #fff8e6; border: 1px solid #f0d88a; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
    .alert-icon { font-size: 24px; }
    .alert-text { font-size: 14px; color: #92400e; font-weight: 600; }
    .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .detail-table td { padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .detail-table td:first-child { color: #6b7280; width: 40%; }
    .detail-table td:last-child { color: #111827; font-weight: 500; }
    .message-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #374151; line-height: 1.6; }
    .cta-btn { display: inline-block; background: #e8c96d; color: #0a0f1e; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
    .footer { padding: 20px 32px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">GatiHire</div>
      <div class="header-sub">Admin Notification</div>
    </div>
    <div class="body">
      <div class="alert-banner">
        <div class="alert-icon">🔔</div>
        <div class="alert-text">New Credit Request Received</div>
      </div>

      <table class="detail-table">
        <tr><td>Client</td><td>${clientName}</td></tr>
        <tr><td>Email</td><td>${clientEmail}</td></tr>
        <tr><td>Request Type</td><td>${requestType === "profile_unlock" ? "Profile Unlock Credits" : "Job Post Credits"}</td></tr>
        <tr><td>Amount Requested</td><td><strong>${requestedAmount} credits</strong></td></tr>
        <tr><td>Received</td><td>${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td></tr>
      </table>

      ${message ? `<div class="message-box"><strong>Message from client:</strong><br/>${message}</div>` : ""}

      <p style="font-size:13px; color:#374151; margin-bottom:20px;">
        Please collect payment and then recharge this client's account from the Admin Portal → Clients → Credits section.
      </p>

      <a href="${adminUrl}" class="cta-btn">Open Admin Portal →</a>
    </div>
    <div class="footer">
      This is an automated notification from GatiHire. Do not reply to this email.
    </div>
  </div>
</body>
</html>
`

  await transporter.sendMail({
    from,
    to: adminEmail,
    subject,
    html,
  })
}
