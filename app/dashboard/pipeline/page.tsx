"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const STAGES = [
  { id: "new", label: "New applies", tint: "#d97706", bg: "var(--gold-bg)", border: "var(--gold-border)", textColor: "var(--gold)" },
  { id: "screening", label: "Screening", tint: "#3b82f6", bg: "var(--blue-bg)", border: "var(--blue-border)", textColor: "var(--blue)" },
  { id: "interview", label: "Interview", tint: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)", textColor: "#a78bfa" },
  { id: "offer", label: "Offer", tint: "#22c55e", bg: "var(--green-bg)", border: "var(--green-border)", textColor: "var(--green)" },
  { id: "hired", label: "Hired", tint: "#16a34a", bg: "rgba(22,163,74,0.1)", border: "rgba(22,163,74,0.25)", textColor: "#16a34a" },
  { id: "rejected", label: "Rejected", tint: "#f43f5e", bg: "var(--rose-bg)", border: "var(--rose-border)", textColor: "var(--rose)" },
]

export default function PipelinePage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [applicants, setApplicants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [appsLoading, setAppsLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [note, setNote] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ""
  }

  useEffect(() => {
    async function load() {
      const token = await getToken()
      const res = await fetch("/api/client/jobs", { headers: { Authorization: `Bearer ${token}` } })
      const d = await res.json()
      setJobs(d.jobs || [])
      if ((d.jobs || []).length > 0) setSelectedJob(d.jobs[0])
      setLoading(false)
    }
    load()
  }, [])

  const loadApplicants = useCallback(async (jobId: string) => {
    setAppsLoading(true)
    const token = await getToken()
    const res = await fetch(`/api/client/jobs/${jobId}/applicants`, { headers: { Authorization: `Bearer ${token}` } })
    const d = await res.json()
    setApplicants(d.applicants || [])
    setAppsLoading(false)
  }, [])

  useEffect(() => {
    if (selectedJob) loadApplicants(selectedJob.id)
  }, [selectedJob, loadApplicants])

  const moveStage = async (appId: string, newStage: string) => {
    const token = await getToken()
    await fetch(`/api/client/jobs/${selectedJob.id}/applicants`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: appId, status: newStage })
    })
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStage } : a))
    if (selectedApp?.id === appId) setSelectedApp((a: any) => a ? { ...a, status: newStage } : a)
  }

  const saveNote = async () => {
    if (!selectedApp || !note.trim()) return
    setSavingNote(true)
    const token = await getToken()
    await fetch(`/api/client/jobs/${selectedJob.id}/applicants`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: selectedApp.id, notes: note })
    })
    setApplicants(prev => prev.map(a => a.id === selectedApp.id ? { ...a, notes: note } : a))
    setSavingNote(false)
  }

  const stageMap: Record<string, any[]> = {}
  STAGES.forEach(s => { stageMap[s.id] = [] })
  applicants.forEach(a => {
    const stage = a.status || "new"
    if (stageMap[stage]) stageMap[stage].push(a)
    else stageMap["new"].push(a)
  })

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "var(--dim)", fontSize: 13 }}>
      Loading pipeline…
    </div>
  )

  if (jobs.length === 0) return (
    <div style={{
      textAlign: "center", padding: "80px 20px",
      background: "#fff", border: "1px dashed var(--line2)", borderRadius: 14,
      display: "flex", flexDirection: "column", alignItems: "center", marginTop: 20
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: 14, background: "var(--gold-bg)",
        border: "1px solid var(--gold-border)", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 26, marginBottom: 18
      }}>
        📋
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--bright)", marginBottom: 8, letterSpacing: "-0.015em" }}>
        Empty pipeline
      </div>
      <div style={{ fontSize: 13, color: "var(--dim)", marginBottom: 28, maxWidth: 360, lineHeight: 1.6 }}>
        You need an active mandate to track candidates. Create your first job posting to activate your hiring pipeline.
      </div>
      <Link href="/dashboard/jobs/new" style={{
        padding: "11px 28px", background: "var(--gold)", borderRadius: 9,
        color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none"
      }}>
        Post a job
      </Link>
    </div>
  )

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 108px)", overflow: "hidden" }}>

      {/* Left: jobs selector */}
      <div style={{
        width: 256, flexShrink: 0, background: "#fff", border: "1px solid var(--line)",
        borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--dim)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            Select mandate
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {jobs.map(job => {
            const active = selectedJob?.id === job.id
            return (
              <button
                key={job.id}
                onClick={() => { setSelectedJob(job); setSelectedApp(null) }}
                style={{
                  width: "100%", padding: "11px 12px", borderRadius: 9, cursor: "pointer",
                  textAlign: "left", border: "none", transition: "all 0.12s",
                  background: active ? "var(--gold-bg)" : "transparent",
                  display: "flex", flexDirection: "column", gap: 4,
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--ink)" }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent" }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: active ? "var(--gold)" : "var(--bright)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {job.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10.5, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
                    {String(job.id || "").slice(0, 6).toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 99,
                    background: job.status === "open" ? "var(--green-bg)" : "var(--ink3)",
                    color: job.status === "open" ? "var(--green)" : "var(--dim)",
                    border: `1px solid ${job.status === "open" ? "var(--green-border)" : "var(--line2)"}`
                  }}>
                    {job.status === "open" ? "Live" : "Closed"}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Center: Kanban board or List view */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selectedJob && (
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.015em" }}>
                {selectedJob.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 2 }}>
                {applicants.length} candidate{applicants.length !== 1 ? "s" : ""} in pipeline
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, background: "var(--ink)", border: "1px solid var(--line2)", borderRadius: 8, padding: 2 }}>
              {(["kanban", "list"] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                    cursor: "pointer", fontFamily: "var(--font-body)", border: "none",
                    background: viewMode === mode ? "#fff" : "transparent",
                    color: viewMode === mode ? "var(--bright)" : "var(--secondary)",
                    transition: "all 0.12s"
                  }}
                >
                  {mode === "kanban" ? "Kanban" : "List"}
                </button>
              ))}
            </div>
          </div>
        )}

        {appsLoading ? (
          <div style={{ color: "var(--dim)", fontSize: 13, padding: "20px 0" }}>Loading…</div>
        ) : viewMode === "kanban" ? (
          <div style={{ display: "flex", gap: 12, overflowX: "auto", flex: 1, paddingBottom: 12, alignItems: "flex-start" }}>
            {STAGES.map(stage => (
              <div key={stage.id} style={{ minWidth: 230, width: 230, flexShrink: 0, display: "flex", flexDirection: "column" }}>
                {/* Stage header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "9px 12px", background: "#fff",
                  border: `1px solid var(--line)`, borderRadius: "10px 10px 0 0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: stage.tint }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--bright)" }}>{stage.label}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600,
                    padding: "2px 7px", borderRadius: 99,
                    background: stage.bg, color: stage.textColor, border: `1px solid ${stage.border}`
                  }}>
                    {stageMap[stage.id].length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{
                  flex: 1, padding: "8px", background: "var(--ink)",
                  border: `1px solid var(--line)`, borderTop: "none",
                  borderRadius: "0 0 10px 10px", display: "flex", flexDirection: "column",
                  gap: 8, minHeight: 120, maxHeight: "calc(100vh - 240px)", overflowY: "auto"
                }}>
                  {stageMap[stage.id].map(app => {
                    const name = app.candidates?.name || app.candidate_name || "Candidate"
                    const role = app.candidates?.current_role || ""
                    const initials = name.split(" ").filter(Boolean).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                    const isSelected = selectedApp?.id === app.id

                    return (
                      <div
                        key={app.id}
                        onClick={() => { setSelectedApp(app); setNote(app.notes || "") }}
                        style={{
                          background: "#fff",
                          border: `1px solid ${isSelected ? stage.tint : "var(--line)"}`,
                          borderRadius: 9, padding: "12px", cursor: "pointer",
                          transition: "all 0.12s",
                          boxShadow: isSelected ? `0 0 0 2px ${stage.bg}` : "0 1px 0 rgba(0,0,0,0.02)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                            background: stage.bg, border: `1px solid ${stage.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, color: stage.textColor
                          }}>
                            {initials}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--bright)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {name}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {role || "—"}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--dim)" }}>
                          {app.candidates?.location && <span>📍 {app.candidates.location}</span>}
                          {app.candidates?.total_experience && <span>⏳ {app.candidates.total_experience}y</span>}
                        </div>
                        {app.notes && (
                          <div style={{
                            marginTop: 8, fontSize: 11, color: "var(--secondary)",
                            background: "var(--ink)", padding: "6px 9px", borderRadius: 6,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                            borderLeft: `2px solid ${stage.tint}`
                          }}>
                            {app.notes}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {stageMap[stage.id].length === 0 && (
                    <div style={{ textAlign: "center", padding: "30px 0", fontSize: 11.5, color: "var(--dim)" }}>
                      No candidates
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div style={{ flex: 1, overflow: "auto" }}>
            <div style={{ display: "grid", gap: 8, paddingBottom: 12 }}>
              {applicants.map(app => {
                const name = app.candidates?.name || app.candidate_name || "Candidate"
                const role = app.candidates?.current_role || ""
                const stage = STAGES.find(s => s.id === (app.status || "new"))
                return (
                  <div
                    key={app.id}
                    onClick={() => { setSelectedApp(app); setNote(app.notes || "") }}
                    style={{
                      background: "#fff", border: `1px solid ${selectedApp?.id === app.id ? "var(--gold-border)" : "var(--line)"}`,
                      borderRadius: 9, padding: "14px 16px", cursor: "pointer", transition: "all 0.12s",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      boxShadow: selectedApp?.id === app.id ? "0 0 0 2px var(--gold-bg)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: stage?.bg, border: `1px solid ${stage?.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: stage?.textColor
                      }}>
                        {name.substring(0, 1).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--bright)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {name}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--dim)", display: "flex", gap: 8, marginTop: 2 }}>
                          <span>{role || "—"}</span>
                          {app.candidates?.location && <span>📍 {app.candidates.location}</span>}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                      background: stage?.bg, color: stage?.textColor, border: `1px solid ${stage?.border}`,
                      whiteSpace: "nowrap", flexShrink: 0, marginLeft: 12
                    }}>
                      {stage?.label}
                    </span>
                  </div>
                )
              })}
              {applicants.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--dim)", fontSize: 12 }}>
                  No candidates in pipeline
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: candidate detail panel */}
      {selectedApp && (
        <div style={{
          width: 340, flexShrink: 0, background: "#fff",
          border: "1px solid var(--line)", borderRadius: 12,
          display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.01em" }}>Candidate</div>
            <button onClick={() => setSelectedApp(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", fontSize: 18, lineHeight: 1, padding: "0 2px" }}>×</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {/* Avatar + name */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                background: "var(--gold-bg)", border: "1px solid var(--gold-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 800, color: "var(--gold)"
              }}>
                {(selectedApp.candidates?.name || "C").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.015em" }}>
                  {selectedApp.candidates?.name || "Candidate"}
                </div>
                <div style={{ fontSize: 12, color: "var(--secondary)", marginTop: 2 }}>
                  {selectedApp.candidates?.current_role || "No role"}
                  {selectedApp.candidates?.location && ` · ${selectedApp.candidates.location}`}
                </div>
                {selectedApp.candidates?.file_url && (
                  <a href={selectedApp.candidates.file_url} target="_blank" rel="noopener noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5,
                    color: "var(--gold)", marginTop: 6, textDecoration: "none", fontWeight: 600
                  }}>
                    📄 View resume →
                  </a>
                )}
              </div>
            </div>

            {/* Stage mover */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--dim)", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
                Move to stage
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STAGES.map(s => {
                  const active = selectedApp.status === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => moveStage(selectedApp.id, s.id)}
                      style={{
                        padding: "4px 11px", borderRadius: 99, cursor: "pointer",
                        fontSize: 11.5, fontWeight: 600, border: `1px solid ${active ? s.border : "var(--line2)"}`,
                        background: active ? s.bg : "transparent",
                        color: active ? s.textColor : "var(--secondary)",
                        fontFamily: "var(--font-body)", transition: "all 0.1s"
                      }}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Contact info */}
            <div style={{ background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--dim)", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
                Contact
              </div>
              {selectedApp.candidates?.phone && (
                <div style={{ fontSize: 12.5, color: "var(--bright)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📞</span> {selectedApp.candidates.phone}
                </div>
              )}
              {selectedApp.candidates?.email && (
                <div style={{ fontSize: 12.5, color: "var(--bright)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>✉️</span> {selectedApp.candidates.email}
                </div>
              )}
              {!selectedApp.candidates?.phone && !selectedApp.candidates?.email && (
                <div style={{ fontSize: 12, color: "var(--dim)" }}>Contact not available</div>
              )}
            </div>

            {/* Notes */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--dim)", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 8 }}>
                Internal notes
              </div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={5}
                placeholder="Add notes about this candidate…"
                style={{
                  width: "100%", padding: "10px 12px",
                  background: "var(--ink)", border: "1px solid var(--line2)",
                  borderRadius: 9, color: "var(--bright)", fontSize: 12.5,
                  fontFamily: "var(--font-body)", outline: "none",
                  resize: "vertical", boxSizing: "border-box"
                }}
              />
              <button
                onClick={saveNote}
                disabled={savingNote}
                style={{
                  marginTop: 8, width: "100%", padding: "9px",
                  background: savingNote ? "var(--ink3)" : "var(--gold)",
                  border: "none", borderRadius: 8,
                  cursor: savingNote ? "not-allowed" : "pointer",
                  color: savingNote ? "var(--dim)" : "#fff",
                  fontSize: 12.5, fontWeight: 600,
                  fontFamily: "var(--font-body)", transition: "all 0.12s"
                }}
              >
                {savingNote ? "Saving…" : "Save note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
