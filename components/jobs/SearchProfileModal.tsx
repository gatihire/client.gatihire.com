"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

function IconClose() {
  return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>)
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
function IconLinkedIn() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>)
}
function IconFile() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>)
}
function IconLock() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>)
}
function IconSparkle() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z"/></svg>)
}
function IconExpand() {
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>)
}

function formatBoldText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <span key={i} style={{ fontWeight: 700, color: "#065f46", background: "#d1fae5", padding: "1px 5px", borderRadius: 4 }}>{part.slice(2, -2)}</span>
    }
    return part
  })
}

export function SearchCandidateProfileModal({ candidate, onClose, detailsCache, aiAnalysis, unlocking, onUnlock }: {
  candidate: any
  onClose: () => void
  detailsCache: React.MutableRefObject<Record<string, { work_experience: any[]; education: any[] }>>
  aiAnalysis?: string
  unlocking?: boolean
  onUnlock?: () => void
}) {
  const [activeTab, setActiveTab] = useState<"profile" | "resume">("profile")
  const [workExperience, setWorkExperience] = useState<any[]>([])
  const [education, setEducation] = useState<any[]>([])
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [resumeExpanded, setResumeExpanded] = useState(false)

  const isUnlocked = candidate.is_unlocked

  useEffect(() => {
    if (!candidate?.id) return
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
  const initials = (candidate.name || candidate.initials || "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
  const displayName = isUnlocked ? (candidate.name || "Unknown") : (candidate.initials || "Locked")

  const whatsappMsg = encodeURIComponent(`Hi ${candidate.name || ""}, I came across your profile and wanted to discuss a potential opportunity. Would you be available for a quick discussion?`)
  const whatsappUrl = candidate.phone ? `https://wa.me/${candidate.phone.replace(/[^0-9]/g, "")}?text=${whatsappMsg}` : "#"
  const emailUrl = candidate.email ? `mailto:${candidate.email}?subject=${encodeURIComponent("Job Opportunity")}&body=${encodeURIComponent(`Hi ${candidate.name || ""},\n\nI came across your profile and wanted to discuss a potential opportunity.\n\nWould you be available for a quick discussion?\n\nBest regards`)}` : "#"
  const callUrl = candidate.phone ? `tel:${candidate.phone}` : "#"

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div
        style={{
          width: 520, height: "100vh", background: "#fff", borderLeft: "1px solid var(--line)",
          boxShadow: "-8px 0 30px rgba(0,0,0,0.12)", overflowY: "auto", display: "flex", flexDirection: "column",
          position: "relative", zIndex: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--dim)", zIndex: 10, padding: 4 }}>
          <IconClose />
        </button>

        {/* ── Header ── */}
        <div style={{ padding: "28px 28px 20px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: isUnlocked ? "#059669" : "var(--dim)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>
              {isUnlocked ? initials : <IconLock />}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--bright)", margin: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {displayName}
                {!isUnlocked && (
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 99, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontWeight: 600 }}>
                    Locked
                  </span>
                )}
                {candidate.match_score != null && (
                  <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: "var(--green-bg)", border: "1px solid var(--green-border)", color: "var(--green)", fontWeight: 700 }}>
                    {candidate.match_score}% match
                  </span>
                )}
              </h3>
              <div style={{ fontSize: 13, color: "var(--secondary)", marginTop: 4 }}>
                {candidate.current_role || candidate.desired_role || "Professional"}
                {candidate.current_company && ` at ${candidate.current_company}`}
                {candidate.total_experience != null && ` · ${candidate.total_experience}`}
              </div>
              {candidate.location && (
                <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 2 }}>
                  {candidate.location}
                </div>
              )}
            </div>

            {isUnlocked && (
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
            )}
          </div>

          {isUnlocked && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, fontSize: 12, color: "var(--dim)" }}>
              {candidate.phone && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IconPhone /> {candidate.phone}</span>
              )}
              {candidate.email && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><IconMail /> {candidate.email}</span>
              )}
              {candidate.linkedin_profile && (
                <a href={candidate.linkedin_profile} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 4, color: "#0A66C2", textDecoration: "none" }}>
                  <IconLinkedIn /> LinkedIn
                </a>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {isUnlocked ? (
              <>
                <a href={whatsappUrl} target="_blank" rel="noopener" style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                  background: "#25D366", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none",
                }}>
                  <IconWhatsApp /> WhatsApp
                </a>
                <a href={emailUrl} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                  background: "#fff", color: "var(--secondary)", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid var(--line)",
                }}>
                  <IconMail /> Email
                </a>
                <a href={callUrl} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                  background: "#fff", color: "var(--secondary)", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid var(--line)",
                }}>
                  <IconPhone /> Call
                </a>
                {candidate.file_url && (
                  <a href={candidate.file_url} target="_blank" rel="noopener" style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
                    background: "#fff", color: "var(--secondary)", fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid var(--line)",
                  }}>
                    <IconFile /> Resume
                  </a>
                )}
              </>
            ) : (
              <button
                onClick={onUnlock}
                disabled={unlocking}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%",
                  padding: "10px 0", background: unlocking ? "var(--ink)" : "var(--gold)", border: "none",
                  borderRadius: 10, color: unlocking ? "var(--dim)" : "#fff", fontWeight: 700, fontSize: 13,
                  cursor: unlocking ? "wait" : "pointer", fontFamily: "var(--font-body)",
                }}
              >
                <IconLock /> {unlocking ? "Unlocking..." : "Unlock Contact Details · 1 credit"}
              </button>
            )}
          </div>
        </div>

        {/* ── AI Match Analysis ── */}
        {aiAnalysis && (
          <div style={{ padding: "16px 28px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <IconSparkle />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700 }}>AI Match Analysis</span>
            </div>
            <div style={{
              padding: "12px 16px", borderRadius: 10, background: "#ecfdf5", border: "1px solid #a7f3d0",
              fontSize: 12.5, color: "#065f46", lineHeight: 1.65,
            }}>
              {formatBoldText(aiAnalysis)}
            </div>
          </div>
        )}

        {/* ── Tab bar (Profile & Resume only) ── */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line)", padding: "0 28px", flexShrink: 0 }}>
          {(["profile", "resume"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid var(--gold)" : "2px solid transparent",
              padding: "10px 16px", cursor: "pointer", fontSize: 12, fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? "var(--bright)" : "var(--dim)", textTransform: "capitalize",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>

          {activeTab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {candidate.summary && (
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", fontWeight: 700, marginBottom: 8 }}>Summary</div>
                  <div style={{ fontSize: 13, color: "var(--secondary)", lineHeight: 1.6 }}>{candidate.summary}</div>
                </div>
              )}

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

          {activeTab === "resume" && (
            <div>
              {!isUnlocked ? (
                <div style={{
                  textAlign: "center", padding: "60px 20px",
                  background: "var(--ink)", border: "1px dashed var(--line2)", borderRadius: 12,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconLock />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--bright)" }}>Unlock to view resume</div>
                  <div style={{ fontSize: 12, color: "var(--dim)", maxWidth: 280, lineHeight: 1.5 }}>
                    Unlock this profile to access the full resume, contact details, and more.
                  </div>
                  <button
                    onClick={onUnlock}
                    disabled={unlocking}
                    style={{
                      padding: "10px 22px", borderRadius: 9,
                      background: unlocking ? "var(--ink)" : "var(--gold)", color: unlocking ? "var(--dim)" : "#fff",
                      fontSize: 13, fontWeight: 700, border: unlocking ? "1px solid var(--line)" : "none",
                      cursor: unlocking ? "wait" : "pointer", fontFamily: "var(--font-body)",
                    }}
                  >
                    {unlocking ? "Unlocking..." : "Unlock profile · 1 credit"}
                  </button>
                </div>
              ) : candidate.file_url ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <a href={candidate.file_url} target="_blank" rel="noopener" style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", flex: 1,
                      background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 10,
                      textDecoration: "none", color: "var(--bright)",
                    }}>
                      <IconFile />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{candidate.file_name || "Resume"}</div>
                        {candidate.file_size && <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 1 }}>{(candidate.file_size / 1024).toFixed(0)} KB</div>}
                      </div>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--gold)", fontWeight: 700 }}>Download</span>
                    </a>
                    <button
                      onClick={() => setResumeExpanded(true)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "14px 16px", borderRadius: 10,
                        background: "var(--gold)", border: "none", cursor: "pointer", fontSize: 12,
                        fontWeight: 700, color: "#fff", whiteSpace: "nowrap", fontFamily: "var(--font-body)",
                      }}
                    >
                      <IconExpand /> Expand
                    </button>
                  </div>
                  <div style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden", height: 500 }}>
                    <iframe
                      src={candidate.file_url}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      title="Resume preview"
                    />
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--dim)", fontSize: 13 }}>
                  No resume uploaded
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen resume modal */}
      {resumeExpanded && candidate.file_url && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setResumeExpanded(false)}
        >
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
          <div
            style={{ position: "relative", width: "85vw", height: "90vh", background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "var(--bright)" }}>
                <IconFile /> {candidate.file_name || "Resume"} — {candidate.name || candidate.initials}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={candidate.file_url} target="_blank" rel="noopener" style={{
                  padding: "6px 14px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 7,
                  color: "var(--secondary)", fontSize: 12, fontWeight: 600, textDecoration: "none", cursor: "pointer",
                }}>
                  Open in new tab
                </a>
                <button onClick={() => setResumeExpanded(false)} style={{
                  background: "none", border: "none", cursor: "pointer", color: "var(--dim)", padding: 4,
                }}>
                  <IconClose />
                </button>
              </div>
            </div>
            <iframe
              src={candidate.file_url}
              style={{ flex: 1, width: "100%", border: "none" }}
              title="Resume fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  )
}
