"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CompanyProfilePage() {
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [name, setName] = useState("")
  const [website, setWebsite] = useState("")
  const [location, setLocation] = useState("")
  const [about, setAbout] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [companyType, setCompanyType] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) { setError("Unauthorized"); setLoading(false); return }

        const res = await fetch("/api/client/me", { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (!res.ok || !data.client) throw new Error("Company profile not found")

        const c = data.client
        setCompany(c)
        setName(c.name || "")
        setWebsite(c.website || "")
        setLocation(c.location || "")
        setAbout(c.about || "")
        setContactName(c.primary_contact_name || "")
        setContactEmail(c.primary_contact_email || "")
        setContactPhone(c.contact_phone || "")
        setCompanyType(c.company_type || "")
      } catch (e: any) {
        setError(e.message || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setUpdating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const formData = new FormData()
      formData.append("name", name)
      formData.append("website", website)
      formData.append("location", location)
      formData.append("about", about)
      formData.append("primary_contact_name", contactName)
      formData.append("primary_contact_email", contactEmail)
      formData.append("primary_contact_phone", contactPhone)

      const res = await fetch("/api/client/onboarding", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      setCompany({ ...company, name, website, location, about, primary_contact_name: contactName, primary_contact_email: contactEmail, contact_phone: contactPhone })
      setEditMode(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--dim)" }}>
      Loading company profile…
    </div>
  )

  if (error) return (
    <div style={{ padding: "40px", background: "var(--rose-bg)", border: "1px solid var(--rose-border)", borderRadius: 12, color: "var(--rose)", maxWidth: 600, margin: "0 auto" }}>
      {error}
    </div>
  )

  if (!company) return (
    <div style={{ padding: "40px", color: "var(--dim)" }}>
      Company profile not found.
    </div>
  )

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em", margin: 0 }}>
            {company.name || "Company Profile"}
          </h1>
          <p style={{ fontSize: 13, color: "var(--dim)", margin: "4px 0 0" }}>
            {company.company_type || "—"}
          </p>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            style={{
              padding: "9px 18px", borderRadius: 9,
              background: "var(--gold)", border: "none",
              color: "#fff", fontWeight: 700, fontSize: 13,
              cursor: "pointer", fontFamily: "var(--font-body)"
            }}
          >
            Edit profile
          </button>
        )}
      </div>

      {/* Company info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 28, marginBottom: 28 }}>

        {/* Left: Main info */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "24px" }}>
          {editMode ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Company name</label>
                <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--line2)", background: "var(--ink)", color: "var(--bright)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Website</label>
                <input value={website} onChange={e => setWebsite(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--line2)", background: "var(--ink)", color: "var(--bright)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Location</label>
                <input value={location} onChange={e => setLocation(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--line2)", background: "var(--ink)", color: "var(--bright)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Company description</label>
                <textarea value={about} onChange={e => setAbout(e.target.value)} rows={5} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--line2)", background: "var(--ink)", color: "var(--bright)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Company type</div>
                <div style={{ fontSize: 13.5, color: "var(--bright)" }}>{company.company_type || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Location</div>
                <div style={{ fontSize: 13.5, color: "var(--bright)" }}>{company.location || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Website</div>
                {company.website ? (
                  <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13.5, color: "var(--gold)", textDecoration: "none" }}>
                    {company.website} →
                  </a>
                ) : (
                  <div style={{ fontSize: 13.5, color: "var(--dim)" }}>—</div>
                )}
              </div>
              {company.about && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>About</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--bright)" }}>{company.about}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Contact info */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "24px", height: "fit-content" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 16px", color: "var(--bright)" }}>Primary contact</h3>
          {editMode ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Full name</label>
                <input value={contactName} onChange={e => setContactName(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--line2)", background: "var(--ink)", color: "var(--bright)", fontSize: 12, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email</label>
                <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} type="email" style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--line2)", background: "var(--ink)", color: "var(--bright)", fontSize: 12, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "var(--secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Phone</label>
                <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} type="tel" style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--line2)", background: "var(--ink)", color: "var(--bright)", fontSize: 12, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                <button onClick={() => setEditMode(false)} style={{ flex: 1, padding: "7px", borderRadius: 6, border: "1px solid var(--line2)", background: "transparent", color: "var(--secondary)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={updating} style={{ flex: 1, padding: "7px", borderRadius: 6, border: "none", background: updating ? "var(--ink3)" : "var(--gold)", color: updating ? "var(--dim)" : "#fff", cursor: updating ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 600 }}>
                  {updating ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Name</div>
                <div style={{ fontSize: 13, color: "var(--bright)" }}>{company.primary_contact_name || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Email</div>
                <div style={{ fontSize: 13, color: "var(--gold)" }}>{company.primary_contact_email || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Phone</div>
                <div style={{ fontSize: 13, color: "var(--bright)" }}>{company.contact_phone || "—"}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--rose-bg)", border: "1px solid var(--rose-border)", borderRadius: 9, padding: "12px 16px", color: "var(--rose)", fontSize: 12.5 }}>
          {error}
        </div>
      )}
    </div>
  )
}
