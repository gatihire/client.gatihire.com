"use client"
import React from "react"
import { Eye, Unlock, FileText, Briefcase, MapPin, Clock, GraduationCap, Code, AlertCircle, Coins, ArrowRight, X, Sparkles, Loader2, ExternalLink, ChevronDown, ChevronUp, Filter } from "lucide-react"

// ── Types ──
export type SearchMode = "simple" | "ai" | "jd"
export type Candidate = {
  id: string; initials: string; current_role: string; location: string
  total_experience: number; highest_qualification: string; degree: string
  university: string; technical_skills: string[]; match_score?: number | null
  is_unlocked: boolean; name?: string; email?: string; phone?: string
  file_url?: string; file_name?: string; file_type?: string
  current_salary?: number; expected_salary?: number
  soft_skills?: string[]; linkedin_profile?: string; summary?: string
  current_company?: string; previous_companies?: string[]
  job_titles?: string[]; notice_period?: string
  desired_role?: string; languages_known?: string[]; specialization?: string; education_year?: string
}

export type SidebarFilters = {
  mustHaveKeywords: string[]
  excludeKeywords: string[]
  currentCity: string[]
  experience: { min: string; max: string }
  industries: string[]
  companies: string[]
  salaryRange: { min: string; max: string }
  degrees: string[]
  education: string[]
  gender: string[]
  ageRange: { min: string; max: string }
  languages: string[]
  englishFluency: string[]
}

export const EMPTY_FILTERS: SidebarFilters = {
  mustHaveKeywords: [], excludeKeywords: [],
  currentCity: [], experience: { min: "", max: "" }, industries: [], companies: [],
  salaryRange: { min: "", max: "" }, degrees: [], education: [], gender: [],
  ageRange: { min: "", max: "" }, languages: [], englishFluency: []
}

// ── Shared Styles ──
const inputStyle: React.CSSProperties = { width: "100%", padding: "7px 10px", background: "#fff", border: "1px solid var(--line)", borderRadius: 7, color: "var(--bright)", fontSize: 12, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }
const labelStyle: React.CSSProperties = { display: "block", fontSize: 10, color: "var(--dim)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, fontWeight: 700 }

// ── Filter Section (expandable) ──
function FilterSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: open ? 14 : 0, marginBottom: open ? 14 : 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
          background: "none", border: "none", cursor: "pointer", padding: "10px 0", color: "var(--bright)",
          fontSize: 12, fontWeight: 600, fontFamily: "var(--font-body)",
        }}
      >
        {title}
        {open ? <ChevronUp size={14} color="var(--dim)" /> : <ChevronDown size={14} color="var(--dim)" />}
      </button>
      {open && <div style={{ paddingTop: 4 }}>{children}</div>}
    </div>
  )
}

