"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Modal } from "@/components/ui/Modal"
import { MIGRATION_SKILLS, getSuggestionMatches } from "@/lib/search-suggestions"

const SUB_CATEGORY_OPTIONS = [
  { value: "driver_heavy_vehicle", label: "Driver – Heavy Vehicle" },
  { value: "driver_light_commercial", label: "Driver – Light Commercial" },
  { value: "driver_last_mile", label: "Driver – Last Mile / Delivery" },
  { value: "driver_line_haul", label: "Driver – Line Haul" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "transport_coordinator", label: "Transport Coordinator" },
  { value: "route_planner", label: "Route Planner" },
  { value: "warehouse_staff", label: "Warehouse Staff" },
  { value: "warehouse_supervisor", label: "Warehouse Supervisor" },
  { value: "inventory_executive", label: "Inventory Executive" },
  { value: "picker_packer", label: "Picker / Packer" },
  { value: "loader_unloader", label: "Loader / Unloader" },
  { value: "forklift_operator", label: "Forklift Operator" },
  { value: "qc_executive", label: "QC Executive" },
  { value: "fleet_manager", label: "Fleet Manager" },
  { value: "fleet_supervisor", label: "Fleet Supervisor" },
  { value: "fleet_maintenance", label: "Fleet Maintenance Technician" },
  { value: "operations_executive", label: "Operations Executive" },
  { value: "operations_manager", label: "Operations Manager" },
  { value: "customer_support", label: "Customer Support" },
  { value: "sales_3pl", label: "3PL Sales" },
  { value: "delivery_associate", label: "Delivery Associate" }
]

const ENGLISH_LEVEL_OPTIONS = [
  { value: "no_english", label: "No English" },
  { value: "basic", label: "Basic" },
  { value: "good", label: "Good English" },
]

const EDUCATION_MIN_OPTIONS = [
  { value: "no_formal", label: "No Formal Education" },
  { value: "8th", label: "8th Pass" },
  { value: "10th", label: "10th Pass" },
  { value: "12th", label: "12th Pass" },
  { value: "graduate", label: "Graduate" },
]

const LICENSE_TYPE_OPTIONS = [
  { value: "lmv", label: "LMV" },
  { value: "hmv", label: "HMV" },
  { value: "mcwg", label: "MCWG" },
  { value: "not_required", label: "Not Required" },
]

const GENDER_PREFERENCE_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
]

const ROLE_CATEGORY_OPTIONS = [
  { value: "last_mile_delivery", label: "Last Mile Delivery" },
  { value: "line_haul", label: "Line Haul" },
  { value: "long_haul", label: "Long Haul" },
  { value: "warehouse_operations", label: "Warehouse Operations" },
  { value: "fleet_operations", label: "Fleet Operations" },
]

const DEPARTMENT_CATEGORY_OPTIONS = [
  { value: "operations", label: "Operations" },
  { value: "fleet", label: "Fleet" },
  { value: "dispatch", label: "Dispatch" },
  { value: "warehouse", label: "Warehouse" },
]

