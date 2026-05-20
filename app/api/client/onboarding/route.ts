import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"
import { uploadClientLogoToSupabase, ensureClientLogosBucketExists } from "@/lib/supabase-storage-utils"

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_")
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
    if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const contentType = request.headers.get("content-type") || ""
    let body: any = {}
    let logoFile: File | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      body = {
        name: formData.get("name") as string,
        company_type: formData.get("company_type") as string,
        company_subtype: formData.get("company_subtype") as string,
        location: formData.get("location") as string,
        website: formData.get("website") as string,
        about: formData.get("about") as string,
        primary_contact_name: formData.get("primary_contact_name") as string,
        primary_contact_email: formData.get("primary_contact_email") as string,
        primary_contact_phone: formData.get("primary_contact_phone") as string,
      }
      logoFile = formData.get("logo") as File | null
    } else {
      body = await request.json()
    }

    const {
      name, company_type, company_subtype,
      location, website, about,
      primary_contact_name, primary_contact_email, primary_contact_phone
    } = body

    if (!name?.trim() || !company_type || !website?.trim()) {
      return NextResponse.json({ error: "Company name, type, and website are required" }, { status: 400 })
    }

    // Upsert client record
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    const uniqueSlug = `${slug}-${user.id.slice(0, 6)}`

    const { data: client, error: clientErr } = await supabaseAdmin
      .from("clients")
      .insert({
        name: name.trim(),
        slug: uniqueSlug,
        company_type,
        company_subtype: company_subtype || null,
        location: location?.trim() || null,
        website: website.trim(),
        about: about?.trim() || null,
        primary_contact_name: primary_contact_name?.trim() || null,
        primary_contact_email: primary_contact_email?.trim() || null,
        primary_contact_phone: primary_contact_phone?.trim() || null
      })
      .select("id")
      .single()

    if (clientErr) {
      // If slug conflict, try with full user id suffix
      const { data: client2, error: clientErr2 } = await supabaseAdmin
        .from("clients")
        .insert({
          name: name.trim(),
          slug: `${slug}-${user.id.slice(0, 12)}`,
          company_type,
          company_subtype: company_subtype || null,
          location: location?.trim() || null,
          website: website.trim(),
          about: about?.trim() || null,
          primary_contact_name: primary_contact_name?.trim() || null,
          primary_contact_email: primary_contact_email?.trim() || null,
          primary_contact_phone: primary_contact_phone?.trim() || null
        })
        .select("id")
        .single()
      if (clientErr2) return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
      Object.assign(client ?? {}, client2)
    }

    const clientId = (client as any)?.id
    if (!clientId) return NextResponse.json({ error: "Failed to create company" }, { status: 500 })

    // Create client_users record
    const { error: cuErr } = await supabaseAdmin
      .from("client_users")
      .upsert({
        auth_user_id: user.id,
        client_id: clientId,
        role: "owner",
        onboarding_completed: true
      }, { onConflict: "auth_user_id" })

    if (cuErr) return NextResponse.json({ error: "Failed to link user to company" }, { status: 500 })

    // Upload logo if present
    if (logoFile) {
      await ensureClientLogosBucketExists()
      const filePath = `clients/${clientId}/${Date.now()}_${sanitizeName(logoFile.name)}`
      try {
        const { url } = await uploadClientLogoToSupabase(logoFile, filePath)
        await supabaseAdmin.from("clients").update({ logo_url: url }).eq("id", clientId)
      } catch (err) {
        console.error("Logo upload failed during onboarding:", err)
        // We do not fail the onboarding entirely if logo fails
      }
    }

    // Initialize credits (3 free profile unlocks)
    await supabaseAdmin
      .from("client_credits")
      .upsert({
        client_id: clientId,
        job_post_credits: 0,
        profile_unlock_credits: 3
      }, { onConflict: "client_id" })

    // Log initial credit grant
    await supabaseAdmin
      .from("client_credit_transactions")
      .insert({
        client_id: clientId,
        type: "grant_unlock",
        amount: 3,
        note: "Welcome bonus — 3 free profile unlocks"
      })

    return NextResponse.json({ success: true, clientId })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 })
  }
}
