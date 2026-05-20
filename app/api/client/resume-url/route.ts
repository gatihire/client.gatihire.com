import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { getClientContext } from "@/lib/clientAuth"

// Returns a short-lived signed URL for a candidate's resume file
// Verifies the client has unlocked this candidate before signing
export async function POST(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { candidate_id } = await request.json()
  if (!candidate_id) return NextResponse.json({ error: "candidate_id required" }, { status: 400 })

  // Verify the candidate is unlocked by this client
  const { data: unlock } = await supabaseAdmin
    .from("client_unlocked_candidates")
    .select("id")
    .eq("client_id", ctx.clientId)
    .eq("candidate_id", candidate_id)
    .maybeSingle()

  if (!unlock) return NextResponse.json({ error: "Profile not unlocked" }, { status: 403 })

  // Get file info
  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("file_url, file_name, file_type")
    .eq("id", candidate_id)
    .single()

  if (!candidate?.file_url) return NextResponse.json({ error: "No resume file found" }, { status: 404 })

  // If the file_url is already a Supabase storage URL, try to extract path and sign it
  // Pattern: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const storageMatch = candidate.file_url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/)

  if (storageMatch) {
    const bucket = storageMatch[1]
    const filePath = storageMatch[2].split("?")[0] // strip any existing query params
    const { data: signed, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error || !signed?.signedUrl) {
      // Fall back to direct URL if signing fails
      return NextResponse.json({ url: candidate.file_url, file_name: candidate.file_name, file_type: candidate.file_type })
    }

    return NextResponse.json({
      url: signed.signedUrl,
      file_name: candidate.file_name,
      file_type: candidate.file_type,
    })
  }

  // Non-Supabase URL — return as-is
  return NextResponse.json({
    url: candidate.file_url,
    file_name: candidate.file_name,
    file_type: candidate.file_type,
  })
}
