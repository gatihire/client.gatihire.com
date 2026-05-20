import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"

const DEFAULT_STAGES = [
  { slug: "new", name: "New" },
  { slug: "hold", name: "Hold" },
  { slug: "screening", name: "Screening" },
  { slug: "interview", name: "Interview" },
  { slug: "rejected", name: "Reject" },
]

const MAX_STAGES = 12

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const jobId = params.id

  const { data: job } = await supabaseAdmin.from("jobs").select("id").eq("id", jobId).eq("client_id", ctx.clientId).maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  // Ensure defaults exist (idempotent)
  const { data: existing } = await supabaseAdmin
    .from("job_pipeline_stages")
    .select("id, slug")
    .eq("client_id", ctx.clientId)
    .eq("job_id", jobId)

  const existingSlugs = new Set((existing || []).map((s: any) => s.slug))
  const missing = DEFAULT_STAGES.filter((s) => !existingSlugs.has(s.slug))
  if (missing.length) {
    const inserts = missing.map((s, idx) => ({
      client_id: ctx.clientId,
      job_id: jobId,
      slug: s.slug,
      name: s.name,
      position: idx,
      is_default: true,
    }))
    await supabaseAdmin.from("job_pipeline_stages").insert(inserts)
  }

  const { data: stages, error } = await supabaseAdmin
    .from("job_pipeline_stages")
    .select("id, slug, name, position, is_default, created_at")
    .eq("client_id", ctx.clientId)
    .eq("job_id", jobId)
    .order("position", { ascending: true })

  if (error) {
    console.error("Error fetching stages:", error)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  return NextResponse.json({ stages: stages || [], max: MAX_STAGES })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const jobId = params.id
  const { data: job } = await supabaseAdmin.from("jobs").select("id").eq("id", jobId).eq("client_id", ctx.clientId).maybeSingle()
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const name = String(body?.name || "").trim()
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

  const slugBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40)

  const { data: stages } = await supabaseAdmin
    .from("job_pipeline_stages")
    .select("id, slug, position")
    .eq("client_id", ctx.clientId)
    .eq("job_id", jobId)

  const count = (stages || []).length
  if (count >= MAX_STAGES) return NextResponse.json({ error: `Stage limit reached (${MAX_STAGES})` }, { status: 400 })

  const taken = new Set((stages || []).map((s: any) => s.slug))
  let slug = slugBase || "stage"
  if (taken.has(slug)) {
    let i = 2
    while (taken.has(`${slug}-${i}`)) i++
    slug = `${slug}-${i}`
  }

  const position = Math.max(-1, ...(stages || []).map((s: any) => s.position ?? -1)) + 1

  const { data: inserted, error } = await supabaseAdmin
    .from("job_pipeline_stages")
    .insert({
      client_id: ctx.clientId,
      job_id: jobId,
      slug,
      name,
      position,
      is_default: false,
    })
    .select("id, slug, name, position, is_default, created_at")
    .single()

  if (error) {
    console.error("Error creating stage:", error)
    return NextResponse.json({ error: "Create failed" }, { status: 500 })
  }

  return NextResponse.json({ stage: inserted })
}

