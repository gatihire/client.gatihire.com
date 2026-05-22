"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CandidateCard, ProfileDrawer } from "@/components/dashboard/search-helpers"

/* ─────── SVG Icons ─────── */
function IconBack() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>)
}
function IconCopy() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>)
}
function IconEdit() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3l4 4L7 21H3v-4L17 3z"/></svg>)
}
function IconTrash() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>)
}
function IconSparkle() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/></svg>)
}
function IconPlus() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>)
}
function IconSearch() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>)
}
function IconMail() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>)
}
function IconPhone() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.908.339 1.851.574 2.81.7A2 2 0 0122 16.92z"/></svg>)
}
function IconWhatsApp() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>)
}
function IconClose() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>)
}
function IconLinkedIn() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>)
}
function IconFile() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>)
}
function IconCheck() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>)
}

const STAGE_PILL_COLORS: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  new:         { bg: "var(--gold-bg)",  border: "var(--gold-border)",  dot: "var(--gold)",  text: "var(--gold)" },
  screening:   { bg: "var(--gold-bg)",  border: "var(--gold-border)",  dot: "#f97316",      text: "#f97316" },
  shortlisted: { bg: "var(--green-bg)", border: "var(--green-border)", dot: "var(--green)", text: "var(--green)" },
  interview:   { bg: "var(--blue-bg)",  border: "var(--blue-border)",  dot: "var(--blue)",  text: "var(--blue)" },
  offer:       { bg: "#faf5ff",         border: "#e9d5ff",             dot: "var(--violet)", text: "var(--violet)" },
  hired:       { bg: "var(--green-bg)", border: "var(--green-border)", dot: "#059669",      text: "#059669" },
  rejected:    { bg: "var(--rose-bg)",  border: "var(--rose-border)",  dot: "var(--rose)",  text: "var(--rose)" },
}

function getStagePillStyle(slug: string) {
  return STAGE_PILL_COLORS[slug] || STAGE_PILL_COLORS["new"]
}

const STAGE_ORDER = ["new", "screening", "shortlisted", "interview", "offer", "hired"]

