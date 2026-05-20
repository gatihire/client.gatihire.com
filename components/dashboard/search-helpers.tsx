"use client"
import React from "react"
import { Eye, Unlock, FileText, Briefcase, MapPin, Clock, GraduationCap, Code, AlertCircle, Coins, ArrowRight, Settings, ChevronLeft, ChevronRight, X, Sparkles, Loader2, ExternalLink } from "lucide-react"

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

// ── Styles ──
const s = {
  label: { display: "block", fontSize: "10px", color: "var(--secondary)", fontFamily: "var(--font-mono)", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "6px" },
  input: { width: "100%", padding: "8px 12px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--bright)", fontSize: "12px", fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" as const },
  tag: { display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", background: "var(--ink4)", border: "1px solid var(--line2)", borderRadius: "4px", fontSize: "10px", color: "var(--secondary)", fontFamily: "var(--font-mono)" },
  tagX: { cursor: "pointer", color: "var(--dim)", fontSize: "12px", lineHeight: 1 },
  summary: { cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", outline: "none", listStyle: "none", fontWeight: 500, color: "var(--bright)", fontSize: "12px", marginBottom: "8px" },
  details: { paddingBottom: "12px", borderBottom: "1px solid var(--line2)", marginBottom: "12px" }
}

// ── Filter Sidebar ──
export function FilterSidebar({ filters, setFilters, show, setShow }: {
  filters: SidebarFilters; setFilters: (f: SidebarFilters) => void; show: boolean; setShow: (b: boolean) => void
}) {
  const [localFilters, setLocalFilters] = React.useState<SidebarFilters>(filters)

  // Sync local filters when props change (e.g. clear all or new search)
  React.useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateF = (k: keyof SidebarFilters, v: any) => setLocalFilters(prev => ({ ...prev, [k]: v }))
  const addTag = (field: "mustHaveKeywords" | "excludeKeywords" | "currentCity" | "industries" | "companies" | "degrees" | "languages", val: string) => {
    const v = val.trim(); if (!v || localFilters[field].includes(v)) return
    updateF(field, [...localFilters[field], v])
  }
  const removeTag = (field: "mustHaveKeywords" | "excludeKeywords" | "currentCity" | "industries" | "companies" | "degrees" | "languages", val: string) =>
    updateF(field, localFilters[field].filter(t => t !== val))

  return (
    <div style={{ width: show ? 280 : 42, flexShrink: 0, transition: "width 0.2s" }}>
      <div style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "var(--r2)", padding: show ? "16px" : "10px 6px", position: "sticky", top: 0, maxHeight: "calc(100vh - 40px)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: show ? 16 : 0 }}>
          {show && <span style={{ fontFamily: "var(--font-display)", fontSize: "14px", fontWeight: 500, color: "var(--bright)", display: "flex", alignItems: "center", gap: "6px" }}><Settings size={16} /> Filters</span>}
          <button onClick={() => setShow(!show)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {show ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        {show && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <details style={s.details} open>
                <summary style={s.summary}>Keywords</summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <TagFilter label="Must Have Keywords" tags={localFilters.mustHaveKeywords} onAdd={v => addTag("mustHaveKeywords", v)} onRemove={v => removeTag("mustHaveKeywords", v)} />
                  <TagFilter label="Exclude Keywords" tags={localFilters.excludeKeywords} onAdd={v => addTag("excludeKeywords", v)} onRemove={v => removeTag("excludeKeywords", v)} />
                </div>
              </details>

              <details style={s.details} open>
                <summary style={s.summary}>Location</summary>
                <TagFilter label="Current City" tags={localFilters.currentCity} onAdd={v => addTag("currentCity", v)} onRemove={v => removeTag("currentCity", v)} />
              </details>

              <details style={s.details} open>
                <summary style={s.summary}>Experience & Salary</summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={s.label}>Experience (Years)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" placeholder="Min" value={localFilters.experience.min} onChange={e => updateF("experience", { ...localFilters.experience, min: e.target.value })} style={s.input} />
                      <input type="number" placeholder="Max" value={localFilters.experience.max} onChange={e => updateF("experience", { ...localFilters.experience, max: e.target.value })} style={s.input} />
                    </div>
                  </div>
                  <div>
                    <label style={s.label}>Salary (LPA)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" placeholder="Min" value={localFilters.salaryRange.min} onChange={e => updateF("salaryRange", { ...localFilters.salaryRange, min: e.target.value })} style={s.input} />
                      <input type="number" placeholder="Max" value={localFilters.salaryRange.max} onChange={e => updateF("salaryRange", { ...localFilters.salaryRange, max: e.target.value })} style={s.input} />
                    </div>
                  </div>
                </div>
              </details>

              <details style={s.details}>
                <summary style={s.summary}>Professional Details</summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <TagFilter label="Industries" tags={localFilters.industries} onAdd={v => addTag("industries", v)} onRemove={v => removeTag("industries", v)} />
                  <TagFilter label="Companies" tags={localFilters.companies} onAdd={v => addTag("companies", v)} onRemove={v => removeTag("companies", v)} />
                </div>
              </details>

              <details style={s.details}>
                <summary style={s.summary}>Education</summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={s.label}>Education Level</label>
                    {["10th Pass","12th Pass","Diploma","Graduate","Post Graduate"].map(ed => (
                      <label key={ed} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "var(--secondary)", cursor: "pointer", marginBottom: 4 }}>
                        <input type="checkbox" checked={localFilters.education.includes(ed)} onChange={e => {
                          updateF("education", e.target.checked ? [...localFilters.education, ed] : localFilters.education.filter(x => x !== ed))
                        }} />
                        {ed}
                      </label>
                    ))}
                  </div>
                  <TagFilter label="Degrees (e.g. B.Tech)" tags={localFilters.degrees} onAdd={v => addTag("degrees", v)} onRemove={v => removeTag("degrees", v)} />
                </div>
              </details>

              <details style={s.details}>
                <summary style={s.summary}>Demographics & Languages</summary>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={s.label}>Age Range</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" placeholder="Min" value={localFilters.ageRange.min} onChange={e => updateF("ageRange", { ...localFilters.ageRange, min: e.target.value })} style={s.input} />
                      <input type="number" placeholder="Max" value={localFilters.ageRange.max} onChange={e => updateF("ageRange", { ...localFilters.ageRange, max: e.target.value })} style={s.input} />
                    </div>
                  </div>
                  <div>
                    <label style={s.label}>Gender</label>
                    {["Male","Female","Other"].map(g => (
                      <label key={g} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "var(--secondary)", cursor: "pointer", marginBottom: 4 }}>
                        <input type="checkbox" checked={localFilters.gender.includes(g)} onChange={e => {
                          updateF("gender", e.target.checked ? [...localFilters.gender, g] : localFilters.gender.filter(x => x !== g))
                        }} />
                        {g}
                      </label>
                    ))}
                  </div>
                  <TagFilter label="Languages Known" tags={localFilters.languages} onAdd={v => addTag("languages", v)} onRemove={v => removeTag("languages", v)} />
                  <div>
                    <label style={s.label}>English Fluency</label>
                    {["Basic","Conversational","Fluent","Native"].map(ef => (
                      <label key={ef} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: "var(--secondary)", cursor: "pointer", marginBottom: 4 }}>
                        <input type="checkbox" checked={localFilters.englishFluency.includes(ef)} onChange={e => {
                          updateF("englishFluency", e.target.checked ? [...localFilters.englishFluency, ef] : localFilters.englishFluency.filter(x => x !== ef))
                        }} />
                        {ef}
                      </label>
                    ))}
                  </div>
                </div>
              </details>
            </div>

            <div style={{ display: "flex", gap: "8px", position: "sticky", bottom: 0, background: "var(--ink2)", paddingTop: "12px", paddingBottom: "4px", borderTop: "1px solid var(--line2)", marginTop: "auto", zIndex: 10 }}>
              <button onClick={() => {
                setLocalFilters(EMPTY_FILTERS)
                setFilters(EMPTY_FILTERS)
              }} style={{ flex: 1, padding: "10px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--dim)", fontSize: "12px", cursor: "pointer", fontWeight: 500 }}>
                Clear All
              </button>
              <button onClick={() => setFilters(localFilters)} style={{ flex: 1, padding: "10px", background: "var(--gold)", border: "none", borderRadius: "var(--r)", color: "var(--ink)", fontSize: "12px", cursor: "pointer", fontWeight: 700 }}>
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TagFilter({ label, tags, onAdd, onRemove }: { label: string; tags: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void }) {
  const [val, setVal] = React.useState("")
  return (
    <div>
      <label style={s.label}>{label}</label>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) { e.preventDefault(); onAdd(val.trim()); setVal("") } }}
          placeholder="Type + Enter" style={{ ...s.input, flex: 1 }} />
        <button onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal("") } }}
          style={{ padding: "6px 10px", background: "var(--ink4)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--secondary)", fontSize: "11px", cursor: "pointer" }}>+</button>
      </div>
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {tags.map(t => <span key={t} style={s.tag}>{t} <span style={{ ...s.tagX, display: "flex", alignItems: "center" }} onClick={() => onRemove(t)}><X size={12} /></span></span>)}
        </div>
      )}
    </div>
  )
}

