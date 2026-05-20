"use client"

import { useState, Suspense } from "react"
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

  // Use window.location.origin: always correct in a client component since the
  // user is literally on this page (localhost:3000 or client.gatihire.com)
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
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "var(--ink)" }}>
      {/* Background gradient orbs */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(96,165,250,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(232,201,109,0.05) 0%, transparent 60%)"
      }} />

      <div style={{ width: "100%", maxWidth: "420px", padding: "0 20px", position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "28px",
            fontWeight: 500,
            color: "var(--bright)",
            letterSpacing: "-0.5px",
            marginBottom: "6px"
          }}>
            Gati<span style={{ color: "var(--gold)" }}>Hire</span>
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--dim)",
            letterSpacing: "0.15em",
            textTransform: "uppercase"
          }}>
            Client Intelligence Portal
          </div>
        </div>

        <div style={{
          background: "var(--ink2)",
          border: "1px solid var(--line)",
          borderRadius: "16px",
          padding: "32px",
        }}>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--bright)", fontWeight: 500, letterSpacing: "-0.3px", marginBottom: "6px" }}>
              Welcome back
            </div>
            <div style={{ fontSize: "13px", color: "var(--dim)" }}>
              Sign in to access your hiring dashboard
            </div>
          </div>

          {error && (
            <div style={{
              background: "var(--rose-bg)", border: "1px solid var(--rose-border)",
              borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
              fontSize: "12px", color: "var(--rose)"
            }}>
              {error}
            </div>
          )}

          {sent ? (
            <div style={{
              background: "var(--blue-bg)", border: "1px solid var(--blue-border)",
              borderRadius: "10px", padding: "16px", textAlign: "center"
            }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>📧</div>
              <div style={{ fontSize: "14px", color: "var(--bright)", fontWeight: 600, marginBottom: "6px" }}>Check your email</div>
              <div style={{ fontSize: "12px", color: "var(--secondary)", lineHeight: 1.6 }}>
                We sent a magic link to <strong style={{ color: "var(--blue)" }}>{email}</strong>.<br />
                Click the link to sign in.
              </div>
            </div>
          ) : mode === "options" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  padding: "12px 20px",
                  background: "var(--ink3)", border: "1px solid var(--line2)",
                  borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer",
                  color: "var(--primary)", fontSize: "13px", fontWeight: 500,
                  transition: "all 0.12s", fontFamily: "var(--font-body)",
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.borderColor = "var(--muted)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line2)" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
                </svg>
                {loading ? "Connecting…" : "Continue with Google"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "var(--muted)", fontSize: "11px" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
                OR
                <div style={{ flex: 1, height: "1px", background: "var(--line)" }} />
              </div>

              <button
                onClick={() => setMode("email")}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  padding: "12px 20px",
                  background: "var(--gold-bg)", border: "1px solid var(--gold-border)",
                  borderRadius: "10px", cursor: "pointer",
                  color: "var(--gold)", fontSize: "13px", fontWeight: 500,
                  transition: "all 0.12s", fontFamily: "var(--font-body)"
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(232,201,109,0.12)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--gold-bg)" }}
              >
                ✉️ Continue with Email OTP
              </button>
            </div>
          ) : (
            <form onSubmit={handleEmailOtp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setMode("options")}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--dim)", fontSize: "12px", fontFamily: "var(--font-body)",
                  marginBottom: "4px"
                }}
              >
                ← Back
              </button>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--secondary)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{
                    width: "100%", padding: "11px 14px",
                    background: "var(--ink3)", border: "1px solid var(--line2)",
                    borderRadius: "8px", color: "var(--bright)", fontSize: "13px",
                    fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box"
                  }}
                  onFocus={e => { (e.target as HTMLElement).style.borderColor = "var(--gold-border)" }}
                  onBlur={e => { (e.target as HTMLElement).style.borderColor = "var(--line2)" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                style={{
                  padding: "12px 20px",
                  background: loading || !email.trim() ? "var(--ink4)" : "var(--gold)",
                  border: "1px solid transparent",
                  borderRadius: "10px", cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                  color: loading || !email.trim() ? "var(--muted)" : "var(--ink)",
                  fontSize: "13px", fontWeight: 600,
                  fontFamily: "var(--font-body)", transition: "all 0.12s"
                }}
              >
                {loading ? "Sending…" : "Send Magic Link"}
              </button>
            </form>
          )}

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "11px", color: "var(--muted)" }}>
            By signing in you agree to GatiHire's terms of service
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "var(--ink)" }}>
        <div style={{ color: "var(--dim)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
          LOADING PORTAL...
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