/* ─────── Candidate Profile Modal ─────── */
function CandidateProfileModal({ candidate, application, jobId, jobTitle, stages, onStageChange, onClose, detailsCache }: {
  candidate: any; application?: any; jobId: string; jobTitle?: string; stages: any[]; onStageChange?: (appId: string, stage: string) => void; onClose: () => void
  detailsCache: React.MutableRefObject<Record<string, { work_experience: any[]; education: any[] }>>
}) {
  const [activeProfileTab, setActiveProfileTab] = useState<"profile" | "resume" | "activity" | "notes">("profile")
  const [workExperience, setWorkExperience] = useState<any[]>([])
  const [education, setEducation] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [resumeExpanded, setResumeExpanded] = useState(false)
  const [noteText, setNoteText] = useState(application?.notes || "")
  const [savingNote, setSavingNote] = useState(false)

  useEffect(() => {
    if (!candidate?.id) return
    // Use cache if available
    const cached = detailsCache.current[candidate.id]
    if (cached) {
      setWorkExperience(cached.work_experience)
      setEducation(cached.education)
      setLoadingDetails(false)
      return
    }
    async function fetchDetails() {
      setLoadingDetails(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token || !candidate?.id) return
        const res = await fetch(`/api/client/candidate/${candidate.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        const we = data.work_experience || []
        const ed = data.education || []
        setWorkExperience(we)
        setEducation(ed)
        // Store in cache
        detailsCache.current[candidate.id] = { work_experience: we, education: ed }
      } catch (e) { console.error(e) }
      setLoadingDetails(false)
    }
    fetchDetails()
  }, [candidate?.id, detailsCache])

  if (!candidate) return null

  const skills = [
    ...(Array.isArray(candidate.technical_skills) ? candidate.technical_skills : []),
    ...(Array.isArray(candidate.soft_skills) ? candidate.soft_skills : []),
  ]
  const initials = (candidate.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
  const currentStage = application?.status || "new"
  // Build stage order from actual stages prop so progress bar always works
  const stageOrder = stages.length > 0 ? stages.map((s: any) => s.slug) : STAGE_ORDER
  const currentStageIdx = stageOrder.indexOf(currentStage)

  const whatsappMsg = encodeURIComponent(`Hi ${candidate.name || ""}, I'm reaching out regarding a ${jobTitle || "job"} opportunity. Would you be available for a quick discussion?`)
  const whatsappUrl = candidate.phone ? `https://wa.me/${candidate.phone.replace(/[^0-9]/g, "")}?text=${whatsappMsg}` : "#"
  const emailUrl = candidate.email ? `mailto:${candidate.email}?subject=${encodeURIComponent(`Opportunity: ${jobTitle || "Job Opening"}`)}&body=${encodeURIComponent(`Hi ${candidate.name || ""},\n\nI'm reaching out regarding a ${jobTitle || "job"} opportunity that matches your profile.\n\nWould you be available for a quick discussion?\n\nBest regards`)}` : "#"
  const callUrl = candidate.phone ? `tel:${candidate.phone}` : "#"

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div
        style={{
          width: 520, height: "100vh", background: "#fff", borderLeft: "1px solid var(--line)",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.12)", overflowY: "auto", display: "flex", flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--dim)", zIndex: 10, padding: 4 }}>
          <IconClose />
        </button>

        {/* ── Header ── */}
        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "#059669",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--bright)", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                {candidate.name || "Unknown"}
              </h3>
              <div style={{ fontSize: 13, color: "var(--secondary)", marginTop: 4 }}>
                {candidate.current_role || candidate.desired_role || "Professional"}
                {candidate.current_company && ` at ${candidate.current_company}`}
                {candidate.total_experience && ` · ${candidate.total_experience}`}
              </div>
              {candidate.location && (
                <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 2 }}>
                  {candidate.location}
                </div>
              )}
            </div>

            {/* Expectations card */}
            <div style={{
              background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px",
              fontSize: 12, minWidth: 140, flexShrink: 0,
            }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700, marginBottom: 8 }}>Expectations</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "var(--dim)" }}>Current</span>
                <span style={{ fontWeight: 700, color: "var(--bright)" }}>{candidate.current_salary || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "var(--dim)" }}>Expected</span>
                <span style={{ fontWeight: 700, color: "var(--gold)" }}>{candidate.expected_salary || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--dim)" }}>Notice</span>
                <span style={{ fontWeight: 700, color: "var(--bright)" }}>{candidate.notice_period || "—"}</span>
              </div>
            </div>
          </div>

          {/* Contact row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, fontSize: 12, color: "var(--dim)" }}>
            {candidate.phone && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IconPhone /> {candidate.phone}</span>
            )}
            {candidate.email && (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IconMail /> {candidate.email}</span>
            )}
            {candidate.location && (
              <span>{candidate.location}</span>
            )}
            {candidate.linkedin_profile && (
              <a href={candidate.linkedin_profile} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 4, color: "#0A66C2", textDecoration: "none" }}>
                <IconLinkedIn /> LinkedIn
              </a>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <a href={whatsappUrl} target="_blank" rel="noopener" style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
              background: "#25D366", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", border: "none", cursor: "pointer",
            }}>
              <IconWhatsApp /> WhatsApp
            </a>
            <a href={emailUrl} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
              background: "#fff", color: "var(--secondary)", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid var(--line)", cursor: "pointer",
            }}>
              <IconMail /> Email
            </a>
            <a href={callUrl} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
              background: "#fff", color: "var(--secondary)", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid var(--line)", cursor: "pointer",
            }}>
              <IconPhone /> Call
            </a>
            {candidate.file_url && (
              <a href={candidate.file_url} target="_blank" rel="noopener" style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                background: "#fff", color: "var(--secondary)", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid var(--line)", cursor: "pointer",
              }}>
                <IconFile /> Resume
              </a>
            )}
          </div>
        </div>

        {/* ── Stage Progress ── */}
        {application && stageOrder.length > 0 && (
          <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {stageOrder.filter((s: string) => s !== "rejected").map((stage: string, i: number) => {
                const isDone = currentStageIdx >= 0 && i <= currentStageIdx
                const isCurrent = currentStageIdx >= 0 && i === currentStageIdx
                const colors = getStagePillStyle(stage)
                const stageLabel = stages.find((s: any) => s.slug === stage)?.name || stage.charAt(0).toUpperCase() + stage.slice(1)
                const filteredOrder = stageOrder.filter((s: string) => s !== "rejected")
                return (
                  <div key={stage} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: "0 0 auto" }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        background: isDone ? (isCurrent ? colors.dot : "#059669") : "var(--ink)",
                        border: `2px solid ${isDone ? (isCurrent ? colors.dot : "#059669") : "var(--line)"}`,
                        color: isDone ? "#fff" : "var(--dim)", fontSize: 11,
                      }}>
                        {isDone && !isCurrent ? <IconCheck /> : isCurrent ? <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} /> : null}
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 600, color: isCurrent ? colors.text : isDone ? "#059669" : "var(--dim)", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                        {stageLabel}
                      </span>
                    </div>
                    {i < filteredOrder.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: isDone && !isCurrent ? "#059669" : "var(--line)", margin: "0 4px", marginBottom: 16 }} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Tab bar ── */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line)", padding: "0 28px", flexShrink: 0 }}>
          {(["profile", "resume", "activity", "notes"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveProfileTab(tab)} style={{
              background: "none", border: "none", borderBottom: activeProfileTab === tab ? "2px solid var(--gold)" : "2px solid transparent",
              padding: "10px 16px", cursor: "pointer", fontSize: 12, fontWeight: activeProfileTab === tab ? 700 : 500,
              color: activeProfileTab === tab ? "var(--bright)" : "var(--dim)", textTransform: "capitalize",
            }}>
              {tab === "notes" ? "Notes & feedback" : tab}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>

          {activeProfileTab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Summary */}
              {candidate.summary && (
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700, marginBottom: 8 }}>Summary</div>
                  <div style={{ fontSize: 13, color: "var(--secondary)", lineHeight: 1.6 }}>{candidate.summary}</div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700, marginBottom: 8 }}>Skills</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skills.map((s: string, i: number) => (
                      <span key={i} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12, color: "var(--secondary)", background: "var(--ink)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {Array.isArray(candidate.languages_known) && candidate.languages_known.length > 0 && (
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700, marginBottom: 8 }}>Languages</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {candidate.languages_known.map((l: string, i: number) => (
                      <span key={i} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12, color: "var(--secondary)", background: "#fff" }}>{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700, marginBottom: 10 }}>Experience</div>
                {loadingDetails ? (
                  <div style={{ fontSize: 12, color: "var(--dim)", padding: 12 }}>Loading...</div>
                ) : workExperience.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {workExperience.map((w: any, i: number) => (
                      <div key={w.id || i} style={{ padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--bright)" }}>{w.role || "Role"}</div>
                        <div style={{ fontSize: 12, color: "var(--secondary)", marginTop: 2 }}>
                          {w.company}{w.location ? ` · ${w.location}` : ""}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>
                          {w.duration || `${w.start_date || ""} — ${w.is_current ? "Present" : w.end_date || ""}`}
                        </div>
                        {w.description && <div style={{ fontSize: 12, color: "var(--secondary)", marginTop: 8, lineHeight: 1.5 }}>{w.description}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--dim)", padding: "8px 0" }}>
                    {candidate.current_role ? `${candidate.current_role}${candidate.current_company ? ` at ${candidate.current_company}` : ""} · ${candidate.total_experience || ""}` : "No experience data available"}
                  </div>
                )}
              </div>

              {/* Education */}
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700, marginBottom: 10 }}>Education</div>
                {loadingDetails ? (
                  <div style={{ fontSize: 12, color: "var(--dim)", padding: 12 }}>Loading...</div>
                ) : education.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {education.map((e: any, i: number) => (
                      <div key={e.id || i} style={{ padding: "12px 16px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--bright)" }}>{e.degree}{e.specialization ? ` in ${e.specialization}` : ""}</div>
                        <div style={{ fontSize: 12, color: "var(--secondary)", marginTop: 2 }}>{e.institution}</div>
                        <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>{e.year}{e.percentage ? ` · ${e.percentage}` : ""}</div>
                      </div>
                    ))}
                  </div>
                ) : candidate.degree ? (
                  <div style={{ padding: "12px 16px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--bright)" }}>{candidate.degree}{candidate.specialization ? ` in ${candidate.specialization}` : ""}</div>
                    {candidate.university && <div style={{ fontSize: 12, color: "var(--secondary)", marginTop: 2 }}>{candidate.university}</div>}
                    {candidate.education_year && <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>{candidate.education_year}</div>}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--dim)", padding: "8px 0" }}>No education data available</div>
                )}
              </div>

              {/* Certifications */}
              {Array.isArray(candidate.certifications) && candidate.certifications.length > 0 && (
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700, marginBottom: 8 }}>Certifications</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {candidate.certifications.map((c: string, i: number) => (
                      <span key={i} style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--line)", fontSize: 12, color: "var(--secondary)", background: "#fff" }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeProfileTab === "resume" && (
            <div>
              {candidate.file_url ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <a href={candidate.file_url} target="_blank" rel="noopener" style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", flex: 1,
                      background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 10,
                      fontSize: 13, fontWeight: 600, color: "var(--bright)", textDecoration: "none",
                    }}>
                      <IconFile />
                      {candidate.file_name || "Resume"}
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--gold)", fontWeight: 700 }}>Download</span>
                    </a>
                    <button onClick={() => setResumeExpanded(true)} style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "14px 16px", borderRadius: 10,
                      background: "#fff", border: "1px solid var(--line)", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--secondary)", whiteSpace: "nowrap",
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                      Expand
                    </button>
                  </div>
                  <iframe src={candidate.file_url} style={{ width: "100%", height: "60vh", border: "1px solid var(--line)", borderRadius: 10 }} />
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 40, color: "var(--dim)" }}>No resume uploaded</div>
              )}

              {/* Expanded resume modal */}
              {resumeExpanded && candidate.file_url && (
                <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setResumeExpanded(false)}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
                  <div onClick={(e) => e.stopPropagation()} style={{
                    position: "relative", width: "85vw", height: "90vh", background: "#fff", borderRadius: 16,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--bright)" }}>
                        <IconFile /> {candidate.file_name || "Resume"} — {candidate.name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <a href={candidate.file_url} target="_blank" rel="noopener" style={{
                          padding: "6px 14px", borderRadius: 8, background: "var(--gold)", color: "#fff",
                          fontSize: 12, fontWeight: 700, textDecoration: "none",
                        }}>Download</a>
                        <button onClick={() => setResumeExpanded(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", padding: 4 }}>
                          <IconClose />
                        </button>
                      </div>
                    </div>
                    <iframe src={candidate.file_url} style={{ flex: 1, width: "100%", border: "none" }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeProfileTab === "activity" && (
            <div style={{ fontSize: 12, color: "var(--dim)", padding: 20, textAlign: "center" }}>
              Activity log coming soon
            </div>
          )}

          {activeProfileTab === "notes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Existing notes */}
              {application?.notes && (
                <div style={{ padding: "14px 16px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--ink)", fontSize: 13, color: "var(--secondary)", lineHeight: 1.6 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700, marginBottom: 8 }}>Previous Note</div>
                  {application.notes}
                </div>
              )}

              {/* Note input */}
              <div>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={4}
                  placeholder="Add a note or feedback about this candidate..."
                  style={{
                    width: "100%", padding: "14px 16px", background: "#fff", border: "1px solid var(--line)", borderRadius: 10,
                    color: "var(--bright)", fontSize: 13, boxSizing: "border-box", resize: "vertical",
                    fontFamily: "var(--font-body)", lineHeight: 1.6, outline: "none",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)" }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line)" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                  <button
                    onClick={async () => {
                      if (!noteText.trim() || !application?.id || !onStageChange) return
                      setSavingNote(true)
                      try {
                        const { data: { session } } = await supabase.auth.getSession()
                        const token = session?.access_token
                        if (!token) return
                        await fetch(`/api/client/jobs/${jobId}/applicants`, {
                          method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                          body: JSON.stringify({ application_id: application.id, notes: noteText })
                        })
                        if (application) application.notes = noteText
                      } catch (e) { console.error(e) }
                      setSavingNote(false)
                    }}
                    disabled={savingNote || !noteText.trim()}
                    style={{
                      padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: noteText.trim() ? "pointer" : "not-allowed",
                      background: noteText.trim() ? "var(--gold)" : "var(--ink)", color: noteText.trim() ? "#fff" : "var(--dim)",
                      border: "none",
                    }}
                  >
                    {savingNote ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────── Move To Modal ─────── */
function MoveToModal({ stages, selectedCount, onMove, onClose }: {
  stages: any[]; selectedCount: number; onMove: (stage: string, message: string) => void; onClose: () => void
}) {
  const [selectedStage, setSelectedStage] = useState("")
  const [message, setMessage] = useState("")

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div style={{ position: "relative", width: 440, background: "#fff", borderRadius: 16, padding: 28, zIndex: 1, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--bright)", margin: "0 0 4px" }}>Move {selectedCount} candidate{selectedCount !== 1 ? "s" : ""}</h3>
        <p style={{ fontSize: 12, color: "var(--dim)", margin: "0 0 18px" }}>Select a stage and optionally add a note</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--dim)", marginBottom: 6, fontWeight: 600 }}>Move to stage</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(stages || []).map((s: any) => {
              const colors = getStagePillStyle(s.slug)
              const active = selectedStage === s.slug
              return (
                <button key={s.slug} onClick={() => setSelectedStage(s.slug)} style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99, cursor: "pointer",
                  fontSize: 12, fontWeight: 600, background: active ? colors.bg : "#fff", color: active ? colors.text : "var(--secondary)",
                  border: `1.5px solid ${active ? colors.border : "var(--line)"}`,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: 99, background: colors.dot }} />
                  {s.name}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--dim)", marginBottom: 6, fontWeight: 600 }}>Note (optional)</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Add a note about this stage change..."
            style={{ width: "100%", padding: "10px 14px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--bright)", fontSize: 13, boxSizing: "border-box", resize: "vertical", fontFamily: "var(--font-body)" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancel</button>
          <button onClick={() => { if (selectedStage) onMove(selectedStage, message) }} disabled={!selectedStage} style={{
            padding: "9px 18px", background: selectedStage ? "var(--gold)" : "var(--ink)", border: "none", borderRadius: 8,
            color: selectedStage ? "#fff" : "var(--dim)", cursor: selectedStage ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700,
          }}>
            Move to {selectedStage ? stages.find((s: any) => s.slug === selectedStage)?.name : "..."}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────── Main Component ─────── */
export function JobDashboardClient({ jobId, onClose }: { jobId: string; onClose?: () => void }) {
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"applicants" | "suggested" | "unlocked">("applicants")
  const [stages, setStages] = useState<any[]>([])
  const [activeStage, setActiveStage] = useState<string | null>(null)
  const [stagesLoaded, setStagesLoaded] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")

  // Applicants
  const [applicants, setApplicants] = useState<any[]>([])
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const applicantsFetched = useRef(false)

  // Suggested
  const [suggested, setSuggested] = useState<any[]>([])
  const [loadingSuggested, setLoadingSuggested] = useState(false)
  const [suggestedFetched, setSuggestedFetched] = useState(false)
  const [page, setPage] = useState(1)
  const [totalSuggested, setTotalSuggested] = useState(0)
  const [selectedSuggestedIds, setSelectedSuggestedIds] = useState<Set<string>>(new Set())
  const [lastSuggestedError, setLastSuggestedError] = useState<string | null>(null)

  // Unlocked
  const [unlockedProfiles, setUnlockedProfiles] = useState<any[]>([])
  const [loadingUnlocked, setLoadingUnlocked] = useState(false)
  const [unlockedFetched, setUnlockedFetched] = useState(false)
  const [selectedUnlockedIds, setSelectedUnlockedIds] = useState<Set<string>>(new Set())

  // Profile interaction
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null)
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, string>>({})
  const candidateDetailsCache = useRef<Record<string, { work_experience: any[]; education: any[] }>>({})

  // Selection & bulk actions
  const [selectedApplicantIds, setSelectedApplicantIds] = useState<Set<string>>(new Set())
  const [showMoveToModal, setShowMoveToModal] = useState(false)

  // Edit & Delete
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", location: "", description: "" })
  const [savingJob, setSavingJob] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Cache token
  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }, [])

  /* ── Data fetching with caching ── */
  useEffect(() => {
    async function fetchJob() {
      const token = await getToken()
      if (!token) return
      try {
        const res = await fetch(`/api/client/jobs/${jobId}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.job) {
          setJob(data.job)
          setEditForm({ title: data.job.title, location: data.job.location || "", description: data.job.description || "" })
        }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    fetchJob()
  }, [jobId, getToken])

  useEffect(() => {
    if (activeTab === "applicants" && !applicantsFetched.current) {
      if (!stagesLoaded) fetchStages().then(fetchApplicants)
      else fetchApplicants()
    } else if (activeTab === "suggested" && !suggestedFetched && job?.description) {
      fetchSuggested()
    } else if (activeTab === "unlocked" && !unlockedFetched) {
      fetchUnlockedProfiles()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, job])

  /* ── Supabase real-time subscription for applicants ── */
  useEffect(() => {
    const channel = supabase
      .channel(`applications-${jobId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "applications", filter: `job_id=eq.${jobId}` },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            // New applicant — refetch to get joined candidate data
            fetchApplicants()
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new
            setApplicants(prev => prev.map(a => a.id === updated.id ? { ...a, status: updated.status, notes: updated.notes } : a))
          } else if (payload.eventType === "DELETE") {
            setApplicants(prev => prev.filter(a => a.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId])

  async function fetchStages() {
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch(`/api/client/jobs/${jobId}/stages`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setStages(data.stages || [])
      setStagesLoaded(true)
    } catch (e) { console.error(e) }
  }

  async function createStage() {
    const name = prompt("Stage name")
    if (!name) return
    const token = await getToken()
    if (!token) return
    try {
      const res = await fetch(`/api/client/jobs/${jobId}/stages`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setStages(prev => [...prev, data.stage])
    } catch (e: any) { alert(e.message) }
  }

  async function fetchApplicants() {
    setLoadingApplicants(true)
    const token = await getToken()
    if (token) {
      try {
        const res = await fetch(`/api/client/jobs/${jobId}/applicants`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setApplicants(data.applicants || [])
        applicantsFetched.current = true
      } catch (e) { console.error(e) }
    }
    setLoadingApplicants(false)
  }

  async function fetchUnlockedProfiles() {
    setLoadingUnlocked(true)
    const token = await getToken()
    if (token) {
      try {
        const res = await fetch(`/api/client/jobs/${jobId}/unlocked`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        setUnlockedProfiles(data.profiles || [])
        setUnlockedFetched(true)
      } catch (e) { console.error(e) }
    }
    setLoadingUnlocked(false)
  }

  async function fetchSuggested(pageToFetch = 1) {
    setLoadingSuggested(true)
    setLastSuggestedError(null)
    const token = await getToken()
    if (token && job?.description) {
      try {
        let res = await fetch(`/api/client/jobs/${jobId}/matches?page=${pageToFetch}&limit=25`, { headers: { Authorization: `Bearer ${token}` } })
        let data = await res.json()
        if (data.needs_matchmaking) {
          const genRes = await fetch(`/api/client/jobs/${jobId}/matches`, { method: "POST", headers: { Authorization: `Bearer ${token}` } })
          if (!genRes.ok) { const gd = await genRes.json().catch(() => ({})); throw new Error(gd.error || "Failed") }
          res = await fetch(`/api/client/jobs/${jobId}/matches?page=${pageToFetch}&limit=25`, { headers: { Authorization: `Bearer ${token}` } })
          data = await res.json()
        }
        setSuggested(data.results || [])
        setTotalSuggested(data.total || 0)
        setSuggestedFetched(true)

        if (data.results && data.results.length > 0) {
          const profileIds = data.results.map((c: any) => c.id)
          fetch(`/api/client/jobs/${jobId}/matched`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ profileIds, matchScore: 0.85, matchReason: "AI-matched based on JD" })
          }).catch(console.error)
        }

        if (data.results?.length > 0) {
          const unanalyzed = data.results.filter((c: any) => !aiAnalysisMap[c.id]).slice(0, 5)
          if (unanalyzed.length > 0) {
            fetch("/api/client/search/analyze", {
              method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ candidates: unanalyzed, requirement: job.description })
            }).then(r => r.json()).then(d => {
              if (d.analysis) setAiAnalysisMap(prev => {
                const next = { ...prev }
                d.analysis.forEach((item: any) => { if (item.id && item.analysis) next[item.id] = item.analysis })
                return next
              })
            }).catch(console.error)
          }
        }
      } catch (e) {
        console.error(e)
        setLastSuggestedError((e as any)?.message || "Failed to load suggestions")
      }
    }
    setLoadingSuggested(false)
  }

  async function setApplicantStage(applicationId: string, stage: string, notes?: string) {
    const token = await getToken()
    if (!token) return
    const body: any = { application_id: applicationId, status: stage }
    if (notes) body.notes = notes
    await fetch(`/api/client/jobs/${jobId}/applicants`, {
      method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
    setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, status: stage, ...(notes ? { notes } : {}) } : a))
  }

  async function bulkMoveToStage(stage: string, message: string) {
    const token = await getToken()
    if (!token) return
    const promises = Array.from(selectedApplicantIds).map(appId => {
      const body: any = { application_id: appId, status: stage }
      if (message) body.notes = message
      return fetch(`/api/client/jobs/${jobId}/applicants`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
    })
    await Promise.all(promises)
    setApplicants(prev => prev.map(a =>
      selectedApplicantIds.has(a.id) ? { ...a, status: stage, ...(message ? { notes: message } : {}) } : a
    ))
    setSelectedApplicantIds(new Set())
    setShowMoveToModal(false)
  }

  const unlock = async (candidateId: string) => {
    setUnlocking(candidateId)
    try {
      const token = await getToken()
      if (!token) return
      const res = await fetch("/api/client/unlock", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId, job_id: jobId, source: "suggested" })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Unlock failed")
      setSuggested(prev => prev.map(c => c.id === candidateId ? { ...c, is_unlocked: true, ...data.candidate } : c))
      if (selectedCard?.id === candidateId) setSelectedCard((prev: any) => prev ? { ...prev, is_unlocked: true, ...data.candidate } : prev)
    } catch (e: any) { alert(e.message) } finally { setUnlocking(null) }
  }

  async function addMultipleToPipeline(candidateIds: string[], source: "suggested" | "unlocked") {
    const token = await getToken()
    if (!token) return
    setUnlocking("multiple")
    try {
      const res = await fetch(`/api/client/jobs/${jobId}/pipeline/batch`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_ids: candidateIds, unlock_first: source === "suggested", default_stage: "screening" })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      alert(`Added ${candidateIds.length} candidate(s) to pipeline!`)
      if (source === "suggested") setSelectedSuggestedIds(new Set())
      if (source === "unlocked") setSelectedUnlockedIds(new Set())
      fetchApplicants()
      if (source === "suggested") fetchSuggested(page)
    } catch (e: any) { alert(e.message) } finally { setUnlocking(null) }
  }

  async function deleteJob() {
    if (!confirm("Delete this job? This cannot be undone.")) return
    setIsDeleting(true)
    const token = await getToken()
    if (token) {
      try {
        await fetch(`/api/client/jobs/${jobId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
        if (onClose) onClose(); else router.push("/dashboard/jobs")
        router.refresh()
      } catch (e) { console.error(e) }
    }
  }

  async function saveJob() {
    setSavingJob(true)
    const token = await getToken()
    if (token) {
      try {
        const res = await fetch(`/api/client/jobs/${jobId}`, {
          method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(editForm)
        })
        const data = await res.json()
        if (data.job) setJob(data.job)
        setIsEditing(false)
      } catch (e) { console.error(e) }
    }
    setSavingJob(false)
  }

  /* ── Render helpers ── */
  if (loading) return <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ color: "#fff", fontSize: 14 }}>Loading...</div></div>
  if (!job) return <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ background: "#fff", padding: 40, borderRadius: 12, color: "var(--dim)" }}>Job not found.</div></div>

  const normalizedApplicants = applicants.map((a: any) => {
    const s = a.status || "new"
    const normalized = s === "in_pipeline" ? "screening" : s === "pending" ? "new" : s
    return { ...a, status: normalized }
  })

  const applicantsByStage: Record<string, any[]> = {}
  ;(stages || []).forEach((s: any) => { applicantsByStage[s.slug] = [] })
  normalizedApplicants.forEach((a: any) => {
    const key = applicantsByStage[a.status] ? a.status : "new"
    applicantsByStage[key] = applicantsByStage[key] || []
    applicantsByStage[key].push(a)
  })

  const filteredApplicants = (activeStage ? (applicantsByStage[activeStage] || []) : normalizedApplicants)
    .filter(a => {
      if (!searchQuery) return true
      const c = a.candidates
      if (!c) return false
      const q = searchQuery.toLowerCase()
      return (c.name || "").toLowerCase().includes(q) || (c.location || "").toLowerCase().includes(q) || (c.current_role || "").toLowerCase().includes(q)
    })

  const dateStr = job.created_at ? new Date(job.created_at).toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" }) : ""
  const newCount = normalizedApplicants.filter(a => a.status === "new").length

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.5)" }}>
      <div style={{ width: "100vw", height: "100vh", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Top bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid var(--line)", background: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={onClose || (() => router.push("/dashboard/jobs"))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "6px 0" }}>
              <IconBack /> Jobs
            </button>
            <span style={{ color: "var(--line2)" }}>/</span>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 800, color: "var(--bright)", margin: 0, letterSpacing: "-0.01em" }}>
                {job.title}
                <span style={{ fontWeight: 400, color: "var(--dim)", fontSize: 13, marginLeft: 8 }}>— {job.location || "Remote"}</span>
              </h1>
              <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 2 }}>
                {normalizedApplicants.length} candidate{normalizedApplicants.length !== 1 ? "s" : ""} · {newCount} new · {dateStr}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/apply/${jobId}`); alert("Link copied!") }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--secondary)", cursor: "pointer" }}>
              <IconCopy /> Copy Link
            </button>
            <button onClick={() => setIsEditing(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--secondary)", cursor: "pointer" }}>
              <IconEdit /> Edit
            </button>
            <button onClick={deleteJob} disabled={isDeleting} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fff", border: "1px solid var(--rose-border)", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--rose)", cursor: isDeleting ? "wait" : "pointer" }}>
              <IconTrash /> {isDeleting ? "..." : "Delete"}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 24px", borderBottom: "1px solid var(--line)", background: "#fff", flexShrink: 0 }}>
          {([
            { key: "applicants", label: "Applicants", count: normalizedApplicants.length },
            { key: "suggested", label: "AI Matches", count: suggested.length || totalSuggested },
            { key: "unlocked", label: "Unlocked", count: unlockedProfiles.length },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: "none", border: "none", borderBottom: activeTab === tab.key ? "2px solid var(--gold)" : "2px solid transparent",
                padding: "12px 20px", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? "var(--bright)" : "var(--dim)", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {tab.label}
              <span style={{ padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600, background: activeTab === tab.key ? "var(--gold-bg)" : "var(--ink)", color: activeTab === tab.key ? "var(--gold)" : "var(--dim)", border: `1px solid ${activeTab === tab.key ? "var(--gold-border)" : "var(--line)"}` }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: "auto", background: "var(--ink)" }}>

          {/* ═══ APPLICANTS TAB ═══ */}
          {activeTab === "applicants" && (
            <div style={{ padding: "16px 24px" }}>
              {/* Stage pills + search + view toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", flex: 1 }}>
                  {stagesLoaded && (
                    <>
                      <button
                        onClick={() => setActiveStage(null)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, cursor: "pointer", fontSize: 12, fontWeight: 600,
                          background: !activeStage ? "var(--bright)" : "#fff", color: !activeStage ? "#fff" : "var(--secondary)",
                          border: `1px solid ${!activeStage ? "var(--bright)" : "var(--line)"}`,
                        }}
                      >
                        All <span style={{ opacity: 0.7 }}>{normalizedApplicants.length}</span>
                      </button>
                      {(stages || []).map((s: any) => {
                        const count = (applicantsByStage[s.slug] || []).length
                        const active = activeStage === s.slug
                        const colors = getStagePillStyle(s.slug)
                        return (
                          <button
                            key={s.slug}
                            onClick={() => setActiveStage(active ? null : s.slug)}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 99, cursor: "pointer", fontSize: 12, fontWeight: 600,
                              background: active ? colors.bg : "#fff", color: active ? colors.text : "var(--secondary)",
                              border: `1px solid ${active ? colors.border : "var(--line)"}`,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: 99, background: colors.dot }} />
                            {s.name} <span style={{ opacity: 0.7 }}>{count}</span>
                          </button>
                        )
                      })}
                      <button onClick={createStage} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 99, cursor: "pointer", fontSize: 12, fontWeight: 600, background: "#fff", color: "var(--dim)", border: "1px dashed var(--line2)" }}>
                        <IconPlus /> Add
                      </button>
                    </>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 12px", minWidth: 200 }}>
                    <IconSearch />
                    <input
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by name, skill, location..."
                      style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: "var(--bright)", flex: 1, fontFamily: "var(--font-body)" }}
                    />
                  </div>
                  <div style={{ display: "flex", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
                    <button onClick={() => setViewMode("table")} style={{ padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: viewMode === "table" ? "var(--bright)" : "#fff", color: viewMode === "table" ? "#fff" : "var(--dim)" }}>Table</button>
                    <button onClick={() => setViewMode("kanban")} style={{ padding: "6px 12px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: viewMode === "kanban" ? "var(--bright)" : "#fff", color: viewMode === "kanban" ? "#fff" : "var(--dim)" }}>Kanban</button>
                  </div>
                </div>
              </div>

              {loadingApplicants ? (
                <div style={{ textAlign: "center", color: "var(--dim)", padding: 40 }}>Loading applicants...</div>
              ) : normalizedApplicants.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--dim)", padding: 60, background: "#fff", borderRadius: 12, border: "1px dashed var(--line2)" }}>
                  No applicants yet. Share the job link to start receiving applications.
                </div>
              ) : viewMode === "table" ? (
                /* ── TABLE VIEW ── */
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden" }}>
                  {/* Table header */}
                  <div style={{ display: "grid", gridTemplateColumns: "32px 1.5fr 1fr 0.6fr 0.6fr 0.6fr 0.5fr 0.5fr 120px", gap: 0, padding: "10px 16px", borderBottom: "1px solid var(--line)", background: "var(--ink)" }}>
                    {["", "CANDIDATE", "CURRENT TITLE", "EXPERIENCE", "CURRENT CTC", "ASK CTC", "NOTICE", "SOURCE", "STAGE"].map((h, i) => (
                      <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>{h}</div>
                    ))}
                  </div>

                  {/* Table rows */}
                  {filteredApplicants.map((app: any) => {
                    const c = app.candidates
                    if (!c) return null
                    const stageSlug = app.status || "new"
                    const stageColors = getStagePillStyle(stageSlug)
                    const isSelected = selectedApplicantIds.has(app.id)

                    return (
                      <div
                        key={app.id}
                        onClick={() => { setSelectedCard({ ...c, is_unlocked: true }); setSelectedApplication(app) }}
                        style={{
                          display: "grid", gridTemplateColumns: "32px 1.5fr 1fr 0.6fr 0.6fr 0.6fr 0.5fr 0.5fr 120px",
                          gap: 0, padding: "12px 16px", borderBottom: "1px solid var(--line)",
                          alignItems: "center", cursor: "pointer", transition: "background 0.1s",
                          background: isSelected ? "var(--gold-bg)" : "#fff",
                        }}
                        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--ink)" }}
                        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "#fff" }}
                      >
                        {/* Checkbox */}
                        <div onClick={(e) => { e.stopPropagation() }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedApplicantIds(prev => {
                              const next = new Set(prev)
                              if (next.has(app.id)) next.delete(app.id); else next.add(app.id)
                              return next
                            })}
                            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "var(--gold)" }}
                          />
                        </div>

                        {/* Candidate name + location */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: stageColors.bg, border: `1px solid ${stageColors.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: stageColors.text, flexShrink: 0,
                          }}>
                            {(c.name || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--bright)", display: "flex", alignItems: "center", gap: 6 }}>
                              {c.name || "Unknown"}
                              {stageSlug === "new" && <span style={{ background: "var(--gold-bg)", color: "var(--gold)", fontSize: 9, padding: "1px 6px", borderRadius: 4, fontWeight: 700, border: "1px solid var(--gold-border)" }}>New</span>}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 1 }}>
                              {c.location || "—"}
                            </div>
                          </div>
                        </div>

                        {/* Current Title */}
                        <div style={{ fontSize: 12, color: "var(--secondary)" }}>{c.current_role || "—"}</div>

                        {/* Experience */}
                        <div style={{ fontSize: 12, color: "var(--secondary)" }}>{c.total_experience || "—"}</div>

                        {/* Current CTC */}
                        <div style={{ fontSize: 12, color: "var(--secondary)" }}>{c.current_salary || "—"}</div>

                        {/* Ask CTC */}
                        <div style={{ fontSize: 12, color: "var(--secondary)", fontWeight: c.expected_salary ? 600 : 400 }}>{c.expected_salary || "—"}</div>

                        {/* Notice */}
                        <div style={{ fontSize: 12, color: "var(--secondary)" }}>{c.notice_period || "—"}</div>

                        {/* Source */}
                        <div style={{ fontSize: 12, color: "var(--dim)" }}>{app.source || "Applied"}</div>

                        {/* Stage dropdown */}
                        <div onClick={(e) => e.stopPropagation()}>
                          {stagesLoaded ? (
                            <select
                              value={stageSlug}
                              onChange={(e) => setApplicantStage(app.id, e.target.value)}
                              style={{
                                padding: "5px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                background: stageColors.bg, color: stageColors.text, border: `1px solid ${stageColors.border}`,
                                fontFamily: "var(--font-body)", outline: "none",
                              }}
                            >
                              {(stages || []).map((s: any) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                            </select>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}

                  {filteredApplicants.length === 0 && (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--dim)", fontSize: 13 }}>
                      {searchQuery ? `No results for "${searchQuery}"` : "No applicants in this stage."}
                    </div>
                  )}
                </div>
              ) : (
                /* ── KANBAN VIEW ── */
                <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 16 }}>
                  {(stages || []).map((s: any) => {
                    const stageApps = applicantsByStage[s.slug] || []
                    const colors = getStagePillStyle(s.slug)
                    return (
                      <div key={s.slug} style={{ minWidth: 280, maxWidth: 300, flex: "0 0 280px", background: "#fff", borderRadius: 12, border: "1px solid var(--line)", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 99, background: colors.dot }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--bright)" }}>{s.name}</span>
                          <span style={{ fontSize: 11, color: "var(--dim)", marginLeft: "auto" }}>{stageApps.length}</span>
                        </div>
                        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto", maxHeight: 500 }}>
                          {stageApps.map((app: any) => {
                            const c = app.candidates
                            if (!c) return null
                            return (
                              <div
                                key={app.id}
                                onClick={() => { setSelectedCard({ ...c, is_unlocked: true }); setSelectedApplication(app) }}
                                style={{ padding: "12px", borderRadius: 8, border: "1px solid var(--line)", cursor: "pointer", background: "#fff", transition: "box-shadow 0.1s" }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)" }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none" }}
                              >
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--bright)" }}>{c.name || "Unknown"}</div>
                                <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>{c.current_role || "—"} · {c.location || "—"}</div>
                                <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 4, display: "flex", gap: 8 }}>
                                  <span>{c.total_experience || "—"}</span>
                                  <span>CTC: {c.expected_salary || "—"}</span>
                                </div>
                              </div>
                            )
                          })}
                          {stageApps.length === 0 && <div style={{ fontSize: 12, color: "var(--dim)", textAlign: "center", padding: 20 }}>Empty</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Selection action bar */}
              {selectedApplicantIds.size > 0 && (
                <div style={{
                  position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 20px",
                  background: "var(--bright)", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.2)", zIndex: 150,
                }}>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{selectedApplicantIds.size} selected</span>
                  <button onClick={() => setShowMoveToModal(true)} style={{ padding: "7px 14px", borderRadius: 8, background: "var(--gold)", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    Move to →
                  </button>
                  <button onClick={() => setSelectedApplicantIds(new Set())} style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer" }}>
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ═══ SUGGESTED TAB ═══ */}
          {activeTab === "suggested" && (
            <div style={{ padding: "16px 24px" }}>
              {loadingSuggested ? (
                <div style={{ textAlign: "center", color: "var(--dim)", padding: 60, background: "#fff", borderRadius: 12 }}>
                  <div style={{ marginBottom: 8 }}>Finding best matches based on JD...</div>
                  <div style={{ fontSize: 12, color: "var(--dim)" }}>This may take a moment</div>
                </div>
              ) : suggested.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 12, border: "1px dashed var(--line2)" }}>
                  <div style={{ marginBottom: 12, color: "var(--dim)" }}>{lastSuggestedError || "No suggestions found yet."}</div>
                  <button onClick={() => fetchSuggested(page)} style={{ background: "var(--gold)", border: "none", borderRadius: 8, padding: "10px 20px", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><IconSparkle /> Run AI Matching</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", borderRadius: 8, fontSize: 13, color: "var(--gold)", fontWeight: 600 }}>
                      <IconSparkle /> {totalSuggested} pre-vetted candidates matched
                    </div>
                    {selectedSuggestedIds.size > 0 && (
                      <button onClick={() => addMultipleToPipeline(Array.from(selectedSuggestedIds), "suggested")} disabled={unlocking === "multiple"}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--gold)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        {unlocking === "multiple" ? "Adding..." : `Unlock & Add ${selectedSuggestedIds.size} to Pipeline`}
                      </button>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                    {suggested.map(c => (
                      <CandidateCard
                        key={c.id} c={c} unlocking={unlocking === c.id} onUnlock={() => unlock(c.id)} onClick={() => setSelectedCard(c)}
                        aiAnalysis={aiAnalysisMap[c.id]} selectable={true} selected={selectedSuggestedIds.has(c.id)}
                        onToggleSelect={() => setSelectedSuggestedIds(prev => { const next = new Set(prev); if (next.has(c.id)) next.delete(c.id); else next.add(c.id); return next })}
                        primaryCta={{ label: "Add to Screening", disabled: !c.is_unlocked, onClick: () => addMultipleToPipeline([c.id], "suggested") }}
                      />
                    ))}
                  </div>
                  {totalSuggested > 25 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 12 }}>
                      <button onClick={() => { setPage(p => p - 1); fetchSuggested(page - 1) }} disabled={page <= 1} style={{ padding: "6px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", fontSize: 12, cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>Prev</button>
                      <span style={{ fontSize: 12, color: "var(--dim)" }}>Page {page} of {Math.ceil(totalSuggested / 25)}</span>
                      <button onClick={() => { setPage(p => p + 1); fetchSuggested(page + 1) }} disabled={page >= Math.ceil(totalSuggested / 25)} style={{ padding: "6px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", fontSize: 12, cursor: "pointer" }}>Next</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ UNLOCKED TAB ═══ */}
          {activeTab === "unlocked" && (
            <div style={{ padding: "16px 24px" }}>
              {loadingUnlocked ? (
                <div style={{ textAlign: "center", color: "var(--dim)", padding: 40 }}>Loading unlocked profiles...</div>
              ) : unlockedProfiles.length === 0 ? (
                <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 12, border: "1px dashed var(--line2)", color: "var(--dim)" }}>
                  No unlocked profiles for this job yet.
                  <div style={{ marginTop: 8, fontSize: 12 }}>Unlock from <strong>AI Matches</strong> tab to show profiles here.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, color: "var(--secondary)" }}>{unlockedProfiles.length} unlocked profiles</div>
                    {selectedUnlockedIds.size > 0 && (
                      <button onClick={() => addMultipleToPipeline(Array.from(selectedUnlockedIds), "unlocked")} disabled={unlocking === "multiple"}
                        style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--gold)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        {unlocking === "multiple" ? "Adding..." : `Add ${selectedUnlockedIds.size} to Pipeline`}
                      </button>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
                    {unlockedProfiles.map((c: any) => {
                      c.is_unlocked = true
                      return (
                        <CandidateCard key={c.id} c={c} unlocking={false} onUnlock={() => {}} onClick={() => setSelectedCard(c)}
                          selectable={true} selected={selectedUnlockedIds.has(c.id)}
                          onToggleSelect={() => setSelectedUnlockedIds(prev => { const next = new Set(prev); if (next.has(c.id)) next.delete(c.id); else next.add(c.id); return next })}
                          primaryCta={{ label: "Add to Screening", onClick: () => addMultipleToPipeline([c.id], "unlocked") }}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Profile Modal ── */}
        {selectedCard && (
          <CandidateProfileModal
            candidate={selectedCard}
            application={selectedApplication}
            jobId={jobId}
            jobTitle={job?.title}
            stages={stages}
            onStageChange={setApplicantStage}
            onClose={() => { setSelectedCard(null); setSelectedApplication(null) }}
            detailsCache={candidateDetailsCache}
          />
        )}

        {/* ── Move To Modal ── */}
        {showMoveToModal && (
          <MoveToModal
            stages={stages}
            selectedCount={selectedApplicantIds.size}
            onMove={bulkMoveToStage}
            onClose={() => setShowMoveToModal(false)}
          />
        )}

        {/* ── Edit Modal ── */}
        {isEditing && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setIsEditing(false)} />
            <div style={{ position: "relative", width: 520, background: "#fff", borderRadius: 16, padding: 28, zIndex: 1, display: "flex", flexDirection: "column", gap: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              <h2 style={{ fontSize: 18, color: "var(--bright)", fontWeight: 800, margin: 0 }}>Edit Job</h2>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--dim)", marginBottom: 6, fontWeight: 600 }}>Title</label>
                <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} style={{ width: "100%", padding: "10px 14px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--bright)", fontSize: 14, boxSizing: "border-box", fontFamily: "var(--font-body)" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--dim)", marginBottom: 6, fontWeight: 600 }}>Location</label>
                <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} style={{ width: "100%", padding: "10px 14px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--bright)", fontSize: 14, boxSizing: "border-box", fontFamily: "var(--font-body)" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "var(--dim)", marginBottom: 6, fontWeight: 600 }}>Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={6} style={{ width: "100%", padding: "10px 14px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--bright)", fontSize: 14, boxSizing: "border-box", resize: "vertical", fontFamily: "var(--font-body)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: "9px 18px", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Cancel</button>
                <button onClick={saveJob} disabled={savingJob} style={{ padding: "9px 18px", background: "var(--gold)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  {savingJob ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
