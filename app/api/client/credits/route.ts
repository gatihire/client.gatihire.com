import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"
import { sendCreditRequestNotification } from "@/lib/mailer"

export async function GET(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [{ data: credits }, { data: transactions }, { data: requests }] = await Promise.all([
    supabaseAdmin.from("client_credits").select("*").eq("client_id", ctx.clientId).single(),
    supabaseAdmin.from("client_credit_transactions").select("*").eq("client_id", ctx.clientId).order("created_at", { ascending: false }).limit(20),
    supabaseAdmin.from("client_credit_requests").select("*").eq("client_id", ctx.clientId).order("created_at", { ascending: false }).limit(10)
  ])

  return NextResponse.json({
    credits: credits || { job_post_credits: 0, profile_unlock_credits: 3 },
    transactions: transactions || [],
    requests: requests || []
  })
}

export async function POST(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { request_type, requested_amount, message } = await request.json()
  if (!request_type || !requested_amount || requested_amount < 1) {
    return NextResponse.json({ error: "request_type and requested_amount required" }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from("client_credit_requests").insert({
    client_id: ctx.clientId,
    request_type,
    requested_amount: Number(requested_amount),
    message: message?.trim() || null,
    status: "pending"
  })

  if (error) return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })

  // Fetch client info for notification email
  try {
    const { data: clientRow } = await supabaseAdmin
      .from("clients")
      .select("name, primary_contact_email")
      .eq("id", ctx.clientId)
      .single()

    const clientName = clientRow?.name || ctx.clientId
    const clientEmail = clientRow?.primary_contact_email || ctx.userEmail || "unknown"
    const adminUrl = process.env.ADMIN_PORTAL_URL || "https://admin.gatihire.com/clients"

    await sendCreditRequestNotification({
      clientName,
      clientEmail,
      requestType: request_type,
      requestedAmount: Number(requested_amount),
      message: message?.trim(),
      adminUrl,
    })
  } catch (mailErr) {
    // Don't fail the request if email fails — just log
    console.error("[credits] Email notification failed:", mailErr)
  }

  return NextResponse.json({ success: true })
}
