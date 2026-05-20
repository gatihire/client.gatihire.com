"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Modal } from "@/components/ui/Modal"

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

  const [skillsGood, setSkillsGood] = useState<string[]>([])
  const [skillGoodInput, setSkillGoodInput] = useState("")

  const [generateHintOpen, setGenerateHintOpen] = useState(false)
  const [minRequirements, setMinRequirements] = useState("")
  const [generatingJd, setGeneratingJd] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const addSkillMust = (s: string) => {
    if (s.trim() && !skillsMust.includes(s.trim())) setSkillsMust(prev => [...prev, s.trim()])
    setSkillMustInput("")
  }

  const addSkillGood = (s: string) => {
    if (s.trim() && !skillsGood.includes(s.trim())) setSkillsGood(prev => [...prev, s.trim()])
    setSkillGoodInput("")
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
            type: form.employment_type,
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

      const formattedDescription = [
        jd?.description || "",
        responsibilities.length ? "\n### Key Responsibilities\n" + responsibilities.map((r: string) => `• ${r}`).join("\n") : "",
        requirements.length ? "\n### Requirements\n" + requirements.map((r: string) => `• ${r}`).join("\n") : ""
      ]
        .filter((x) => typeof x === "string" && x.trim().length)
        .join("\n")

      set("description", formattedDescription)
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
          salary_min: Number(form.salary_min) || null,
          salary_max: Number(form.salary_max) || null,
          experience_min_years: Number(form.experience_min_years) || 0,
          experience_max_years: Number(form.experience_max_years) || null,
          age_min: Number(form.age_min) || null,
          age_max: Number(form.age_max) || null,
          openings: Number(form.openings) || 1,
          skills_must_have: skillsMust,
          skills_good_to_have: skillsGood,
          source: "truckinzy",
          is_external_link: form.apply_type === "external",
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

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--bright)", fontWeight: 500, marginBottom: "4px" }}>Post a New Job</div>
        <div style={{ fontSize: "12px", color: "var(--dim)" }}>1 job post credit will be deducted when you publish</div>
      </div>

      {error && <div style={{ padding: "10px 14px", background: "var(--rose-bg)", border: "1px solid var(--rose-border)", borderRadius: "8px", marginBottom: "20px", fontSize: "12px", color: "var(--rose)" }}>{error}</div>}

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Basic Info */}
        <FormCard title="Basic Info">
          <Field label="Job Title *" value={form.title} onChange={v => set("title", v)} placeholder="e.g. Fleet Manager" required />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <SelectField label="Industry" value={form.industry} onChange={v => set("industry", v)} options={INDUSTRIES.map(i => ({ value: i, label: i }))} />
            <SelectField label="Sub Category" value={form.sub_category} onChange={v => set("sub_category", v)} options={SUB_CATEGORY_OPTIONS} />
            <Field label="Location (Area) *" value={form.location} onChange={v => set("location", v)} placeholder="e.g. Manesar" required />
            <Field label="City" value={form.city} onChange={v => set("city", v)} placeholder="e.g. Gurgaon" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <SelectField label="Employment Type" value={form.employment_type} onChange={v => set("employment_type", v)} options={[
              { value: "full_time", label: "Full-time" },
              { value: "part_time", label: "Part-time" },
              { value: "contract", label: "Contract" },
            ]} />
            <SelectField label="Shift Type" value={form.shift_type} onChange={v => set("shift_type", v)} options={[
              { value: "day", label: "Day Shift" },
              { value: "night", label: "Night Shift" },
              { value: "rotational", label: "Rotational" },
            ]} />
            <SelectField label="Urgency Tag" value={form.urgency_tag} onChange={v => set("urgency_tag", v)} options={[
              { value: "urgently_hiring", label: "Urgently Hiring" },
              { value: "immediate_joining", label: "Immediate Joining" },
              { value: "limited_openings", label: "Limited Openings" },
            ]} />
            <Field label="Number of Openings" type="number" value={form.openings.toString()} onChange={v => set("openings", v)} />
          </div>
        </FormCard>

        {/* Salary & Experience */}
        <FormCard title="Salary & Experience">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <SelectField label="Salary Type" value={form.salary_type} onChange={v => set("salary_type", v)} options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
              { value: "hourly", label: "Hourly" },
              { value: "daily", label: "Daily" },
              { value: "per_trip", label: "Per Trip" },
            ]} />
            <div />
            <Field label="Min Salary (₹)" value={form.salary_min} onChange={v => set("salary_min", v)} type="number" />
            <Field label="Max Salary (₹)" value={form.salary_max} onChange={v => set("salary_max", v)} type="number" />
            <Field label="Min Experience (Years)" value={form.experience_min_years} onChange={v => set("experience_min_years", v)} type="number" />
            <Field label="Max Experience (Years)" value={form.experience_max_years} onChange={v => set("experience_max_years", v)} type="number" />
          </div>
        </FormCard>

        {/* Requirements */}
        <FormCard title="Requirements & Preferences">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <SelectField label="Education Min" value={form.education_min} onChange={v => set("education_min", v)} options={EDUCATION_MIN_OPTIONS} />
            <SelectField label="English Level" value={form.english_level} onChange={v => set("english_level", v)} options={ENGLISH_LEVEL_OPTIONS} />
            <SelectField label="License Type" value={form.license_type} onChange={v => set("license_type", v)} options={LICENSE_TYPE_OPTIONS} />
            <SelectField label="Gender Preference" value={form.gender_preference} onChange={v => set("gender_preference", v)} options={GENDER_PREFERENCE_OPTIONS} />
            <Field label="Min Age" value={form.age_min} onChange={v => set("age_min", v)} type="number" />
            <Field label="Max Age" value={form.age_max} onChange={v => set("age_max", v)} type="number" />
          </div>
        </FormCard>

        {/* Categorization */}
        <FormCard title="Categorization">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <SelectField label="Role Category" value={form.role_category} onChange={v => set("role_category", v)} options={ROLE_CATEGORY_OPTIONS} />
            <SelectField label="Department Category" value={form.department_category} onChange={v => set("department_category", v)} options={DEPARTMENT_CATEGORY_OPTIONS} />
          </div>
        </FormCard>

        {/* Skills */}
        <FormCard title="Skills">
          <div style={{ marginBottom: "14px" }}>
            <label style={lStyle}>Must-have Skills</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input value={skillMustInput} onChange={e => setSkillMustInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkillMust(skillMustInput) } }}
                placeholder="Type skill + Enter" style={{ ...iStyle, flex: 1 }} />
              <button type="button" onClick={() => addSkillMust(skillMustInput)} style={btnStyle}>Add</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {skillsMust.map(s => (
                <span key={s} style={tagStyle}>
                  {s} <button type="button" onClick={() => setSkillsMust(p => p.filter(x => x !== s))} style={tagBtnStyle}>×</button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label style={lStyle}>Good-to-have Skills</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input value={skillGoodInput} onChange={e => setSkillGoodInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkillGood(skillGoodInput) } }}
                placeholder="Type skill + Enter" style={{ ...iStyle, flex: 1 }} />
              <button type="button" onClick={() => addSkillGood(skillGoodInput)} style={btnStyle}>Add</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {skillsGood.map(s => (
                <span key={s} style={tagStyle}>
                  {s} <button type="button" onClick={() => setSkillsGood(p => p.filter(x => x !== s))} style={tagBtnStyle}>×</button>
                </span>
              ))}
            </div>
          </div>
        </FormCard>

        {/* Apply Method */}
        <FormCard title="Apply Method">
          <SelectField label="Apply Method" value={form.apply_type} onChange={v => set("apply_type", v)} options={[
            { value: "in_platform", label: "Apply on GatiHire" },
            { value: "external", label: "External Company Site" },
          ]} />
          {form.apply_type === "external" && (
            <div style={{ marginTop: "14px" }}>
              <Field label="External Application URL *" value={form.external_apply_url} onChange={v => set("external_apply_url", v)} type="url" />
            </div>
          )}
        </FormCard>

        {/* Job Description */}
        <FormCard title="Job Description">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "-10px" }}>
            <span style={{ fontSize: "12px", color: "var(--dim)" }}>Generate a relevant JD from title, subcategory and skills.</span>
            <button type="button" onClick={() => setGenerateHintOpen(true)} style={{ ...btnStyle, fontSize: "11px", padding: "4px 10px" }}>
              ✨ Generate with AI
            </button>
          </div>
          <TextArea label="Full Description" value={form.description} onChange={v => set("description", v)} placeholder="Describe the role, responsibilities, and requirements..." rows={8} />
        </FormCard>

        <div style={{ display: "flex", gap: "12px" }}>
          <button type="button" onClick={() => router.back()} style={{ padding: "12px 24px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--secondary)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: "13px" }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ flex: 1, padding: "12px 24px", background: loading ? "var(--ink4)" : "var(--gold)", border: "none", borderRadius: "var(--r)", color: "var(--ink)", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontSize: "13px" }}>
            {loading ? "Publishing…" : "📢 Publish Job (–1 credit)"}
          </button>
        </div>
      </form>

      <Modal open={generateHintOpen} onClose={() => setGenerateHintOpen(false)} title="Generate JD with AI" size="sm">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <p style={{ fontSize: "13px", color: "var(--secondary)", margin: 0 }}>
            Add any must-haves (no benefits). Example: lanes, shift, tools, compliance, team size.
          </p>
          <textarea
            placeholder="Optional: must-have requirements, constraints, tools"
            value={minRequirements}
            onChange={(e) => setMinRequirements(e.target.value)}
            style={{ ...iStyle, minHeight: "90px", resize: "vertical" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
            <button type="button" onClick={() => setGenerateHintOpen(false)} style={{ ...btnStyle, fontSize: "13px" }}>
              Cancel
            </button>
            <button type="button" onClick={generateJD} disabled={generatingJd || !form.title.trim()} style={{ padding: "8px 14px", background: generatingJd || !form.title.trim() ? "var(--ink4)" : "var(--gold)", border: "none", borderRadius: "var(--r)", color: "var(--ink)", fontWeight: 600, cursor: generatingJd || !form.title.trim() ? "not-allowed" : "pointer", fontSize: "13px" }}>
              {generatingJd ? "Generating..." : "Generate"}
            </button>
          </div>
          {!form.title.trim() && <p style={{ fontSize: "11px", color: "var(--rose)", margin: 0, textAlign: "right" }}>Job title is required.</p>}
        </div>
      </Modal>
    </div>
  )
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "var(--r2)", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "14px", color: "var(--bright)", fontWeight: 500 }}>{title}</div>
      </div>
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label style={lStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} style={{ ...iStyle, boxSizing: "border-box" }} />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: {value: string, label: string}[] }) {
  return (
    <div>
      <label style={lStyle}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ ...iStyle, boxSizing: "border-box" }}>
        <option value="">Select...</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label style={lStyle}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows || 4} style={{ ...iStyle, resize: "vertical", height: "auto", boxSizing: "border-box" }} />
    </div>
  )
}

const lStyle: React.CSSProperties = { display: "block", fontSize: "10px", color: "var(--secondary)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }
const iStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--bright)", fontSize: "13px", fontFamily: "var(--font-body)", outline: "none" }
const btnStyle: React.CSSProperties = { padding: "8px 14px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--secondary)", cursor: "pointer", fontFamily: "var(--font-body)" }
const tagStyle: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", borderRadius: "4px", fontSize: "11px", color: "var(--gold)", fontFamily: "var(--font-mono)" }
const tagBtnStyle: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--gold)", fontSize: "12px", padding: "0" }
