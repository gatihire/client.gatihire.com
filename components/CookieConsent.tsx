"use client"
import { useEffect, useState } from "react"
import { ensureAttributionAccepted } from "@/lib/attribution"

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const hasConsent = typeof document !== "undefined" && document.cookie.includes("cookie_consent=true")
    setVisible(!hasConsent)
  }, [])
  const accept = () => {
    document.cookie = "cookie_consent=true; path=/; max-age=31536000"
    ensureAttributionAccepted()
    setVisible(false)
  }
  if (!visible) return null
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-4 shadow-lg flex flex-col sm:flex-row gap-3 items-center">
        <div className="text-sm text-muted-foreground">We use cookies to keep you signed in and improve your experience.</div>
        <button 
          style={{ background: "var(--gold)", color: "#fff", padding: "6px 16px", borderRadius: "99px", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer" }} 
          onClick={accept}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