// ── Candidate Card ──
export function CandidateCard({ c, unlocking, onUnlock, onClick, aiAnalysis, selectable, selected, onToggleSelect, primaryCta }: {
  c: Candidate; unlocking: boolean; onUnlock: () => void; onClick: () => void; aiAnalysis?: string | null;
  selectable?: boolean; selected?: boolean; onToggleSelect?: () => void;
  primaryCta?: { label: string; onClick: () => void; disabled?: boolean }
}) {
  const colors = ["#1e3a5f,#0f2040", "#1a3a2f,#0f2018", "#3a1a1a,#201010", "#2a1a3a,#180f28"]
  const [bg1, bg2] = colors[c.id.charCodeAt(0) % colors.length].split(",")
  const matchScore = c.match_score ?? 0;
  
  // Determine border color based on score
  let borderLeftColorStr = "#d1d5db"; // gray-300
  if (matchScore >= 80) borderLeftColorStr = "#22c55e"; // green-500
  else if (matchScore >= 50) borderLeftColorStr = "#eab308"; // yellow-500

  // Format text to bold and highlight text between ** **
  const formatAnalysis = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ background: "#fef08a", color: "#854d0e", padding: "0 4px", borderRadius: "2px" }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      {selectable && (
        <div style={{ paddingTop: "20px" }}>
          <input 
            type="checkbox" 
            checked={selected} 
            onChange={e => { e.stopPropagation(); if (onToggleSelect) onToggleSelect() }}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
        </div>
      )}
      <div 
        className="profile-card transition-all hover:shadow-md cursor-pointer"
        onClick={onClick} 
        style={{ flex: 1, background: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb", borderLeft: `4px solid ${borderLeftColorStr}`, display: "flex", flexDirection: "column", gap: "16px" }}
      >
      {/* AI Insight Section (Upfront) */}
      {aiAnalysis && (
        <div style={{ padding: "12px 16px", background: "var(--teal-bg, #f0fdfa)", borderRadius: "8px", border: "1px solid var(--teal-border, #ccfbf1)", fontSize: "13px", color: "var(--secondary)", lineHeight: "1.5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", fontWeight: "600", color: "var(--teal, #0d9488)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <Sparkles size={14} /> AI Insight
          </div>
          <div style={{ color: "#374151" }}>
            {formatAnalysis(aiAnalysis)}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg,${bg1},${bg2})`, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "600", flexShrink: 0, border: "2px solid #fff", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
            {c.initials}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: 0 }}>
                {c.is_unlocked ? c.name : <span style={{ fontFamily: "monospace", letterSpacing: "0.1em" }}>{c.initials}</span>}
              </h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "#4b5563", marginTop: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "500", maxWidth: "180px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.current_role}>
                <Briefcase size={14} /> {c.current_role || "—"}
              </span>
              {c.current_company && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.current_company}>
                  <Briefcase size={14} /> {c.current_company}
                </span>
              )}
              <span style={{ display: "flex", alignItems: "center", gap: "4px", maxWidth: "120px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={c.location}>
                <MapPin size={14} /> {c.location || "—"}
              </span>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", color: "#6b7280", marginTop: "8px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} /> {c.total_experience ? `${c.total_experience} yrs Exp` : "— Exp"}
              </span>
              {c.degree && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <GraduationCap size={14} /> {c.degree}
                </span>
              )}
              {c.technical_skills && c.technical_skills.length > 0 && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }} title={c.technical_skills.join(", ")}>
                  <Code size={14} /> {c.technical_skills.slice(0, 3).join(", ")}
                  {c.technical_skills.length > 3 ? ` +${c.technical_skills.length - 3}` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button 
            onClick={e => { e.stopPropagation(); onClick() }} 
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "6px 12px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "6px", color: "#374151", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}
          >
            <Eye size={14} /> View Profile
          </button>

          {primaryCta ? (
            <button
              onClick={(e) => { e.stopPropagation(); primaryCta.onClick() }}
              disabled={!!primaryCta.disabled}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "6px 12px",
                background: primaryCta.disabled ? "#f3f4f6" : "#2563eb",
                border: "1px solid " + (primaryCta.disabled ? "#e5e7eb" : "#1d4ed8"),
                borderRadius: "6px",
                color: primaryCta.disabled ? "#6b7280" : "#ffffff",
                fontSize: "12px",
                fontWeight: "700",
                cursor: primaryCta.disabled ? "not-allowed" : "pointer",
                opacity: primaryCta.disabled ? 0.7 : 1,
              }}
              title={primaryCta.disabled ? "Unlock profile to add to Applicants" : undefined}
            >
              <ArrowRight size={14} /> {primaryCta.label}
            </button>
          ) : null}
          
          {!c.is_unlocked && (
            <button 
              onClick={e => { e.stopPropagation(); onUnlock() }} 
              disabled={unlocking}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "6px 12px", background: unlocking ? "#f3f4f6" : "#fef08a", border: "1px solid #fde047", borderRadius: "6px", color: "#854d0e", fontSize: "12px", fontWeight: "600", cursor: unlocking ? "wait" : "pointer" }}
            >
              {unlocking ? <><Loader2 size={14} className="animate-spin" /> Unlocking…</> : <><Unlock size={14} /> Unlock Profile</>}
            </button>
          )}
          
          {c.is_unlocked && c.file_url && (
            <a 
              href={c.file_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={e => e.stopPropagation()}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "6px 12px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "6px", color: "#374151", fontSize: "12px", fontWeight: "500", textDecoration: "none" }}
            >
              <FileText size={14} /> View Resume
            </a>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}


// ── Profile Drawer ──
export function ProfileDrawer({ c, unlocking, onUnlock, onClose, aiAnalysis }: {
  c: Candidate; unlocking: boolean; onUnlock: () => void; onClose: () => void; aiAnalysis?: string | null
}) {
  const [showResume, setShowResume] = React.useState(false)
  const colors = ["#1e3a5f,#0f2040", "#1a3a2f,#0f2018", "#3a1a1a,#201010", "#2a1a3a,#180f28"]
  const [bg1, bg2] = colors[c.id.charCodeAt(0) % colors.length].split(",")

  // Format text to bold and highlight text between ** **
  const formatAnalysis = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ background: "#fef08a", color: "#854d0e", padding: "0 4px", borderRadius: "2px" }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };
  
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
        <div style={{ position: "relative", width: 560, maxWidth: "100vw", height: "100%", background: "var(--ink)", borderLeft: "1px solid var(--line)", overflow: "auto", padding: "32px", boxSizing: "border-box", display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)" }} onClick={e => e.stopPropagation()}>
          
          {/* Header Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flex: 1 }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: `linear-gradient(135deg,${bg1},${bg2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "600", color: "#ffffff", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{c.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "24px", color: "var(--bright)", fontWeight: "600", marginBottom: "4px" }}>{c.is_unlocked ? c.name : <span style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em", color: "var(--bright)" }}>{c.initials}</span>}</div>
                <div style={{ fontSize: "14px", color: "var(--secondary)", fontWeight: "500", marginBottom: "4px" }}>{c.current_role}{c.current_company ? ` · ${c.current_company}` : ""}</div>
                <div style={{ fontSize: "13px", color: "var(--dim)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  {c.location}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <button onClick={onClose} style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--secondary)", fontSize: "16px" }}><X size={16} /></button>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--line)" }}>
            {c.total_experience != null && <DrawerChip label="Experience" value={`${c.total_experience} yrs`} />}
            {c.notice_period && <DrawerChip label="Notice Period" value={c.notice_period} color="var(--teal)" />}
            {c.degree && <DrawerChip label="Education" value={c.degree} />}
          </div>

          {/* Scrollable Content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* AI Analysis Section */}
            {aiAnalysis && (
              <div style={{ padding: "16px", background: "var(--ink2)", borderRadius: "12px", border: "1px solid var(--teal-border)", fontSize: "14px", color: "var(--secondary)", lineHeight: "1.6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", fontWeight: "600", color: "var(--bright)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <span style={{ color: "var(--teal)", display: "flex", alignItems: "center", gap: "4px" }}><Sparkles size={14} /> AI Insight</span>
                </div>
                {formatAnalysis(aiAnalysis)}
              </div>
            )}

            {/* Contact / Unlock Action (Prominent) */}
            {c.is_unlocked ? (
              <div style={{ background: "var(--green-bg)", border: "1px solid var(--green-border)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px", fontWeight: "600" }}>Contact Information</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {c.phone && <DRow label="Phone" value={c.phone} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>} />}
                  {c.email && <DRow label="Email" value={c.email} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>} />}
                  {c.linkedin_profile && <DRow label="LinkedIn" value={c.linkedin_profile} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>} />}
                </div>
                {c.file_url && (
                  <button onClick={() => setShowResume(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", marginTop: "20px", padding: "12px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: "8px", color: "var(--bright)", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "background 0.2s" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Preview Original Resume
                  </button>
                )}
              </div>
            ) : (
              <div style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "12px", padding: "24px", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "50%", background: "var(--ink3)", marginBottom: "16px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div style={{ fontSize: "15px", fontWeight: "500", color: "var(--bright)", marginBottom: "8px" }}>Profile Locked</div>
                <div style={{ fontSize: "13px", color: "var(--secondary)", marginBottom: "20px", maxWidth: "80%", margin: "0 auto 20px" }}>Unlock this profile to reveal the candidate's full name, contact information, and original resume.</div>
                <button onClick={onUnlock} disabled={unlocking} style={{ width: "100%", padding: "14px", background: unlocking ? "var(--ink4)" : "var(--gold)", border: "none", borderRadius: "8px", cursor: unlocking ? "wait" : "pointer", color: "var(--ink)", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.2s" }}>
                  {unlocking ? <><Loader2 size={16} className="animate-spin" /> Unlocking…</> : <><Unlock size={16} /> Unlock Profile (1 credit)</>}
                </button>
              </div>
            )}

            {/* Summary */}
            {c.summary && (
              <DrawerSection title="Professional Summary" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="12" y2="18"></line></svg>}>
                <p style={{ fontSize: "14px", color: "var(--secondary)", lineHeight: "1.6", margin: 0 }}>{c.summary}</p>
              </DrawerSection>
            )}
            
            {/* Work history preview */}
          {((c.previous_companies || []).length > 0 || (c.job_titles || []).length > 0) && (
            <DrawerSection title="Experience Highlights" icon={<Briefcase size={16} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(c.job_titles || []).length > 0 && (
                  <div style={{ background: "var(--ink2)", padding: "16px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--bright)", marginBottom: "12px" }}>Roles</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {(c.job_titles || []).map((t, i) => (
                        <div key={i} style={{ paddingLeft: "12px", borderLeft: "2px solid var(--line2)" }}>
                          <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--bright)" }}>{t}</div>
                          <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "4px", filter: c.is_unlocked ? "none" : "blur(4px)", userSelect: c.is_unlocked ? "auto" : "none", transition: "filter 0.3s" }}>
                            Led operations and managed a team of 15 members to ensure timely delivery and dispatch across multiple regions.
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(c.previous_companies || []).length > 0 && (
                  <div style={{ background: "var(--ink2)", padding: "16px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--bright)", marginBottom: "12px" }}>Companies</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {(c.previous_companies || []).map((co, i) => <span key={i} style={{ fontSize: "13px", padding: "6px 12px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "6px", color: "var(--secondary)" }}>{co}</span>)}
                    </div>
                  </div>
                )}
              </div>
            </DrawerSection>
          )}

          {/* Education */}
          {(c.degree || c.university || c.highest_qualification) && (
            <DrawerSection title="Education" icon={<GraduationCap size={16} />}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--ink2)", padding: "16px", borderRadius: "8px", border: "1px solid var(--line)" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--bright)" }}>{c.degree || c.highest_qualification || "—"}</div>
                {c.university && <div style={{ fontSize: "13px", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "6px" }}><GraduationCap size={14} /> {c.university}</div>}
                <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "4px", filter: c.is_unlocked ? "none" : "blur(4px)", userSelect: c.is_unlocked ? "auto" : "none", transition: "filter 0.3s" }}>
                  Completed comprehensive coursework in supply chain management, operations research, and logistics planning with distinction.
                </div>
              </div>
            </DrawerSection>
          )}

          {/* Skills */}
            {(c.technical_skills?.length ?? 0) > 0 && (
              <DrawerSection title="Core Competencies" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {c.technical_skills!.map((sk, i) => <span key={i} style={{ fontSize: "13px", padding: "6px 12px", background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "6px", color: "var(--bright)" }}>{sk}</span>)}
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
    <div style={{ flex: "1 1 calc(33.333% - 10px)", minWidth: "120px", padding: "12px 16px", background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: color || "var(--bright)" }}>{value}</div>
    </div>
  )
}

function DrawerSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: "600", color: "var(--bright)", paddingBottom: "8px", borderBottom: "1px solid var(--line2)" }}>
        {icon && <span style={{ color: "var(--dim)" }}>{icon}</span>}
        {title}
      </div>
      {children}
    </div>
  )
}

// ── Resume Preview Modal ──
export function ResumePreviewModal({ fileUrl, fileName, onClose }: { fileUrl: string; fileName?: string; onClose: () => void }) {
  const isPdf = (fileName || fileUrl).toLowerCase().includes(".pdf")
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", width: "min(820px,95vw)", height: "85vh", background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "var(--r2)", overflow: "hidden", display: "flex", flexDirection: "column", zIndex: 1 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--bright)", display: "flex", alignItems: "center", gap: "6px" }}><FileText size={16} /> {fileName || "Resume"}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", background: "var(--blue-bg)", border: "1px solid var(--blue-border)", borderRadius: "var(--r)", color: "var(--blue)", fontSize: 11, textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>Open in Tab <ExternalLink size={12} /></a>
            <a href={fileUrl} download style={{ padding: "6px 12px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--secondary)", fontSize: 11, textDecoration: "none" }}>Download</a>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", padding: "0 4px", display: "flex", alignItems: "center" }}><X size={18} /></button>
          </div>
        </div>
        {isPdf
          ? <iframe src={fileUrl} style={{ flex: 1, border: "none", background: "#fff" }} title="Resume PDF" />
          : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
              <div style={{ color: "var(--dim)" }}><FileText size={48} /></div>
              <div style={{ fontSize: 13, color: "var(--secondary)" }}>DOCX preview not available in browser</div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={fileUrl} download style={{ padding: "9px 20px", background: "var(--gold)", borderRadius: 8, color: "var(--ink)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Download File</a>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "9px 20px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 8, color: "var(--secondary)", fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>Open in Tab <ExternalLink size={14} /></a>
              </div>
            </div>
        }
      </div>
    </div>
  )
}

function DRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100px", flexShrink: 0 }}>
        {icon && <span style={{ color: "var(--dim)" }}>{icon}</span>}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      </div>
      <div style={{ fontSize: "14px", color: "var(--bright)", fontWeight: "500", wordBreak: "break-all" }}>{value}</div>
    </div>
  )
}

// ── Credit Banner ──
export function CreditBanner({ credits, onRequest }: { credits: number; onRequest: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: credits <= 2 ? "var(--rose-bg)" : "var(--gold-bg)", border: `1px solid ${credits <= 2 ? "var(--rose-border)" : "var(--gold-border)"}`, borderRadius: "var(--r2)", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ display: "flex", alignItems: "center", color: credits <= 2 ? "var(--rose)" : "var(--gold)" }}>
          {credits <= 2 ? <AlertCircle size={24} /> : <Coins size={24} />}
        </span>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: credits <= 2 ? "var(--rose)" : "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Profile Unlock Credits</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--bright)", lineHeight: 1 }}>{credits}</div>
        </div>
      </div>
      <button onClick={onRequest} style={{ padding: "8px 16px", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", borderRadius: "var(--r)", color: "var(--gold)", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
        Request More Credits <ArrowRight size={14} />
      </button>
    </div>
  )
}

