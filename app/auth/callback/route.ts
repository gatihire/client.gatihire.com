import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("returnTo") || "/dashboard"
  
  // Use requestUrl.origin as the primary source of truth for the redirect.
  // This ensures we stay on the same domain (client.gatihire.com vs localhost)
  const origin = requestUrl.origin

  if (code) {
    // Create base response. Supabase client will attach cookies to this.
    let response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          }
        }
      }
    )

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Use supabaseAdmin to bypass RLS since client_users might not have an RLS policy
      const { supabaseAdmin } = await import("@/lib/supabaseAdmin")
      const { data: clientUser } = await supabaseAdmin
        .from("client_users")
        .select("onboarding_completed")
        .eq("auth_user_id", data.session.user.id)
        .maybeSingle()

      if (!clientUser || !clientUser.onboarding_completed) {
        // If they need onboarding, change the redirect destination
        // but carry over the cookies that Supabase just set!
        const finalResponse = NextResponse.redirect(`${origin}/onboarding`)
        response.cookies.getAll().forEach(c => {
          finalResponse.cookies.set(c.name, c.value)
        })
        return finalResponse
      }
      
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
