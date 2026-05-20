import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"

export async function GET(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profiles, error } = await supabaseAdmin
    .from("client_unlocked_candidates")
    .select(`
      id,
      candidate_id,
      unlocked_at,
      candidates!candidate_id(
        id, name, email, phone, current_role, location,
        total_experience, degree, university, technical_skills,
        file_url, linkedin_profile
      )
    `)
    .eq("client_id", ctx.clientId)
    .order("unlocked_at", { ascending: false })

  if (error) return NextResponse.json({ error: "Failed to load" }, { status: 500 })

  return NextResponse.json({ profiles: profiles || [] })
}
