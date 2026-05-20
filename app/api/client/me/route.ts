import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

async function getClientFromToken(token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !user) return null

  const { data: clientUser } = await supabaseAdmin
    .from("client_users")
    .select("client_id, role, onboarding_completed")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!clientUser) return null
  return { user, clientUser }
}

export async function GET(request: NextRequest) {
  const token = (request.headers.get("authorization") || "").replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ctx = await getClientFromToken(token)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { clientUser } = ctx

  const [{ data: client }, { data: credits }] = await Promise.all([
    supabaseAdmin.from("clients").select("id,name,slug,logo_url,industry,location,about").eq("id", clientUser.client_id).maybeSingle(),
    supabaseAdmin.from("client_credits").select("job_post_credits,profile_unlock_credits").eq("client_id", clientUser.client_id).maybeSingle()
  ])

  return NextResponse.json({
    client,
    credits: credits || { job_post_credits: 0, profile_unlock_credits: 0 },
    clientUser
  })
}
