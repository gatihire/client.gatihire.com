import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"

// Lazy-loads work_experience and education rows for a candidate
// Only called when the ProfileDrawer opens — avoids N+1 queries during search
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const candidateId = params.id
  if (!candidateId) return NextResponse.json({ error: "candidate_id required" }, { status: 400 })

  // Fetch work experience + education in parallel
  const [workResult, eduResult] = await Promise.all([
    supabaseAdmin
      .from("work_experience")
      .select("id,company,role,duration,location,description,responsibilities,start_date,end_date,is_current")
      .eq("candidate_id", candidateId)
      .order("is_current", { ascending: false })
      .order("start_date", { ascending: false }),
    supabaseAdmin
      .from("education")
      .select("id,degree,specialization,institution,year,percentage,description,is_highest,start_date,end_date")
      .eq("candidate_id", candidateId)
      .order("is_highest", { ascending: false })
      .order("year", { ascending: false }),
  ])

  return NextResponse.json({
    work_experience: workResult.data || [],
    education: eduResult.data || [],
  })
}
