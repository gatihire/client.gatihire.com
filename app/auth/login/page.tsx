"use client"

import React, { useState, Suspense, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/dashboard"

  const [mode, setMode] = useState<"options" | "email">("options")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  React.useEffect(() => {
    // Manually intercept hash fragment if present (e.g. from admin impersonation implicit grant)
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const access_token = hashParams.get("access_token")
      const refresh_token = hashParams.get("refresh_token")
      
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
          if (!error) {
            router.push(returnTo)
          } else {
            setError(error.message)
          }
        })
        return
      }
    }

    // Check if we already have a session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(returnTo)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        router.push(returnTo)
      }
    })
    return () => subscription.unsubscribe()
  }, [router, returnTo])

  const getRedirectBase = () =>
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "")

  const handleGoogle = async () => {
    const origin = getRedirectBase()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
      }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError("")
    const origin = getRedirectBase()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
      }
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden", fontFamily: "var(--font-body)" }}>

      {/* ── LEFT: Brand panel ── */}
      <div style={{
        flex: "0 0 44%",
        background: "#12151f",
        color: "#fff",
        padding: "36px 44px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative bg letter */}
        <div style={{
          position: "absolute", right: -60, top: 40,
          fontSize: 320, fontWeight: 800, color: "var(--gold)",
          opacity: 0.06, lineHeight: 1, pointerEvents: "none",
          fontFamily: "var(--font-display)", letterSpacing: "-0.04em",
          userSelect: "none",
        }}>g.</div>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: "var(--gold)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M7 21 L13 13 L13 18 L19 18 L19 13 L25 21"
                fill="none" stroke="#fff" strokeWidth="2.6"
                strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="21" r="1.6" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
            gatihire<span style={{ color: "var(--gold)" }}>.</span>
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Tagline */}
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          letterSpacing: ".1em", color: "rgba(255,255,255,.45)",
          marginBottom: 14, textTransform: "uppercase",
        }}>
          ★ India&apos;s Supply-Chain Hiring Network
        </div>
        <h2 style={{
          fontSize: 32, fontWeight: 800, margin: 0,
          letterSpacing: "-0.025em", lineHeight: 1.15, maxWidth: 380,
        }}>
          Hire warehouse, freight &amp; SCM talent{" "}
          <span style={{ color: "var(--gold)" }}>4× faster</span>.
        </h2>
        <p style={{
          color: "rgba(255,255,255,.65)", marginTop: 16,
          fontSize: 13.5, maxWidth: 360, lineHeight: 1.6,
        }}>
          Verified profiles. Industry-tagged. From TL on the floor to AGM Supply Chain — only logistics.
        </p>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 24, marginTop: 32,
          paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.10)",
        }}>
          {[
            ["1.2L+", "verified profiles"],
            ["340+", "client companies"],
            ["11 d", "median time-to-hire"],
          ].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{n}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.45)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Auth form ── */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 48px", background: "#ffffff",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>

          {/* Mobile Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }} className="sm:hidden">
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: "var(--gold)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M7 21 L13 13 L13 18 L19 18 L19 13 L25 21"
                  fill="none" stroke="#fff" strokeWidth="2.6"
                  strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7" cy="21" r="1.6" fill="#fff"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", color: "var(--bright)" }}>
              gatihire<span style={{ color: "var(--gold)" }}>.</span>
            </span>
          </div>

          {/* For employers pill */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 10px", borderRadius: 99,
            background: "var(--gold-bg)", border: "1px solid var(--gold-border)",
            fontSize: 11.5, fontWeight: 600, color: "var(--gold)",
            marginBottom: 18,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--gold)" }} />
            For employers
          </div>

          <h1 style={{
            fontSize: 26, fontWeight: 800, margin: "0 0 6px",
            letterSpacing: "-0.025em", color: "var(--bright)",
          }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--dim)", fontSize: 13, margin: "0 0 24px" }}>
            Sign in to your hiring workspace
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: "var(--rose-bg)", border: "1px solid var(--rose-border)",
              borderRadius: 9, padding: "10px 14px", marginBottom: 16,
              fontSize: 12.5, color: "var(--rose)",
            }}>
              {error}
            </div>
          )}

          {/* Email sent state */}
          {sent ? (
            <div style={{
              background: "var(--gold-bg)", border: "1px solid var(--gold-border)",
              borderRadius: 12, padding: "20px", textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📧</div>
              <div style={{ fontSize: 15, color: "var(--bright)", fontWeight: 700, marginBottom: 6 }}>
                Check your inbox
              </div>
              <div style={{ fontSize: 12.5, color: "var(--dim)", lineHeight: 1.6 }}>
                We sent a magic link to{" "}
                <strong style={{ color: "var(--gold)" }}>{email}</strong>.
                <br />Click the link to sign in instantly.
              </div>
            </div>

          ) : mode === "options" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  height: 44, padding: "0 18px",
                  background: "#fff", border: "1px solid var(--line2)",
                  borderRadius: 9, cursor: loading ? "not-allowed" : "pointer",
                  color: "var(--primary)", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "var(--font-body)", transition: "all 0.12s",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "0 1px 2px rgba(0,0,0,.04)",
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = "var(--line2)"; (e.currentTarget as HTMLElement).style.background = "var(--ink2)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line2)" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
                </svg>
                {loading ? "Connecting…" : "Continue with Google"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--muted)", fontSize: 11.5 }}>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                or with email
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              </div>

              {/* Email OTP */}
              <button
                onClick={() => setMode("email")}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  height: 44, padding: "0 18px",
                  background: "var(--gold)", border: "1px solid var(--gold)",
                  borderRadius: 9, cursor: "pointer",
                  color: "#fff", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "var(--font-body)", transition: "all 0.12s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold2)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18v12H3zM3 7l9 7 9-7"/>
                </svg>
                Continue with Email
              </button>
            </div>

          ) : (
            /* Email OTP form */
            <form onSubmit={handleEmailOtp} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                type="button"
                onClick={() => setMode("options")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--dim)", fontSize: 12.5, fontFamily: "var(--font-body)",
                  marginBottom: 4, padding: 0,
                }}
              >
                ← Back
              </button>
              <div>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 600,
                  color: "var(--secondary)", marginBottom: 6,
                }}>
                  Work email
                </label>
                <div style={{
                  display: "flex", alignItems: "center", height: 44,
                  background: "#fff", border: "1px solid var(--line2)",
                  borderRadius: 8, padding: "0 12px", gap: 8,
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8">
                    <path d="M3 6h18v12H3zM3 7l9 7 9-7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="priya@mahindralogistics.com"
                    autoFocus
                    style={{
                      flex: 1, border: "none", outline: "none",
                      background: "transparent", fontSize: 13.5,
                      fontFamily: "var(--font-body)", color: "var(--bright)",
                    }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  height: 44, padding: "0 18px",
                  background: loading || !email.trim() ? "var(--ink3)" : "var(--bright)",
                  border: "1px solid transparent",
                  borderRadius: 9, cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                  color: loading || !email.trim() ? "var(--muted)" : "#fff",
                  fontSize: 13.5, fontWeight: 600,
                  fontFamily: "var(--font-body)", transition: "all 0.12s",
                }}
              >
                {loading ? "Sending magic link…" : "Send magic link →"}
              </button>
            </form>
          )}

          {/* Terms */}
          <p style={{ marginTop: 24, fontSize: 11, color: "var(--muted)", textAlign: "center", lineHeight: 1.5 }}>
            By signing in you agree to GatiHire&apos;s{" "}
            <span style={{ color: "var(--dim)", textDecoration: "underline", cursor: "pointer" }}>Terms of Service</span>
            {" & "}
            <span style={{ color: "var(--dim)", textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#12151f",
      }}>
        <div style={{ color: "rgba(255,255,255,.4)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em" }}>
          LOADING…
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
