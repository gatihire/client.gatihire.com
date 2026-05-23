"use client"
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

/* Icons as SVG (no emojis) */
const IconTransport = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 18.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 18.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M1 6a2 2 0 012-2h15a2 2 0 012 2v10H1V6z" opacity="0.3"/></svg>
const IconWarehouse = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v2H3V3zm0 3h18v12H3V6zm1 2v8h2V8H4zm4 0v8h2V8H8zm4 0v8h2V8h-2zm4 0v8h2V8h-2zm2 10H3v3h16v-3z"/></svg>
const IconFreight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" opacity="0.3"/><path d="M12 12l4-4m0 8l-4-4m8-4l-4 4m0 8l4-4"/></svg>
const IconEcommerce = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V5a2 2 0 012-2zm3 6h4v4H6V9zm6 0h4v4h-4V9zm6 0h2v4h-2V9z"/></svg>
const IconManufacturing = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10c0 5.55 3.6 10.74 8.6 12.9.5.21 1.02.39 1.4.1z" opacity="0.3"/><path d="M12 2v20.9c.38.29.9.11 1.4-.1C18.4 20.74 22 15.55 22 10V7l-10-5z"/></svg>
const IconAgri = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
const IconTech = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 9.5h-3v3h3v-3zm0-4h-3v3h3v-3z" opacity="0.3"/></svg>
const IconPlus = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>

const COMPANY_TYPES = [
  { id: "transport", label: "Transport & Fleet", Icon: IconTransport },
  { id: "warehouse", label: "Warehousing", Icon: IconWarehouse },
  { id: "freight", label: "Freight & 3PL", Icon: IconFreight },
  { id: "ecommerce", label: "E-Commerce & Retail", Icon: IconEcommerce },
  { id: "mfg", label: "Manufacturing & FMCG", Icon: IconManufacturing },
  { id: "agri", label: "Agri & Cold Chain", Icon: IconAgri },
  { id: "tech", label: "Tech & Software", Icon: IconTech },
  { id: "other", label: "Other", Icon: IconPlus },
]

const COMPANY_TYPES_MAP: Record<string, string> = Object.fromEntries(
  COMPANY_TYPES.map(t => [t.id, t.label])
)

const COMPANY_SUBTYPES: Record<string, string[]> = {
  transport: ["Car Carrier", "Dry Van", "Reefer", "Flatbed", "Tanker", "LTL", "Intermodal", "Last Mile", "Hazmat"],
  warehouse: ["General Warehouse", "Cold Storage", "Fulfillment Center", "Distribution Center", "Bonded Warehouse"],
  freight: ["Air Freight", "Ocean Freight", "Customs Brokerage", "Contract Logistics"],
}

const HIRING_ROLES = [
  { id: "warehouse", label: "Warehousing & DC", Icon: IconWarehouse },
  { id: "transport", label: "Transport & Fleet", Icon: IconTransport },
  { id: "freight", label: "Freight & Logistics", Icon: IconFreight },
  { id: "scm", label: "Supply chain & S&OP", Icon: IconManufacturing },
  { id: "last", label: "Last mile & Hub ops", Icon: IconEcommerce },
  { id: "proc", label: "Procurement", Icon: IconFreight },
  { id: "cs", label: "Customer ops", Icon: IconTech },
  { id: "other", label: "Other", Icon: IconPlus },
]

const HIRING_VOLUMES = ["1–10 / mo", "10–25 / mo", "25–50 / mo", "50–100 / mo", "100+ / mo"]

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  color: "var(--secondary)", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-mono)"
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={labelStyle}>
        {label}
        {required && <span style={{ color: "var(--gold)", marginLeft: 2 }}>*</span>}
      </span>
      {children}
    </label>
  )
}

function TextInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        height: 40, padding: "0 12px", boxSizing: "border-box",
        background: "#fff", border: "1px solid var(--line2)",
        borderRadius: 8, color: "var(--bright)", fontSize: 13.5,
        fontFamily: "var(--font-body)", outline: "none", width: "100%",
      }}
      onFocus={e => { (e.target as HTMLElement).style.borderColor = "var(--gold)" }}
      onBlur={e => { (e.target as HTMLElement).style.borderColor = "var(--line2)" }}
    />
  )
}