// ── Tag Input ──
function TagInput({ label, tags, onAdd, onRemove, placeholder }: { label?: string; tags: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder?: string }) {
  const [val, setVal] = React.useState("")
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={{ display: "flex", gap: 6 }}>
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) { e.preventDefault(); onAdd(val.trim()); setVal("") } }}
          placeholder={placeholder || "Type + Enter"} style={{ ...inputStyle, flex: 1 }} />
        <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal("") } }}
          style={{ padding: "6px 10px", background: "var(--gold)", border: "none", borderRadius: 7, color: "#fff", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>+</button>
      </div>
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {tags.map(t => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", borderRadius: 99, fontSize: 10, color: "var(--gold)", fontWeight: 600 }}>
              {t} <span style={{ cursor: "pointer", display: "flex" }} onClick={() => onRemove(t)}><X size={10} /></span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Filter Sidebar ──
export function FilterSidebar({ filters, setFilters, show, setShow }: {
  filters: SidebarFilters; setFilters: (f: SidebarFilters) => void; show: boolean; setShow: (b: boolean) => void
}) {
  const [localFilters, setLocalFilters] = React.useState<SidebarFilters>(filters)
  React.useEffect(() => { setLocalFilters(filters) }, [filters])

  const updateF = (k: keyof SidebarFilters, v: any) => setLocalFilters(prev => ({ ...prev, [k]: v }))
  const addTag = (field: "mustHaveKeywords" | "excludeKeywords" | "currentCity" | "industries" | "companies" | "degrees" | "languages", val: string) => {
    const v = val.trim(); if (!v || localFilters[field].includes(v)) return
    updateF(field, [...localFilters[field], v])
  }
  const removeTag = (field: "mustHaveKeywords" | "excludeKeywords" | "currentCity" | "industries" | "companies" | "degrees" | "languages", val: string) =>
    updateF(field, localFilters[field].filter(t => t !== val))

  const activeCount = [
    localFilters.mustHaveKeywords.length, localFilters.excludeKeywords.length,
    localFilters.currentCity.length, localFilters.experience.min || localFilters.experience.max ? 1 : 0,
    localFilters.salaryRange.min || localFilters.salaryRange.max ? 1 : 0,
    localFilters.industries.length, localFilters.companies.length,
    localFilters.education.length, localFilters.degrees.length,
    localFilters.gender.length, localFilters.languages.length,
  ].reduce((a, b) => a + (typeof b === "number" ? b : 0), 0)

  if (!show) {
    return (
      <div style={{ width: 44, flexShrink: 0 }}>
        <button onClick={() => setShow(true)} style={{
          width: 44, height: 44, borderRadius: 10, background: "#fff", border: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative",
        }}>
          <Filter size={16} color="var(--secondary)" />
          {activeCount > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "var(--gold)", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {activeCount}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div style={{ width: 280, flexShrink: 0 }}>
      <div style={{
        background: "#fff", border: "1px solid var(--line)", borderRadius: 12,
        position: "sticky", top: 0, maxHeight: "calc(100vh - 40px)", overflowY: "auto",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={14} color="var(--secondary)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--bright)" }}>Filters</span>
            {activeCount > 0 && (
              <span style={{ padding: "1px 6px", borderRadius: 99, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", fontSize: 10, fontWeight: 700, color: "var(--gold)" }}>
                {activeCount}
              </span>
            )}
          </div>
          <button onClick={() => setShow(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", display: "flex", padding: 2 }}>
            <X size={16} />
          </button>
        </div>

        {/* Filter sections */}
        <div style={{ padding: "4px 16px", flex: 1, overflowY: "auto" }}>
          <FilterSection title="Keywords" defaultOpen={true}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TagInput label="Must have" tags={localFilters.mustHaveKeywords} onAdd={v => addTag("mustHaveKeywords", v)} onRemove={v => removeTag("mustHaveKeywords", v)} placeholder="e.g. SAP, forklift..." />
              <TagInput label="Exclude" tags={localFilters.excludeKeywords} onAdd={v => addTag("excludeKeywords", v)} onRemove={v => removeTag("excludeKeywords", v)} placeholder="e.g. intern, fresher..." />
            </div>
          </FilterSection>

          <FilterSection title="Location" defaultOpen={true}>
            <TagInput tags={localFilters.currentCity} onAdd={v => addTag("currentCity", v)} onRemove={v => removeTag("currentCity", v)} placeholder="e.g. Mumbai, Delhi NCR..." />
          </FilterSection>

          <FilterSection title="Experience & Salary" defaultOpen={true}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={labelStyle}>Experience (Years)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" placeholder="Min" value={localFilters.experience.min} onChange={e => updateF("experience", { ...localFilters.experience, min: e.target.value })} style={inputStyle} />
                  <input type="number" placeholder="Max" value={localFilters.experience.max} onChange={e => updateF("experience", { ...localFilters.experience, max: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Salary (LPA)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" placeholder="Min" value={localFilters.salaryRange.min} onChange={e => updateF("salaryRange", { ...localFilters.salaryRange, min: e.target.value })} style={inputStyle} />
                  <input type="number" placeholder="Max" value={localFilters.salaryRange.max} onChange={e => updateF("salaryRange", { ...localFilters.salaryRange, max: e.target.value })} style={inputStyle} />
                </div>
              </div>
            </div>
          </FilterSection>

          <FilterSection title="Professional Details">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TagInput label="Industries" tags={localFilters.industries} onAdd={v => addTag("industries", v)} onRemove={v => removeTag("industries", v)} />
              <TagInput label="Companies" tags={localFilters.companies} onAdd={v => addTag("companies", v)} onRemove={v => removeTag("companies", v)} />
            </div>
          </FilterSection>

          <FilterSection title="Education">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={labelStyle}>Education Level</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {["10th Pass", "12th Pass", "Diploma", "Graduate", "Post Graduate"].map(ed => (
                    <label key={ed} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--secondary)", cursor: "pointer", padding: "3px 0" }}>
                      <input type="checkbox" checked={localFilters.education.includes(ed)} onChange={e => {
                        updateF("education", e.target.checked ? [...localFilters.education, ed] : localFilters.education.filter(x => x !== ed))
                      }} style={{ accentColor: "var(--gold)" }} />
                      {ed}
                    </label>
                  ))}
                </div>
              </div>
              <TagInput label="Degrees (e.g. B.Tech)" tags={localFilters.degrees} onAdd={v => addTag("degrees", v)} onRemove={v => removeTag("degrees", v)} />
            </div>
          </FilterSection>

          <FilterSection title="Demographics & Languages">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={labelStyle}>Age Range</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="number" placeholder="Min" value={localFilters.ageRange.min} onChange={e => updateF("ageRange", { ...localFilters.ageRange, min: e.target.value })} style={inputStyle} />
                  <input type="number" placeholder="Max" value={localFilters.ageRange.max} onChange={e => updateF("ageRange", { ...localFilters.ageRange, max: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {["Male", "Female", "Other"].map(g => (
                    <label key={g} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--secondary)", cursor: "pointer" }}>
                      <input type="checkbox" checked={localFilters.gender.includes(g)} onChange={e => {
                        updateF("gender", e.target.checked ? [...localFilters.gender, g] : localFilters.gender.filter(x => x !== g))
                      }} style={{ accentColor: "var(--gold)" }} />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
              <TagInput label="Languages Known" tags={localFilters.languages} onAdd={v => addTag("languages", v)} onRemove={v => removeTag("languages", v)} />
              <div>
                <label style={labelStyle}>English Fluency</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["Basic", "Conversational", "Fluent", "Native"].map(ef => (
                    <label key={ef} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--secondary)", cursor: "pointer" }}>
                      <input type="checkbox" checked={localFilters.englishFluency.includes(ef)} onChange={e => {
                        updateF("englishFluency", e.target.checked ? [...localFilters.englishFluency, ef] : localFilters.englishFluency.filter(x => x !== ef))
                      }} style={{ accentColor: "var(--gold)" }} />
                      {ef}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, padding: "12px 16px", borderTop: "1px solid var(--line)" }}>
          <button onClick={() => { setLocalFilters(EMPTY_FILTERS); setFilters(EMPTY_FILTERS) }}
            style={{ flex: 1, padding: "9px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            Clear All
          </button>
          <button onClick={() => setFilters(localFilters)}
            style={{ flex: 1, padding: "9px", background: "var(--gold)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Format AI analysis text ──
function formatAnalysis(text: string) {
  if (!text) return null
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ background: "var(--gold-bg)", color: "var(--gold)", padding: "0 3px", borderRadius: 2 }}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

// ── Candidate Card (List Row) ──
export function CandidateCard({ c, unlocking, onUnlock, onClick, aiAnalysis, selectable, selected, onToggleSelect, primaryCta }: {
  c: Candidate; unlocking: boolean; onUnlock: () => void; onClick: () => void; aiAnalysis?: string | null
  selectable?: boolean; selected?: boolean; onToggleSelect?: () => void
  primaryCta?: { label: string; onClick: () => void; disabled?: boolean }
}) {
  const matchScore = c.match_score ?? 0
  const skills = c.technical_skills || []

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
      {selectable && (
        <div style={{ display: "flex", alignItems: "center", paddingRight: 10 }} onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={selected} onChange={() => onToggleSelect?.()}
            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--gold)" }} />
        </div>
      )}
      <div
        onClick={onClick}
        style={{
          flex: 1, background: selected ? "var(--gold-bg)" : "#fff",
          border: `1px solid ${c.is_unlocked ? "#bbf7d0" : selected ? "var(--gold-border)" : "var(--line)"}`,
          borderLeft: c.is_unlocked ? "3px solid #22c55e" : "1px solid var(--line)",
          borderRadius: 10, padding: "16px 20px", cursor: "pointer", transition: "all 0.12s",
          display: "flex", flexDirection: "column", gap: 12,
        }}
        onMouseEnter={e => { if (!selected) { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)" } }}
        onMouseLeave={e => { if (!selected) { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLElement).style.boxShadow = "none" } }}
      >
        {/* Top row: avatar + info + actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0 }}>
            {/* Avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: c.is_unlocked ? "#22c55e" : "#059669", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#fff",
            }}>
              {c.initials}
            </div>

            {/* Name + role + location */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--bright)" }}>
                  {c.is_unlocked ? c.name : <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>{c.initials}</span>}
                </span>
                {c.is_unlocked && (
                  <span style={{
                    padding: "1px 7px", borderRadius: 99, fontSize: 9, fontWeight: 700,
                    background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a",
                  }}>
                    Unlocked
                  </span>
                )}
                {!c.is_unlocked && matchScore > 0 && (
                  <span style={{
                    padding: "1px 7px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                    background: matchScore >= 80 ? "var(--green-bg)" : matchScore >= 50 ? "var(--gold-bg)" : "var(--ink)",
                    border: `1px solid ${matchScore >= 80 ? "var(--green-border)" : matchScore >= 50 ? "var(--gold-border)" : "var(--line)"}`,
                    color: matchScore >= 80 ? "var(--green)" : matchScore >= 50 ? "var(--gold)" : "var(--dim)",
                  }}>
                    {Math.round(matchScore)}%
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--secondary)", marginTop: 3, flexWrap: "wrap" }}>
                {c.current_role && (
                  <span style={{ display: "flex", alignItems: "center", gap: 3, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <Briefcase size={12} /> {c.current_role}
                  </span>
                )}
                {c.current_company && (
                  <span style={{ color: "var(--dim)" }}>{c.current_company}</span>
                )}
                {c.location && (
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={12} /> {c.location}
                  </span>
                )}
              </div>
              {/* Contact row for unlocked profiles */}
              {c.is_unlocked && (c.email || c.phone) && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "var(--dim)", marginTop: 4 }}>
                  {c.email && <span>{c.email}</span>}
                  {c.phone && <span>{c.phone}</span>}
                  {c.linkedin_profile && (
                    <a href={c.linkedin_profile} target="_blank" rel="noopener"
                      onClick={e => e.stopPropagation()}
                      style={{ color: "#0A66C2", textDecoration: "none", fontWeight: 600 }}
                    >LinkedIn</a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side info chips */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {c.total_experience != null && (
              <span style={{ padding: "4px 10px", borderRadius: 6, background: "var(--ink)", border: "1px solid var(--line)", fontSize: 11, color: "var(--secondary)", fontWeight: 600, whiteSpace: "nowrap" }}>
                {c.total_experience} yrs
              </span>
            )}
            {c.degree && (
              <span style={{ padding: "4px 10px", borderRadius: 6, background: "var(--ink)", border: "1px solid var(--line)", fontSize: 11, color: "var(--secondary)", whiteSpace: "nowrap" }}>
                {c.degree}
              </span>
            )}
            {!c.is_unlocked && (
              <button onClick={e => { e.stopPropagation(); onUnlock() }} disabled={unlocking}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7,
                  background: unlocking ? "var(--ink)" : "var(--gold-bg)", border: `1px solid ${unlocking ? "var(--line)" : "var(--gold-border)"}`,
                  color: unlocking ? "var(--dim)" : "var(--gold)", fontSize: 11, fontWeight: 700, cursor: unlocking ? "wait" : "pointer",
                }}>
                {unlocking ? <><Loader2 size={12} /> Unlocking</> : <><Unlock size={12} /> Unlock</>}
              </button>
            )}
            {c.is_unlocked && c.file_url && (
              <a href={c.file_url} target="_blank" rel="noopener" onClick={e => e.stopPropagation()}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7,
                  background: "#fff", border: "1px solid var(--line)", color: "var(--secondary)",
                  fontSize: 11, fontWeight: 600, textDecoration: "none",
                }}>
                <FileText size={12} /> Resume
              </a>
            )}
            {primaryCta && (
              <button onClick={e => { e.stopPropagation(); primaryCta.onClick() }} disabled={!!primaryCta.disabled}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7,
                  background: primaryCta.disabled ? "var(--ink)" : "var(--gold)", border: primaryCta.disabled ? "1px solid var(--line)" : "none",
                  color: primaryCta.disabled ? "var(--dim)" : "#fff", fontSize: 11, fontWeight: 700,
                  cursor: primaryCta.disabled ? "not-allowed" : "pointer",
                }}>
                <ArrowRight size={12} /> {primaryCta.label}
              </button>
            )}
          </div>
        </div>

        {/* Skills row */}
        {skills.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {skills.slice(0, 6).map((sk, i) => (
              <span key={i} style={{ padding: "3px 8px", borderRadius: 5, background: "var(--ink)", border: "1px solid var(--line)", fontSize: 10, color: "var(--secondary)" }}>
                {sk}
              </span>
            ))}
            {skills.length > 6 && <span style={{ fontSize: 10, color: "var(--dim)" }}>+{skills.length - 6}</span>}
          </div>
        )}

        {/* AI Insight */}
        {aiAnalysis ? (
          <div style={{ padding: "10px 14px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", fontSize: 12, color: "var(--secondary)", lineHeight: 1.5 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, color: "#059669", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginRight: 6 }}>
              <Sparkles size={11} /> AI
            </span>
            {formatAnalysis(aiAnalysis)}
          </div>
        ) : aiAnalysis === undefined ? null : (
          /* Skeleton while AI analysis is generating */
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
            <Sparkles size={12} color="#059669" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ width: "80%", height: 10, borderRadius: 4, background: "#bbf7d0", animation: "pulse 1.5s infinite" }} />
              <div style={{ width: "55%", height: 10, borderRadius: 4, background: "#bbf7d0", animation: "pulse 1.5s infinite" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


// ── Profile Drawer (kept for backward compat, but search page now uses CandidateProfileModal from jobs) ──
export function ProfileDrawer({ c, unlocking, onUnlock, onClose, aiAnalysis }: {
  c: Candidate; unlocking: boolean; onUnlock: () => void; onClose: () => void; aiAnalysis?: string | null
}) {
  const [showResume, setShowResume] = React.useState(false)
  const colors = ["#1e3a5f,#0f2040", "#1a3a2f,#0f2018", "#3a1a1a,#201010", "#2a1a3a,#180f28"]
  const [bg1, bg2] = colors[c.id.charCodeAt(0) % colors.length].split(",")

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
        <div style={{ position: "relative", width: 560, maxWidth: "100vw", height: "100%", background: "var(--ink)", borderLeft: "1px solid var(--line)", overflow: "auto", padding: "32px", boxSizing: "border-box", display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)" }} onClick={e => e.stopPropagation()}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flex: 1 }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: `linear-gradient(135deg,${bg1},${bg2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "600", color: "#ffffff", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{c.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--bright)", fontWeight: "600", marginBottom: "4px" }}>{c.is_unlocked ? c.name : <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em", color: "var(--bright)" }}>{c.initials}</span>}</div>
                <div style={{ fontSize: "14px", color: "var(--secondary)", fontWeight: "500", marginBottom: "4px" }}>{c.current_role}{c.current_company ? ` · ${c.current_company}` : ""}</div>
                <div style={{ fontSize: "13px", color: "var(--dim)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={14} /> {c.location}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--secondary)" }}><X size={16} /></button>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--line)" }}>
            {c.total_experience != null && <DrawerChip label="Experience" value={`${c.total_experience} yrs`} />}
            {c.notice_period && <DrawerChip label="Notice Period" value={c.notice_period} color="var(--teal)" />}
            {c.degree && <DrawerChip label="Education" value={c.degree} />}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
            {aiAnalysis && (
              <div style={{ padding: "16px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0", fontSize: "14px", color: "var(--secondary)", lineHeight: "1.6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: "600", color: "#059669", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <Sparkles size={14} /> AI Insight
                </div>
                {formatAnalysis(aiAnalysis)}
              </div>
            )}

            {c.is_unlocked ? (
              <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontWeight: "600" }}>Contact Information</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {c.phone && <DRow label="Phone" value={c.phone} />}
                  {c.email && <DRow label="Email" value={c.email} />}
                  {c.linkedin_profile && <DRow label="LinkedIn" value={c.linkedin_profile} />}
                </div>
                {c.file_url && (
                  <button onClick={() => setShowResume(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", marginTop: "20px", padding: "12px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: "8px", color: "var(--bright)", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                    <FileText size={16} /> Preview Resume
                  </button>
                )}
              </div>
            ) : (
              <div style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "15px", fontWeight: "500", color: "var(--bright)", marginBottom: "8px" }}>Profile Locked</div>
                <div style={{ fontSize: "13px", color: "var(--secondary)", marginBottom: "20px" }}>Unlock to see full details</div>
                <button onClick={onUnlock} disabled={unlocking} style={{ width: "100%", padding: "14px", background: unlocking ? "var(--ink4)" : "var(--gold)", border: "none", borderRadius: "8px", cursor: unlocking ? "wait" : "pointer", color: "#fff", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {unlocking ? <><Loader2 size={16} className="animate-spin" /> Unlocking</> : <><Unlock size={16} /> Unlock Profile (1 credit)</>}
                </button>
              </div>
            )}

            {c.summary && (
              <DrawerSection title="Summary">
                <p style={{ fontSize: "13px", color: "var(--secondary)", lineHeight: "1.6", margin: 0 }}>{c.summary}</p>
              </DrawerSection>
            )}

            {(c.technical_skills?.length ?? 0) > 0 && (
              <DrawerSection title="Skills">
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {c.technical_skills!.map((sk, i) => <span key={i} style={{ fontSize: "12px", padding: "4px 10px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: "6px", color: "var(--secondary)" }}>{sk}</span>)}
                </div>
              </DrawerSection>
            )}
          </div>
        </div>
      </div>
      {showResume && c.file_url && <ResumePreviewModal fileUrl={c.file_url} fileName={c.file_name} onClose={() => setShowResume(false)} />}
    </>
  )
}

function DrawerChip({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ flex: "1 1 calc(33.333% - 10px)", minWidth: "120px", padding: "12px 16px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: color || "var(--bright)" }}>{value}</div>
    </div>
  )
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700 }}>{title}</div>
      {children}
    </div>
  )
}

// ── Resume Preview Modal ──
export function ResumePreviewModal({ fileUrl, fileName, onClose }: { fileUrl: string; fileName?: string; onClose: () => void }) {
  const isPdf = (fileName || fileUrl).toLowerCase().includes(".pdf")
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
      <div style={{ position: "relative", width: "min(820px,95vw)", height: "85vh", background: "#fff", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 1 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--bright)", display: "flex", alignItems: "center", gap: "6px" }}><FileText size={16} /> {fileName || "Resume"}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", background: "var(--gold)", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>Open <ExternalLink size={12} /></a>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", padding: "0 4px", display: "flex", alignItems: "center" }}><X size={18} /></button>
          </div>
        </div>
        {isPdf
          ? <iframe src={fileUrl} style={{ flex: 1, border: "none", background: "#fff" }} title="Resume PDF" />
          : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
              <FileText size={48} color="var(--dim)" />
              <div style={{ fontSize: 13, color: "var(--secondary)" }}>DOCX preview not available</div>
              <a href={fileUrl} download style={{ padding: "9px 20px", background: "var(--gold)", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Download File</a>
            </div>
        }
      </div>
    </div>
  )
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "6px 0" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", width: 70, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: "13px", color: "var(--bright)", fontWeight: "500", wordBreak: "break-all" }}>{value}</div>
    </div>
  )
}

// ── Credit Banner ──
export function CreditBanner({ credits, onRequest }: { credits: number; onRequest: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: credits <= 2 ? "var(--rose-bg)" : "var(--gold-bg)", border: `1px solid ${credits <= 2 ? "var(--rose-border)" : "var(--gold-border)"}`, borderRadius: 10, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "flex", alignItems: "center", color: credits <= 2 ? "var(--rose)" : "var(--gold)" }}>
          {credits <= 2 ? <AlertCircle size={20} /> : <Coins size={20} />}
        </span>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: credits <= 2 ? "var(--rose)" : "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Profile Unlock Credits</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--bright)", lineHeight: 1 }}>{credits}</div>
        </div>
      </div>
      <button onClick={onRequest} style={{ padding: "7px 14px", background: "#fff", border: "1px solid var(--gold-border)", borderRadius: 8, color: "var(--gold)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
        Request More <ArrowRight size={12} />
      </button>
    </div>
  )
}

// ── Search Button ──
export function SearchBtn({ onClick, loading, disabled, label, icon }: { onClick: () => void; loading: boolean; disabled?: boolean; label?: string; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={loading || disabled} style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "10px 22px", background: loading || disabled ? "var(--ink)" : "var(--gold)", border: "none", borderRadius: 8,
      cursor: loading || disabled ? "not-allowed" : "pointer", color: loading || disabled ? "var(--dim)" : "#fff",
      fontWeight: 700, fontSize: 12, fontFamily: "var(--font-body)", whiteSpace: "nowrap",
    }}>
      {loading ? "Searching..." : <>{icon}{label || "Search"}</>}
    </button>
  )
}

// ── Search Skeleton ──
export function SearchSkeletonGrid() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--ink)", animation: "pulse 1.5s infinite" }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: "35%", height: 14, background: "var(--ink)", borderRadius: 4, marginBottom: 6, animation: "pulse 1.5s infinite" }} />
              <div style={{ width: "60%", height: 11, background: "var(--ink)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div style={{ width: 50, height: 24, background: "var(--ink)", borderRadius: 6, animation: "pulse 1.5s infinite" }} />
              <div style={{ width: 60, height: 24, background: "var(--ink)", borderRadius: 6, animation: "pulse 1.5s infinite" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[40, 55, 45, 50].map((w, j) => (
              <div key={j} style={{ width: w, height: 18, background: "var(--ink)", borderRadius: 5, animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
          <div style={{ width: "100%", height: 36, background: "#f0fdf4", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
        </div>
      ))}
    </div>
  )
}
