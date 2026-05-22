"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type UnlockedProfile = {
  id: string
  candidate_id: string
  unlocked_at: string
  candidates: {
    id: string
    name: string
    email: string
    phone: string
    current_role: string
    location: string
    total_experience: number
    degree: string
    university: string
    technical_skills: string[]
    file_url: string | null
    linkedin_profile: string | null
  }
}

export default function UnlockedPage() {
  const [profiles, setProfiles] = useState<UnlockedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return
      const res = await fetch("/api/client/unlocked", { headers: { Authorization: `Bearer ${token}` } })
      const d = await res.json()
      setProfiles(d.profiles || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase()
    if (!q) return true
    const c = p.candidates
    return (
      c.name?.toLowerCase().includes(q) ||
      c.current_role?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--bright)", fontWeight: 500 }}>Unlocked Profiles</div>
          <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "4px" }}>Candidates you&apos;ve unlocked full contact details for</div>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--secondary)" }}>
          {profiles.length} profile{profiles.length !== 1 ? "s" : ""} unlocked
        </div>
      </div>

      {/* Search */}
      {profiles.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name, role, location…"
            style={{ width: "100%", maxWidth: "380px", padding: "10px 14px", background: "var(--ink2)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--bright)", fontSize: "13px", fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading…</div>
      ) : profiles.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔓</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--bright)", marginBottom: "8px" }}>No unlocked profiles yet</div>
          <div style={{ fontSize: "13px", color: "var(--dim)" }}>
            Use <a href="/dashboard/searches" style={{ color: "var(--gold)" }}>Smart Search</a> to find candidates and unlock their full profiles
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "var(--dim)", fontSize: "13px", padding: "40px 0", textAlign: "center" }}>No profiles match &ldquo;{search}&rdquo;</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map(p => {
            const c = p.candidates
            const avatarColors = ["#1e3a5f,#0f2040", "#1a3a2f,#0f2018", "#3a1a1a,#201010", "#2a1a3a,#180f28"]
            const colorIdx = c.id.charCodeAt(0) % avatarColors.length
            const [bg1, bg2] = avatarColors[colorIdx].split(",")
            const initials = (c.name || "").split(" ").filter(Boolean).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase() || "?"

            return (
              <div key={p.id} style={{
                display: "flex", gap: "16px", alignItems: "flex-start",
                background: "var(--ink2)", border: "1px solid var(--line)",
                borderRadius: "var(--r2)", padding: "18px 20px",
                transition: "border-color 0.12s"
              }}>
                {/* Avatar */}
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
                  background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: "14px", color: "var(--blue)"
                }}>{initials}</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--bright)" }}>{c.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "2px" }}>{c.current_role} · {c.location}</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", flexShrink: 0 }}>
                      Unlocked {new Date(p.unlocked_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                  </div>

                  {/* Contact Row */}
                  <div style={{ display: "flex", gap: "16px", marginTop: "10px", flexWrap: "wrap" }}>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--blue)", textDecoration: "none" }}>
                        📞 {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--blue)", textDecoration: "none" }}>
                        ✉️ {c.email}
                      </a>
                    )}
                    {c.linkedin_profile && (
                      <a href={c.linkedin_profile} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--secondary)", textDecoration: "none" }}>
                        in LinkedIn
                      </a>
                    )}
                    {c.file_url && (
                      <a href={c.file_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "var(--gold)", textDecoration: "none" }}>
                        📄 Resume PDF
                      </a>
                    )}
                  </div>

                  {/* Skills */}
                  {(c.technical_skills || []).length > 0 && (
                    <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "10px" }}>
                      {c.technical_skills.slice(0, 6).map((s: string, i: number) => (
                        <span key={i} style={{ padding: "2px 8px", borderRadius: "3px", fontSize: "10px", background: "var(--ink4)", border: "1px solid var(--line2)", color: "var(--secondary)", fontFamily: "var(--font-mono)" }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience badge */}
                {c.total_experience > 0 && (
                  <div style={{ textAlign: "center", flexShrink: 0, padding: "8px 12px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--bright)", lineHeight: 1 }}>{c.total_experience}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--muted)", textTransform: "uppercase" }}>yrs exp</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
