import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const cacheKey = `job:${params.id}`
  let jobData = null

  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      jobData = await redis.get(cacheKey)
    }
  } catch (e) {
    console.error("Redis get error:", e)
  }

  if (!jobData) {
    const { data: job, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", params.id)
      .eq("client_id", ctx.clientId)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    jobData = job
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        await redis.set(cacheKey, JSON.stringify(jobData), { ex: 3600 }) // Cache for 1 hour
      }
    } catch (e) {
      console.error("Redis set error:", e)
    }
  } else if (typeof jobData === 'string') {
    jobData = JSON.parse(jobData)
  }

  return NextResponse.json({ job: jobData })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  
  // Clean up body fields that shouldn't be updated or are not in DB schema
  const updates = { ...body }
  delete updates.id
  delete updates.client_id
  delete updates.created_at
  delete updates.created_by

  const { data: job, error } = await supabaseAdmin
    .from("jobs")
    .update(updates)
    .eq("id", params.id)
    .eq("client_id", ctx.clientId)
    .select()
    .single()

  if (error || !job) {
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }

  // Invalidate cache
  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      await redis.del(`job:${params.id}`)
    }
  } catch (e) {
    console.error("Redis del error:", e)
  }

  return NextResponse.json({ job, success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { error } = await supabaseAdmin
    .from("jobs")
    .delete()
    .eq("id", params.id)
    .eq("client_id", ctx.clientId)

  if (error) {
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }

  // Invalidate cache
  try {
    if (process.env.UPSTASH_REDIS_REST_URL) {
      await redis.del(`job:${params.id}`)
    }
  } catch (e) {
    console.error("Redis del error:", e)
  }

  return NextResponse.json({ success: true })
}
