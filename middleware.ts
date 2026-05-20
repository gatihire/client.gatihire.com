import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        }
      }
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthed = Boolean(user)
  const { pathname } = request.nextUrl

  // Auth callback — always allow
  if (pathname.startsWith("/auth/callback")) return supabaseResponse

  // Redirect root
  if (pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = isAuthed ? "/dashboard" : "/auth/login"
    return NextResponse.redirect(url)
  }

  // Already authed trying to hit auth pages → go to dashboard
  // BUT never redirect away from /auth/callback — it handles its own logic
  if (pathname.startsWith("/auth") && !pathname.startsWith("/auth/callback") && isAuthed) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  // Protected routes — require auth
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
    if (!isAuthed) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("returnTo", pathname)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
}
