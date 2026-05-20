"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const COMPANY_TYPES = [
  "Transportation & Fleet",
  "Warehousing",
  "Freight Forwarding & 3PL",
  "E-Commerce & Retail",
  "Manufacturing & FMCG",
  "Agri & Cold Chain",
  "Technology & Software",
  "Other"
]

const COMPANY_SUBTYPES: Record<string, string[]> = {
  "Transportation & Fleet": ["Car Carrier", "Dry Van", "Reefer", "Flatbed", "Tanker", "LTL", "Intermodal", "Last Mile", "Hazmat"],
  "Warehousing": ["General Warehouse", "Cold Storage", "Fulfillment Center", "Distribution Center", "Bonded Warehouse"],
  "Freight Forwarding & 3PL": ["Air Freight", "Ocean Freight", "Customs Brokerage", "Contract Logistics"],
}

type Step = 1 | 2

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [name, setName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [companyType, setCompanyType] = useState("")
  const [companySubtype, setCompanySubtype] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [about, setAbout] = useState("")
  const [primaryContactName, setPrimaryContactName] = useState("")
  const [primaryContactEmail, setPrimaryContactEmail] = useState("")
  const [primaryContactPhone, setPrimaryContactPhone] = useState("")
  const [generatingAbout, setGeneratingAbout] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setPrimaryContactEmail(user.email)
    })
  }, [])

  const generateAbout = async () => {
    if (!website) {
      setError("Please provide a website URL in step 1 to generate company details.")
      return
    }
    setGeneratingAbout(true)
    setError("")
    try {
      const session = await supabase.auth.getSession()
      const accessToken = session.data.session?.access_token
      const res = await fetch("/api/client/generate-about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ website })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate about section")
      if (data.about) setAbout(data.about)
    } catch (err: any) {
      setError(err.message || "Failed to generate company details.")
    } finally {
      setGeneratingAbout(false)
    }
  }

  const submit = async () => {
    setLoading(true)
    setError("")
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const session = await supabase.auth.getSession()
      const accessToken = session.data.session?.access_token

      const formData = new FormData()
      formData.append("name", name)
      formData.append("company_type", companyType)
      formData.append("company_subtype", companySubtype)
      formData.append("location", location)
      formData.append("website", website)
      formData.append("about", about)
      formData.append("primary_contact_name", primaryContactName)
      formData.append("primary_contact_email", primaryContactEmail)
      formData.append("primary_contact_phone", primaryContactPhone)
      if (logoFile) {
        formData.append("logo", logoFile)
      }

      const res = await fetch("/api/client/onboarding", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")

      router.replace("/dashboard")
    } catch (e: any) {
      setError(e.message || "Something went wrong")
      setLoading(false)
    }
  }

  const canNext1 = name.trim() && companyType && website.trim()
  const canNext2 = primaryContactName.trim() && primaryContactEmail.trim()

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-10" style={{ background: "var(--ink)", overflowY: "auto" }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(96,165,250,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(232,201,109,0.05) 0%, transparent 60%)"
      }} />

      <div style={{ width: "100%", maxWidth: "540px", padding: "20px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 500, color: "var(--bright)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
            Gati<span style={{ color: "var(--gold)" }}>Hire</span>
          </div>
          <div style={{ fontSize: "13px", color: "var(--secondary)" }}>
            Let&apos;s set up your company profile
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
          {([1,2] as Step[]).map(s => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "100%", height: "3px", borderRadius: "2px",
                background: s <= step ? "var(--gold)" : "var(--line2)",
                transition: "background 0.3s"
              }} />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: s === step ? "var(--gold)" : "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {s === 1 ? "Company Details" : "Contact & About"}
              </div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "16px", padding: "32px" }}>
          {error && (
            <div style={{ background: "var(--rose-bg)", border: "1px solid var(--rose-border)", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px", fontSize: "12px", color: "var(--rose)" }}>
              {error}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--bright)", fontWeight: 500, marginBottom: "4px" }}>Your Company</div>
                <div style={{ fontSize: "12px", color: "var(--dim)" }}>We&apos;ll use this to personalise your search experience</div>
              </div>
              <Field label="Company Name *" value={name} onChange={setName} placeholder="Swift Road Link Pvt Ltd" />
              <div>
                <label style={labelStyle}>Company Logo</label>
                <input
                  type="file" accept="image/*"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) setLogoFile(f)
                  }}
                  style={{
                    width: "100%", padding: "8px", boxSizing: "border-box",
                    background: "var(--ink3)", border: "1px solid var(--line2)",
                    borderRadius: "8px", color: "var(--bright)", fontSize: "13px",
                    fontFamily: "var(--font-body)", outline: "none"
                  }}
                />
              </div>
              <div>
                <label style={labelStyle}>Company Type *</label>
                <select value={companyType} onChange={e => { setCompanyType(e.target.value); setCompanySubtype("") }} style={selectStyle}>
                  <option value="">Select type…</option>
                  {COMPANY_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              {companyType && COMPANY_SUBTYPES[companyType]?.length > 0 && (
                <div>
                  <label style={labelStyle}>Company Subtype</label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {COMPANY_SUBTYPES[companyType].map(c => (
                      <button key={c} type="button" onClick={() => setCompanySubtype(c)} style={{
                        padding: "7px 14px", borderRadius: "20px", fontSize: "12px", cursor: "pointer",
                        border: "1px solid", fontFamily: "var(--font-mono)",
                        background: companySubtype === c ? "var(--gold-bg)" : "var(--ink3)",
                        borderColor: companySubtype === c ? "var(--gold-border)" : "var(--line2)",
                        color: companySubtype === c ? "var(--gold)" : "var(--secondary)"
                      }}>{c}</button>
                    ))}
                  </div>
                </div>
              )}
              <Field label="HQ Location" value={location} onChange={setLocation} placeholder="Ghaziabad, Delhi NCR" />
              <Field label="Website *" value={website} onChange={setWebsite} placeholder="https://yourcompany.com" type="url" />
              <Btn disabled={!canNext1} onClick={() => setStep(2)}>Continue →</Btn>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--bright)", fontWeight: 500, marginBottom: "4px" }}>Contact & About</div>
                <div style={{ fontSize: "12px", color: "var(--dim)" }}>Add primary contact details and a summary of your company.</div>
              </div>
              <Field label="Primary Contact Name *" value={primaryContactName} onChange={setPrimaryContactName} placeholder="Ravi Sharma" />
              <Field label="Primary Contact Email *" value={primaryContactEmail} onChange={setPrimaryContactEmail} placeholder="ravi@example.com" type="email" />
              <Field label="Primary Contact Phone" value={primaryContactPhone} onChange={setPrimaryContactPhone} placeholder="+91 98765 43210" type="tel" />
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>About</label>
                  <button
                    type="button"
                    onClick={generateAbout}
                    disabled={generatingAbout || !website}
                    style={{
                      background: "transparent", border: "none", color: "var(--gold)",
                      fontSize: "11px", cursor: (generatingAbout || !website) ? "not-allowed" : "pointer",
                      fontFamily: "var(--font-mono)", opacity: (generatingAbout || !website) ? 0.5 : 1
                    }}
                  >
                    {generatingAbout ? "Generating..." : "✨ Generate from Website"}
                  </button>
                </div>
                <textarea
                  value={about} onChange={e => setAbout(e.target.value)} placeholder="Candidate-facing summary of your company..."
                  rows={4}
                  style={{
                    width: "100%", padding: "10px 14px", boxSizing: "border-box", resize: "vertical",
                    background: "var(--ink3)", border: "1px solid var(--line2)",
                    borderRadius: "8px", color: "var(--bright)", fontSize: "13px",
                    fontFamily: "var(--font-body)", outline: "none"
                  }}
                />
              </div>

              {/* Free credits callout */}
              <div style={{
                background: "var(--blue-bg)", border: "1px solid var(--blue-border)",
                borderRadius: "10px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-start", marginTop: "10px"
              }}>
                <div style={{ fontSize: "20px" }}>🎁</div>
                <div>
                  <div style={{ fontSize: "13px", color: "var(--blue)", fontWeight: 600, marginBottom: "3px" }}>3 Free Profile Unlocks</div>
                  <div style={{ fontSize: "11px", color: "var(--secondary)", lineHeight: 1.5 }}>
                    Your account comes with 3 free profile unlocks. Unlock a profile to see full contact details, phone number, and resume PDF.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Btn secondary onClick={() => setStep(1)}>← Back</Btn>
                <Btn loading={loading} disabled={!canNext2} onClick={submit}>
                  {loading ? "Setting up…" : "Launch Dashboard →"}
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", color: "var(--secondary)",
  fontFamily: "var(--font-mono)", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: "6px"
}

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", boxSizing: "border-box",
  background: "var(--ink3)", border: "1px solid var(--line2)",
  borderRadius: "8px", color: "var(--bright)", fontSize: "13px",
  fontFamily: "var(--font-body)", outline: "none"
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px", boxSizing: "border-box",
          background: "var(--ink3)", border: "1px solid var(--line2)",
          borderRadius: "8px", color: "var(--bright)", fontSize: "13px",
          fontFamily: "var(--font-body)", outline: "none"
        }}
      />
    </div>
  )
}

function Btn({ children, onClick, disabled, loading, secondary }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean; secondary?: boolean
}) {
  const dis = disabled || loading
  return (
    <button
      type="button" onClick={onClick} disabled={dis}
      style={{
        flex: secondary ? undefined : 1,
        padding: "12px 20px", borderRadius: "10px", cursor: dis ? "not-allowed" : "pointer",
        border: "1px solid", fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 600,
        transition: "all 0.12s",
        background: secondary ? "var(--ink3)" : dis ? "var(--ink4)" : "var(--gold)",
        borderColor: secondary ? "var(--line2)" : "transparent",
        color: secondary ? "var(--secondary)" : dis ? "var(--muted)" : "var(--ink)",
        opacity: dis && !secondary ? 0.7 : 1
      }}
    >
      {children}
    </button>
  )
}