const INDUSTRIES = [
  "Transportation & Fleet",
  "Warehousing",
  "Freight Forwarding & 3PL",
  "E-Commerce & Retail",
  "Manufacturing & FMCG",
  "Agri & Cold Chain",
  "Technology & Software",
  "Other"
]

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    title: "", description: "", industry: "", sub_category: "", location: "", city: "",
    apply_type: "in_platform", external_apply_url: "",
    salary_type: "monthly", salary_min: "", salary_max: "",
    shift_type: "day", employment_type: "full_time",
    urgency_tag: "", openings: 1, education_min: "",
    experience_min_years: "", experience_max_years: "",
    english_level: "", license_type: "",
    age_min: "", age_max: "", gender_preference: "",
    role_category: "", department_category: ""
  })

  const [skillsMust, setSkillsMust] = useState<string[]>([])
  const [skillMustInput, setSkillMustInput] = useState("")
  const [showMustSuggestions, setShowMustSuggestions] = useState(false)
  const [skillsGood, setSkillsGood] = useState<string[]>([])
  const [skillGoodInput, setSkillGoodInput] = useState("")
  const [showGoodSuggestions, setShowGoodSuggestions] = useState(false)
  const [generateHintOpen, setGenerateHintOpen] = useState(false)
  const [minRequirements, setMinRequirements] = useState("")
  const [generatingJd, setGeneratingJd] = useState(false)
  const [generatingSkills, setGeneratingSkills] = useState(false)

  const mustSuggestionRef = useRef<HTMLDivElement>(null)
  const goodSuggestionRef = useRef<HTMLDivElement>(null)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const addSkillMust = (s: string) => {
    if (s.trim() && !skillsMust.includes(s.trim())) setSkillsMust(prev => [...prev, s.trim()])
    setSkillMustInput("")
    setShowMustSuggestions(false)
  }

  const addSkillGood = (s: string) => {
    if (s.trim() && !skillsGood.includes(s.trim())) setSkillsGood(prev => [...prev, s.trim()])
    setSkillGoodInput("")
    setShowGoodSuggestions(false)
  }

  const removeSkillMust = (s: string) => {
    setSkillsMust(prev => prev.filter(x => x !== s))
  }

  const removeSkillGood = (s: string) => {
    setSkillsGood(prev => prev.filter(x => x !== s))
  }

  const generateSkills = async () => {
    try {
      setGeneratingSkills(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch("/api/client/generate-jd", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          customInputs: {
            jobTitle: form.title,
            industry: form.industry,
            subCategory: form.sub_category,
            location: form.location,
            city: form.city,
            employmentType: form.employment_type,
            shiftType: form.shift_type,
            salaryType: form.salary_type,
            experienceMin: form.experience_min_years,
            experienceMax: form.experience_max_years,
            educationMin: form.education_min,
            englishLevel: form.english_level,
            licenseType: form.license_type,
            roleCategory: form.role_category,
            departmentCategory: form.department_category,
            urgency: form.urgency_tag,
            openings: form.openings,
            skillsRequired: skillsMust,
            additionalRequirements: ""
          }
        })
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "Failed to generate skills")
      if (data?.mustHaveSkills) {
        setSkillsMust(prev => Array.from(new Set([...prev, ...data.mustHaveSkills])))
      }
      if (data?.goodToHaveSkills) {
        setSkillsGood(prev => Array.from(new Set([...prev, ...data.goodToHaveSkills])))
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGeneratingSkills(false)
    }
  }

  const generateJD = async () => {
    try {
      setGeneratingJd(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch("/api/client/generate-jd", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          customInputs: {
            jobTitle: form.title,
            industry: form.industry,
            subCategory: form.sub_category,
            location: form.location,
            city: form.city,
            employmentType: form.employment_type,
            shiftType: form.shift_type,
            salaryType: form.salary_type,
            experienceMin: form.experience_min_years,
            experienceMax: form.experience_max_years,
            educationMin: form.education_min,
            englishLevel: form.english_level,
            licenseType: form.license_type,
            roleCategory: form.role_category,
            departmentCategory: form.department_category,
            urgency: form.urgency_tag,
            openings: form.openings,
            skillsRequired: skillsMust,
            additionalRequirements: minRequirements
          }
        })
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || "Failed to generate JD")
      const jd = data?.jobDescription || data
      const responsibilities = Array.isArray(jd?.responsibilities) ? jd.responsibilities : []
      const requirements = Array.isArray(jd?.requirements) ? jd.requirements : []
      const benefits = Array.isArray(jd?.benefits) ? jd.benefits : []
      const formattedDescription = [
        jd?.description || "",
        responsibilities.length ? "\n### Key Responsibilities\n" + responsibilities.map((r: string) => `• ${r}`).join("\n") : "",
        requirements.length ? "\n### Requirements\n" + requirements.map((r: string) => `• ${r}`).join("\n") : "",
        benefits.length ? "\n### Benefits\n" + benefits.map((b: string) => `• ${b}`).join("\n") : ""
      ].filter((x) => typeof x === "string" && x.trim().length).join("\n")
      set("description", formattedDescription)
      if (data?.mustHaveSkills) {
        setSkillsMust(prev => Array.from(new Set([...prev, ...data.mustHaveSkills])))
      }
      if (data?.goodToHaveSkills) {
        setSkillsGood(prev => Array.from(new Set([...prev, ...data.goodToHaveSkills])))
      }
      setGenerateHintOpen(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGeneratingJd(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res = await fetch("/api/client/jobs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          salary_min: Number(form.salary_min) || null, salary_max: Number(form.salary_max) || null,
          experience_min_years: Number(form.experience_min_years) || 0,
          experience_max_years: Number(form.experience_max_years) || null,
          age_min: Number(form.age_min) || null, age_max: Number(form.age_max) || null,
          openings: Number(form.openings) || 1,
          skills_must_have: skillsMust, skills_good_to_have: skillsGood,
          source: "truckinzy", is_external_link: form.apply_type === "external",
          external_link: form.apply_type === "external" ? form.external_apply_url : null
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      router.push("/dashboard/jobs")
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mustSuggestionRef.current && !mustSuggestionRef.current.contains(event.target as Node)) {
        setShowMustSuggestions(false)
      }
      if (goodSuggestionRef.current && !goodSuggestionRef.current.contains(event.target as Node)) {
        setShowGoodSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const mustSuggestions = getSuggestionMatches(skillMustInput, MIGRATION_SKILLS, 8)
  const goodSuggestions = getSuggestionMatches(skillGoodInput, MIGRATION_SKILLS, 8)

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 60 }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", fontSize: 12, padding: 0, display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)" }}>
            ← Jobs
          </button>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.01em", margin: "0 0 4px" }}>
          Post a new job
        </h1>
        <p style={{ fontSize: 12.5, color: "var(--dim)", margin: 0 }}>
          1 job post credit will be deducted when you publish
        </p>
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "var(--rose-bg)", border: "1px solid var(--rose-border)", borderRadius: 9, marginBottom: 20, fontSize: 12.5, color: "var(--rose)" }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Section 1: Basics */}
        <Section num={1} title="Basics" sub="Job title, location and key parameters">
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
            <Field label="Job title *" value={form.title} onChange={v => set("title", v)} placeholder="e.g. Warehouse Supervisor" required />
            <SelectField label="Sub category" value={form.sub_category} onChange={v => set("sub_category", v)} options={SUB_CATEGORY_OPTIONS} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <SelectField label="Industry" value={form.industry} onChange={v => set("industry", v)} options={INDUSTRIES.map(i => ({ value: i, label: i }))} />
            <Field label="Location (area) *" value={form.location} onChange={v => set("location", v)} placeholder="e.g. Bhiwandi DC, MH" required />
            <Field label="City" value={form.city} onChange={v => set("city", v)} placeholder="e.g. Mumbai" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
            <SelectField label="Employment type" value={form.employment_type} onChange={v => set("employment_type", v)} options={[
              { value: "full_time", label: "Full-time" }, { value: "part_time", label: "Part-time" }, { value: "contract", label: "Contract" }
            ]} />
            <SelectField label="Shift type" value={form.shift_type} onChange={v => set("shift_type", v)} options={[
              { value: "day", label: "Day shift" }, { value: "night", label: "Night shift" }, { value: "rotational", label: "Rotational" }
            ]} />
            <SelectField label="Urgency" value={form.urgency_tag} onChange={v => set("urgency_tag", v)} options={[
              { value: "urgently_hiring", label: "Urgently hiring" }, { value: "immediate_joining", label: "Immediate joining" }, { value: "limited_openings", label: "Limited openings" }
            ]} />
            <Field label="Openings" type="number" value={form.openings.toString()} onChange={v => set("openings", v)} />
          </div>
        </Section>

        {/* Section 2: Compensation */}
        <Section num={2} title="Compensation" sub="Salary range and type — shown to candidates after applying">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <SelectField label="Salary type" value={form.salary_type} onChange={v => set("salary_type", v)} options={[
              { value: "monthly", label: "Monthly (₹)" }, { value: "yearly", label: "Yearly / LPA" },
              { value: "daily", label: "Daily" }, { value: "per_trip", label: "Per trip" }, { value: "hourly", label: "Hourly" }
            ]} />
            <Field label="Min salary (₹)" value={form.salary_min} onChange={v => set("salary_min", v)} type="number" placeholder="e.g. 25000" />
            <Field label="Max salary (₹)" value={form.salary_max} onChange={v => set("salary_max", v)} type="number" placeholder="e.g. 40000" />
          </div>
        </Section>

        {/* Section 3: Requirements */}
        <Section num={3} title="Candidate requirements" sub="Experience, education and eligibility criteria">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Min experience (years)" value={form.experience_min_years} onChange={v => set("experience_min_years", v)} type="number" placeholder="e.g. 3" />
            <Field label="Max experience (years)" value={form.experience_max_years} onChange={v => set("experience_max_years", v)} type="number" placeholder="e.g. 8" />
            <SelectField label="Min education" value={form.education_min} onChange={v => set("education_min", v)} options={EDUCATION_MIN_OPTIONS} />
            <SelectField label="English level" value={form.english_level} onChange={v => set("english_level", v)} options={ENGLISH_LEVEL_OPTIONS} />
            <SelectField label="License type" value={form.license_type} onChange={v => set("license_type", v)} options={LICENSE_TYPE_OPTIONS} />
            <SelectField label="Gender preference" value={form.gender_preference} onChange={v => set("gender_preference", v)} options={GENDER_PREFERENCE_OPTIONS} />
            <Field label="Min age" value={form.age_min} onChange={v => set("age_min", v)} type="number" placeholder="e.g. 21" />
            <Field label="Max age" value={form.age_max} onChange={v => set("age_max", v)} type="number" placeholder="e.g. 45" />
          </div>
        </Section>

        {/* Section 4: Categorization */}
        <Section num={4} title="Categorization" sub="Helps surface your role to the right candidates">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <SelectField label="Role category" value={form.role_category} onChange={v => set("role_category", v)} options={ROLE_CATEGORY_OPTIONS} />
            <SelectField label="Department category" value={form.department_category} onChange={v => set("department_category", v)} options={DEPARTMENT_CATEGORY_OPTIONS} />
          </div>
        </Section>

        {/* Section 5: Skills */}
        <Section num={5} title="Skills" sub="Must-haves are used to auto-match candidates in the talent DB">
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8, marginBottom: 8 }}>
            <button
              type="button"
              onClick={generateSkills}
              disabled={generatingSkills || !form.title.trim()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 6,
                background: "var(--gold-bg)", border: "1px solid var(--gold-border)",
                color: "var(--gold)", fontSize: 12, fontWeight: 600,
                cursor: generatingSkills || !form.title.trim() ? "not-allowed" : "pointer", fontFamily: "var(--font-body)",
                opacity: generatingSkills || !form.title.trim() ? 0.5 : 1
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>
              {generatingSkills ? "Suggesting..." : "Auto-suggest"}
            </button>
          </div>
          <div>
            <label style={lStyle}>Must-have skills</label>
            <div style={{ position: "relative" }} ref={mustSuggestionRef}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  value={skillMustInput}
                  onChange={e => { setSkillMustInput(e.target.value); setShowMustSuggestions(true) }}
                  onFocus={() => setShowMustSuggestions(true)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkillMust(skillMustInput)
                    } else if (e.key === "Escape") {
                      setShowMustSuggestions(false)
                    }
                  }}
                  placeholder="Type skill + Enter to add"
                  style={{ ...iStyle, flex: 1 }}
                  autoComplete="off"
                />
                <button type="button" onClick={() => addSkillMust(skillMustInput)} style={outlineBtn}>Add</button>
              </div>
              {showMustSuggestions && skillMustInput && mustSuggestions.length > 0 && (
                <div style={suggestionsDropdownStyle}>
                  {mustSuggestions.map(s => (
                    <SuggestionItem key={s} label={s} onClick={() => addSkillMust(s)} />
                  ))}
                </div>
              )}
            </div>
            {skillsMust.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 }}>
                {skillsMust.map(s => (
                  <span key={s} style={skillTag}>
                    {s}
                    <button type="button" onClick={() => removeSkillMust(s)} style={tagX}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginTop: 4 }}>
            <label style={lStyle}>Good-to-have skills</label>
            <div style={{ position: "relative" }} ref={goodSuggestionRef}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  value={skillGoodInput}
                  onChange={e => { setSkillGoodInput(e.target.value); setShowGoodSuggestions(true) }}
                  onFocus={() => setShowGoodSuggestions(true)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkillGood(skillGoodInput)
                    } else if (e.key === "Escape") {
                      setShowGoodSuggestions(false)
                    }
                  }}
                  placeholder="Type skill + Enter to add"
                  style={{ ...iStyle, flex: 1 }}
                  autoComplete="off"
                />
                <button type="button" onClick={() => addSkillGood(skillGoodInput)} style={outlineBtn}>Add</button>
              </div>
              {showGoodSuggestions && skillGoodInput && goodSuggestions.length > 0 && (
                <div style={suggestionsDropdownStyle}>
                  {goodSuggestions.map(s => (
                    <SuggestionItem key={s} label={s} onClick={() => addSkillGood(s)} />
                  ))}
                </div>
              )}
            </div>
            {skillsGood.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skillsGood.map(s => (
                  <span key={s} style={{ ...skillTag, background: "var(--ink3)", borderColor: "var(--line2)", color: "var(--secondary)" }}>
                    {s}
                    <button type="button" onClick={() => removeSkillGood(s)} style={{ ...tagX, color: "var(--dim)" }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* Section 6: Apply method */}
        <Section num={6} title="Apply method" sub="Choose how candidates will apply">
          <SelectField label="Apply via" value={form.apply_type} onChange={v => set("apply_type", v)} options={[
            { value: "in_platform", label: "Apply on GatiHire (recommended)" },
            { value: "external", label: "External company site" },
          ]} />
          {form.apply_type === "external" && (
            <div style={{ marginTop: 14 }}>
              <Field label="External application URL *" value={form.external_apply_url} onChange={v => set("external_apply_url", v)} type="url" placeholder="https://..." />
            </div>
          )}
        </Section>

        {/* Section 7: Job description */}
        <Section num={7} title="Job description" sub="3-5 paragraphs work best. Be specific about day-to-day responsibilities.">
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8, marginBottom: 8 }}>
            <button
              type="button"
              onClick={() => setGenerateHintOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 6,
                background: "var(--gold-bg)", border: "1px solid var(--gold-border)",
                color: "var(--gold)", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--font-body)"
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>
              Write with AI
            </button>
          </div>
          <textarea
            value={form.description}
            onChange={e => set("description", e.target.value)}
            placeholder="Describe the role, day-to-day responsibilities, must-haves and team structure…"
            rows={10}
            style={{ ...iStyle, resize: "vertical", height: "auto", background: "#ffffff", borderColor: "var(--line2)" }}
          />
        </Section>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{ padding: "12px 24px", background: "transparent", border: "1px solid var(--line2)", borderRadius: 9, color: "var(--secondary)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1, padding: "12px 24px",
              background: loading ? "var(--ink3)" : "var(--gold)",
              border: "none", borderRadius: 9,
              color: loading ? "var(--dim)" : "#fff",
              fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)", fontSize: 13,
              transition: "all 0.12s"
            }}
          >
            {loading ? "Publishing…" : "Publish job · −1 credit"}
          </button>
        </div>
      </form>

      {/* AI generate modal */}
      <Modal open={generateHintOpen} onClose={() => setGenerateHintOpen(false)} title="Write JD with AI" size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 13, color: "var(--secondary)", margin: 0, lineHeight: 1.6 }}>
            Add any must-have requirements. Example: lanes, shift pattern, tools, compliance, team size.
          </p>
          <textarea
            placeholder="Optional: constraints, tools, certifications required…"
            value={minRequirements}
            onChange={e => setMinRequirements(e.target.value)}
            style={{ ...iStyle, minHeight: 90, resize: "vertical", background: "#fff" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => setGenerateHintOpen(false)} style={outlineBtn}>Cancel</button>
            <button
              type="button"
              onClick={generateJD}
              disabled={generatingJd || !form.title.trim()}
              style={{
                padding: "8px 18px",
                background: generatingJd || !form.title.trim() ? "var(--ink3)" : "var(--gold)",
                border: "none", borderRadius: 8,
                color: generatingJd || !form.title.trim() ? "var(--dim)" : "#fff",
                fontWeight: 600, cursor: generatingJd || !form.title.trim() ? "not-allowed" : "pointer",
                fontSize: 13, fontFamily: "var(--font-body)"
              }}
            >
              {generatingJd ? "Generating…" : "Generate"}
            </button>
          </div>
          {!form.title.trim() && (
            <p style={{ fontSize: 11, color: "var(--rose)", margin: 0, textAlign: "right" }}>Job title is required to generate.</p>
          )}
        </div>
      </Modal>
    </div>
  )
}