function PrimaryBtn({ children, onClick, disabled, loading }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; loading?: boolean }) {
  const dis = disabled || loading
  return (
    <button
      type="button" onClick={onClick} disabled={dis}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        height: 42, padding: "0 20px", borderRadius: 9, cursor: dis ? "not-allowed" : "pointer",
        border: "1px solid transparent", fontFamily: "var(--font-body)",
        fontSize: 13.5, fontWeight: 700, transition: "all 0.12s",
        background: dis ? "var(--ink3)" : "var(--gold)",
        color: dis ? "var(--dim)" : "#fff",
      }}
    >
      {children}
    </button>
  )
}

function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        height: 42, padding: "0 16px", borderRadius: 9, cursor: "pointer",
        border: "1px solid var(--line2)", fontFamily: "var(--font-body)",
        fontSize: 13.5, fontWeight: 600, background: "#fff",
        color: "var(--secondary)", transition: "all 0.12s",
      }}
    >
      {children}
    </button>
  )
}

type Step = 1 | 2

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState("")
  const [generatingAbout, setGeneratingAbout] = useState(false)

  // Step 1 fields
  const [name, setName] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [companyTypeId, setCompanyTypeId] = useState("")
  const [companyTypeOther, setCompanyTypeOther] = useState("")
  const [companySubtype, setCompanySubtype] = useState("")
  const [location, setLocation] = useState("")

  // Step 2 fields
  const [website, setWebsite] = useState("")
  const [primaryContactName, setPrimaryContactName] = useState("")
  const [primaryContactEmail, setPrimaryContactEmail] = useState("")
  const [primaryContactPhone, setPrimaryContactPhone] = useState("")
  const [about, setAbout] = useState("")
  const [hiringRoles, setHiringRoles] = useState<string[]>([])
  const [hiringRoleOther, setHiringRoleOther] = useState("")
  const [hiringVolume, setHiringVolume] = useState("")

  // Load existing data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) { setInitialLoading(false); return }

        const { data: { user } } = await supabase.auth.getUser()
        if (user?.email) setPrimaryContactEmail(user.email)
        if (user?.user_metadata?.full_name) setPrimaryContactName(user.user_metadata.full_name)

        // Load existing company data
        const res = await fetch("/api/client/me", { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok && data.client) {
          const c = data.client
          setName(c.name || "")
          setLocation(c.location || "")
          setWebsite(c.website || "")
          setAbout(c.about || "")
          setPrimaryContactName(c.primary_contact_name || primaryContactName)
          setPrimaryContactEmail(c.primary_contact_email || primaryContactEmail)
          setPrimaryContactPhone(c.contact_phone || "")
          if (c.company_type) {
            const typeId = Object.entries(COMPANY_TYPES_MAP).find(([_, v]) => v === c.company_type)?.[0] || "other"
            setCompanyTypeId(typeId)
            if (typeId === "other") setCompanyTypeOther(c.company_type)
          }
          if (c.company_subtype) setCompanySubtype(c.company_subtype)
          if (c.hiring_for && Array.isArray(c.hiring_for)) {
            const valid = c.hiring_for.filter((r: string) => HIRING_ROLES.map(x => x.id).includes(r))
            setHiringRoles(valid)
            const invalid = c.hiring_for.find((r: string) => !HIRING_ROLES.map(x => x.id).includes(r))
            if (invalid) setHiringRoleOther(invalid)
          }

          // Check onboarding completion
          // @ts-ignore - client_users not in generated types
          const { data: userData } = await supabase.from("client_users").select("onboarding_completed").eq("auth_user_id", user!.id).single()
          if (!(userData as any)?.onboarding_completed) {
            // Resume from last step — if company data exists, show step 2
            if (c.name) setStep(2)
          }
        }
      } catch (e) {
        console.error("Failed to load data:", e)
      } finally {
        setInitialLoading(false)
      }
    }
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setLogoFile(f)
      const url = URL.createObjectURL(f)
      setLogoPreview(url)
    }
  }

  const toggleHiringRole = (id: string) => {
    setHiringRoles(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id])
  }

  const generateAbout = async () => {
    if (!website) { setError("Please provide a website URL to generate company details."); return }
    setGeneratingAbout(true)
    setError("")
    try {
      const session = await supabase.auth.getSession()
      const accessToken = session.data.session?.access_token
      const res = await fetch("/api/client/generate-about", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ website })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate")
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

      const companyTypeLabel = companyTypeId === "other" ? companyTypeOther : COMPANY_TYPES_MAP[companyTypeId] || companyTypeId
      const hiringForFinal = [...hiringRoles, ...(hiringRoleOther.trim() ? [hiringRoleOther.trim()] : [])]

      const formData = new FormData()
      formData.append("name", name)
      formData.append("company_type", companyTypeLabel)
      formData.append("company_subtype", companySubtype)
      formData.append("location", location)
      formData.append("website", website)
      formData.append("about", about)
      formData.append("primary_contact_name", primaryContactName)
      formData.append("primary_contact_email", primaryContactEmail)
      formData.append("primary_contact_phone", primaryContactPhone)
      formData.append("hiring_for", JSON.stringify(hiringForFinal))
      if (logoFile) formData.append("logo", logoFile)

      const res = await fetch("/api/client/onboarding", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
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

  if (initialLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dim)" }}>
      Loading…
    </div>
  )

  const canNext1 = name.trim() && companyTypeId && (companyTypeId === "other" ? companyTypeOther.trim() : true)
  const canSubmit = primaryContactName.trim() && primaryContactEmail.trim() && website.trim()

  const STEPS = [
    { n: 1 as const, label: "Company" },
    { n: 2 as const, label: "Hiring & Contact" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", fontFamily: "var(--font-body)", display: "flex", flexDirection: "column" }}>
      {/* ── Step header ── */}
      <header style={{
        padding: "16px 32px",
        borderBottom: "1px solid var(--line)",
        background: "#fff",
        display: "flex", alignItems: "center", gap: 24,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
              <path d="M7 21 L13 13 L13 18 L19 18 L19 13 L25 21" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="21" r="1.6" fill="#fff"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", color: "var(--bright)" }}>
            gatihire<span style={{ color: "var(--gold)" }}>.</span>
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16, marginLeft: 24 }}>
          {STEPS.map((s, i) => {
            const done = s.n < step
            const active = s.n === step
            return (
              <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: 99, fontSize: 11, fontWeight: 700,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    background: done ? "var(--green)" : active ? "var(--bright)" : "transparent",
                    border: `1.5px solid ${done ? "var(--green)" : active ? "var(--bright)" : "var(--line2)"}`,
                    color: (done || active) ? "#fff" : "var(--muted)",
                  }}>
                    {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round"/></svg> : s.n}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: active ? 700 : 500, color: active ? "var(--bright)" : done ? "var(--secondary)" : "var(--muted)" }}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ width: 40, height: 1.5, borderRadius: 99, background: done ? "var(--green)" : "var(--line)" }} />}
              </div>
            )
          })}
        </div>

        <button onClick={() => router.push("/dashboard")} style={{ fontSize: 12.5, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>
          Save &amp; exit
        </button>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "40px 48px", display: "flex", flexDirection: "column" }}>
        <div style={{ width: "100%", maxWidth: "100%" }}>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 10 }}>
            STEP {step} / {STEPS.length}
          </div>

          {error && (
            <div style={{ background: "var(--rose-bg)", border: "1px solid var(--rose-border)", borderRadius: 9, padding: "10px 14px", marginBottom: 20, fontSize: 12.5, color: "var(--rose)" }}>
              {error}
            </div>
          )}

          {/* ══ STEP 1: Company ══ */}
          {step === 1 && (
            <>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 8px", color: "var(--bright)" }}>
                Tell us about your company
              </h1>
              <p style={{ color: "var(--dim)", fontSize: 15, margin: "0 0 32px", maxWidth: 600 }}>
                We use this to personalize your hiring experience and show your brand to candidates.
              </p>

              <div style={{ display: "grid", gap: 20 }}>
                {/* Company name + logo */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
                  <Field label="Company name" required>
                    <TextInput value={name} onChange={setName} placeholder="Mahindra Logistics Limited" />
                  </Field>
                  <div>
                    <span style={labelStyle}>Logo</span>
                    <label style={{ width: 80, height: 40, borderRadius: 8, cursor: "pointer", border: "1px dashed var(--line2)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                      {logoPreview ? <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} /> : <span style={{ fontSize: 10, color: "var(--muted)", textAlign: "center", lineHeight: 1.4 }}>Upload<br/>logo</span>}
                      <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>

                {/* Company type — icon grid */}
                <div>
                  <span style={labelStyle}>Company type <span style={{ color: "var(--gold)" }}>*</span></span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {COMPANY_TYPES.map(t => {
                      const Icon = t.Icon
                      return (
                        <button
                          key={t.id} type="button"
                          onClick={() => { setCompanyTypeId(t.id); setCompanySubtype(""); setCompanyTypeOther("") }}
                          style={{
                            padding: "14px 12px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                            border: `1.5px solid ${companyTypeId === t.id ? "var(--bright)" : "var(--line)"}`,
                            background: companyTypeId === t.id ? "var(--bright)" : "#fff",
                            transition: "all 0.1s", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8
                          }}
                        >
                          <div style={{ color: companyTypeId === t.id ? "#fff" : "var(--gold)", display: "flex" }}>
                            <Icon />
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 11.5, color: companyTypeId === t.id ? "#fff" : "var(--primary)", lineHeight: 1.3 }}>
                            {t.label}
                          </div>
                          {companyTypeId === t.id && (
                            <div style={{ position: "absolute", top: 7, right: 7, width: 14, height: 14, borderRadius: 99, background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Company type "Other" input */}
                {companyTypeId === "other" && (
                  <Field label="Specify your company type" required>
                    <TextInput value={companyTypeOther} onChange={setCompanyTypeOther} placeholder="e.g. Healthcare, Real Estate, Food Delivery" />
                  </Field>
                )}

                {/* Subtype chips */}
                {companyTypeId && COMPANY_SUBTYPES[companyTypeId]?.length > 0 && (
                  <div>
                    <span style={labelStyle}>Sub-type</span>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {COMPANY_SUBTYPES[companyTypeId].map(c => (
                        <button
                          key={c} type="button"
                          onClick={() => setCompanySubtype(companySubtype === c ? "" : c)}
                          style={{
                            padding: "7px 14px", borderRadius: 99, fontSize: 12.5, cursor: "pointer",
                            border: "1.5px solid", fontFamily: "var(--font-body)", fontWeight: 600,
                            background: companySubtype === c ? "var(--gold-bg)" : "#fff",
                            borderColor: companySubtype === c ? "var(--gold-border)" : "var(--line)",
                            color: companySubtype === c ? "var(--gold)" : "var(--secondary)",
                            transition: "all 0.1s",
                          }}
                        >{c}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                <Field label="HQ location">
                  <TextInput value={location} onChange={setLocation} placeholder="Mumbai, MH" />
                </Field>
              </div>
            </>
          )}

          {/* ══ STEP 2: Hiring focus, Website & Contact ══ */}
          {step === 2 && (
            <>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 8px", color: "var(--bright)" }}>
                Hiring focus &amp; contact
              </h1>
              <p style={{ color: "var(--dim)", fontSize: 15, margin: "0 0 32px", maxWidth: 600 }}>
                Tell us what roles you hire for, your website, and primary contact details.
              </p>

              <div style={{ display: "grid", gap: 24 }}>

                {/* Website */}
                <Field label="Website" required>
                  <TextInput value={website} onChange={setWebsite} placeholder="mahindralogistics.com" type="url" />
                </Field>

                {/* Hiring roles */}
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "22px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
                    What kind of roles will you hire?
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
                    {HIRING_ROLES.map(r => {
                      const Icon = r.Icon
                      return (
                        <button
                          key={r.id} type="button"
                          onClick={() => toggleHiringRole(r.id)}
                          style={{
                            padding: "14px 12px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                            border: `1.5px solid ${hiringRoles.includes(r.id) ? "var(--bright)" : "var(--line)"}`,
                            background: hiringRoles.includes(r.id) ? "var(--bright)" : "var(--ink2)",
                            transition: "all 0.1s", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 8
                          }}
                        >
                          <div style={{ color: hiringRoles.includes(r.id) ? "#fff" : "var(--gold)", display: "flex" }}>
                            <Icon />
                          </div>
                          <div style={{ fontWeight: 600, fontSize: 11.5, color: hiringRoles.includes(r.id) ? "#fff" : "var(--primary)", lineHeight: 1.3 }}>
                            {r.label}
                          </div>
                          {hiringRoles.includes(r.id) && (
                            <div style={{ position: "absolute", top: 7, right: 7, width: 14, height: 14, borderRadius: 99, background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l4 4 10-10" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Hiring role "Other" */}
                  {hiringRoles.includes("other") && (
                    <div style={{ marginBottom: 16 }}>
                      <Field label="Specify other roles">
                        <TextInput value={hiringRoleOther} onChange={setHiringRoleOther} placeholder="e.g. HR, Finance, Admin (mobile optional, website optional)" />
                      </Field>
                    </div>
                  )}

                  <h4 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 12px" }}>Typical hiring volume</h4>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {HIRING_VOLUMES.map(v => (
                      <button
                        key={v} type="button"
                        onClick={() => setHiringVolume(v)}
                        style={{
                          padding: "8px 16px", borderRadius: 99, cursor: "pointer",
                          border: `1.5px solid ${hiringVolume === v ? "var(--gold-border)" : "var(--line)"}`,
                          background: hiringVolume === v ? "var(--gold-bg)" : "#fff",
                          color: hiringVolume === v ? "var(--gold)" : "var(--secondary)",
                          fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-body)",
                          transition: "all 0.1s",
                        }}
                      >{v}</button>
                    ))}
                  </div>
                </div>

                {/* Contact details */}
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "22px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Primary contact</h3>
                  <div style={{ display: "grid", gap: 14 }}>
                    <Field label="Full name" required>
                      <TextInput value={primaryContactName} onChange={setPrimaryContactName} placeholder="Priya Nair" />
                    </Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Work email" required>
                        <TextInput value={primaryContactEmail} onChange={setPrimaryContactEmail} placeholder="priya@company.com" type="email" />
                      </Field>
                      <Field label="Mobile">
                        <TextInput value={primaryContactPhone} onChange={setPrimaryContactPhone} placeholder="+91 98765 43210" type="tel" />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* About */}
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Company description</h3>
                    <button
                      type="button" onClick={generateAbout}
                      disabled={generatingAbout || !website}
                      style={{
                        background: "transparent", border: "none", fontSize: 12.5,
                        color: (generatingAbout || !website) ? "var(--muted)" : "var(--gold)",
                        cursor: (generatingAbout || !website) ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-body)", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      ✨ {generatingAbout ? "Generating…" : "Generate from website"}
                    </button>
                  </div>
                  <textarea
                    value={about} onChange={e => setAbout(e.target.value)}
                    placeholder="Candidate-facing summary of your company — what you do, where you operate, why someone should work here…"
                    rows={4}
                    style={{
                      width: "100%", padding: "10px 12px", boxSizing: "border-box", resize: "vertical",
                      background: "var(--ink2)", border: "1px solid var(--line)",
                      borderRadius: 8, color: "var(--bright)", fontSize: 13,
                      fontFamily: "var(--font-body)", outline: "none", lineHeight: 1.55,
                    }}
                  />
                </div>

                {/* Free credits callout */}
                <div style={{ background: "#12151f", borderRadius: 12, padding: "18px 22px", display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 9, background: "rgba(255,255,255,.08)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎁</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, color: "#fff", fontWeight: 700, marginBottom: 2 }}>3 free profile unlocks</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>Your account starts with 3 unlock credits. View full contact details and resume of any candidate.</div>
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--gold)" }} />
                    3 credits
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Navigation ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            <GhostBtn onClick={() => step > 1 ? setStep((step - 1) as Step) : router.push("/dashboard")}>
              ← {step > 1 ? "Back" : "Cancel"}
            </GhostBtn>

            <div style={{ display: "flex", gap: 10 }}>
              {step < 2 && <GhostBtn onClick={() => setStep(2)}>Skip for now</GhostBtn>}
              {step === 1 ? (
                <PrimaryBtn disabled={!canNext1} onClick={() => setStep(2)}>
                  Continue →
                </PrimaryBtn>
              ) : (
                <PrimaryBtn loading={loading} disabled={!canSubmit} onClick={submit}>
                  {loading ? "Setting up workspace…" : "Launch dashboard →"}
                </PrimaryBtn>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