// ── Search Button ──
export function SearchBtn({ onClick, loading, disabled, label, icon }: { onClick: () => void; loading: boolean; disabled?: boolean; label?: string; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={loading || disabled} style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "10px 22px", background: loading || disabled ? "var(--ink4)" : "var(--gold)", border: "none", borderRadius: "var(--r)",
      cursor: loading || disabled ? "not-allowed" : "pointer", color: loading || disabled ? "var(--muted)" : "var(--ink)",
      fontWeight: 700, fontSize: 12, fontFamily: "var(--font-body)", whiteSpace: "nowrap",
    }}>
      {loading ? "Searching…" : (
        <>
          {icon}
          {label || "Search"}
        </>
      )}
    </button>
  )
}

// ── Search Skeleton ──
export function SearchSkeletonGrid() {
  return (
    <div className="profile-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="profile-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--ink3)", animation: "pulse 1.5s infinite" }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: "60%", height: 16, background: "var(--ink3)", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
              <div style={{ width: "80%", height: 12, background: "var(--ink3)", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
              <div style={{ width: "40%", height: 12, background: "var(--ink3)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            <div style={{ width: 40, height: 20, background: "var(--ink3)", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
            <div style={{ width: 60, height: 20, background: "var(--ink3)", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
            <div style={{ width: 50, height: 20, background: "var(--ink3)", borderRadius: 10, animation: "pulse 1.5s infinite" }} />
          </div>
          <div style={{ width: "100%", height: 36, background: "var(--ink3)", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
        </div>
      ))}
    </div>
  )
}

