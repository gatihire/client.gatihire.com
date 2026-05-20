import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendCreditRequestNotification({
  clientName,
  clientEmail,
  requestType,
  requestedAmount,
  message,
  adminUrl,
}: {
  clientName: string
  clientEmail: string
  requestType: string
  requestedAmount: number
  message?: string
  adminUrl: string
}) {
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