function Section({ num, title, sub, children }: { num: number; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          width: 22, height: 22, borderRadius: 99, background: "var(--gold)", color: "#fff",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 800, flexShrink: 0
        }}>{num}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.01em" }}>{title}</div>
          <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 1 }}>{sub}</div>
        </div>
      </div>
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label style={lStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={{ ...iStyle, boxSizing: "border-box" }} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label style={lStyle}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...iStyle, boxSizing: "border-box" }}>
        <option value="">Select…</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function SuggestionItem({ label, onClick }: { label: string; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      style={{
        padding: "8px 12px",
        cursor: "pointer",
        fontSize: 13,
        color: "var(--bright)",
        transition: "background 0.15s",
        background: isHovered ? "var(--ink)" : "transparent"
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </div>
  );
}

const lStyle: React.CSSProperties = {
  display: "block", fontSize: 10, color: "var(--secondary)",
  fontFamily: "var(--font-mono)", textTransform: "uppercase",
  letterSpacing: "0.08em", marginBottom: 6, fontWeight: 700
}
const iStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px",
  background: "var(--ink)", border: "1px solid var(--line2)",
  borderRadius: 8, color: "var(--bright)", fontSize: 13,
  fontFamily: "var(--font-body)", outline: "none"
}
const outlineBtn: React.CSSProperties = {
  padding: "8px 16px", background: "transparent",
  border: "1px solid var(--line2)", borderRadius: 8,
  color: "var(--secondary)", cursor: "pointer",
  fontFamily: "var(--font-body)", fontSize: 13
}
const skillTag: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "4px 10px", background: "var(--gold-bg)",
  border: "1px solid var(--gold-border)", borderRadius: 99,
  fontSize: 12, color: "var(--gold)", fontWeight: 600
}
const tagX: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  color: "var(--gold)", fontSize: 14, padding: "0", lineHeight: 1
}
const suggestionsDropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1px solid var(--line2)",
  borderRadius: 8,
  marginTop: 4,
  maxHeight: 200,
  overflowY: "auto",
  zIndex: 100,
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
}
