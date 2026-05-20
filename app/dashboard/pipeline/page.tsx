"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const STAGES = [
  { id: "new", label: "New", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" },
  { id: "screening", label: "Screening", color: "var(--gold)", bg: "var(--gold-bg)", border: "var(--gold-border)" },
  { id: "interview", label: "Interview", color: "var(--violet)", bg: "var(--violet-bg)", border: "rgba(167,139,250,0.2)" },
  { id: "offer", label: "Offer", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" },
  { id: "hired", label: "Hired ✓", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" },
  { id: "rejected", label: "Rejected", color: "var(--rose)", bg: "var(--rose-bg)", border: "var(--rose-border)" },
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
      if ((d.jobs || []).length > 0) {
        setSelectedJob(d.jobs[0])
      }
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

  if (loading) return <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading…</div>

  if (jobs.length === 0) return (
    <div style={{
      textAlign: "center", padding: "100px 20px",
      background: "var(--ink2)", border: "1px dashed var(--line2)",
      borderRadius: "var(--r2)", display: "flex", flexDirection: "column", alignItems: "center",
      marginTop: "20px"
    }}>
      <div style={{
        width: "64px", height: "64px", borderRadius: "16px",
        background: "var(--ink3)", border: "1px solid var(--line)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "24px", marginBottom: "20px"
      }}>
        📋
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--bright)", marginBottom: "8px" }}>Empty Pipeline</div>
      <div style={{ fontSize: "13px", color: "var(--dim)", marginBottom: "32px", maxWidth: "340px", lineHeight: 1.5 }}>
        You need an active mandate to track candidates. Create your first job posting to activate your hiring pipeline.
      </div>
      <Link href="/dashboard/jobs/new" style={{ padding: "12px 28px", background: "var(--gold)", borderRadius: "var(--r)", color: "var(--ink)", fontWeight: 600, fontSize: "13px", textDecoration: "none", boxShadow: "0 4px 12px rgba(232,201,109,0.2)" }}>Create Mandate</Link>
    </div>
  )

  return (
    <div style={{ display: "flex", gap: "24px", height: "calc(100vh - 100px)" }}>
      {/* Left Sidebar - Jobs List */}
      <div style={{ width: "280px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px", borderRight: "1px solid var(--line)", paddingRight: "20px", overflowY: "auto" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--bright)", margin: 0 }}>Pipeline</h2>
        <div style={{ fontSize: "13px", color: "var(--secondary)", marginBottom: "8px" }}>Select a job to view its pipeline</div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {jobs.map(job => (
            <button key={job.id} onClick={() => setSelectedJob(job)} style={{
              padding: "16px", borderRadius: "12px", cursor: "pointer", textAlign: "left",
              border: "1px solid", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "6px",
              background: selectedJob?.id === job.id ? "var(--ink)" : "var(--ink2)",
              borderColor: selectedJob?.id === job.id ? "var(--blue-border)" : "var(--line)",
              boxShadow: selectedJob?.id === job.id ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
            }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: selectedJob?.id === job.id ? "var(--blue)" : "var(--bright)" }}>
                {job.title}
              </div>
              <div style={{ fontSize: "12px", color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
                ID: {job.id.slice(0, 6).toUpperCase()}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--secondary)", background: "var(--ink3)", padding: "2px 6px", borderRadius: "4px" }}>
                  {job.status === "open" ? "Published" : "Closed"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Kanban Board */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {selectedJob && (
          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: 600, color: "var(--bright)", margin: "0 0 4px 0" }}>{selectedJob.title} Pipeline</h1>
              <div style={{ fontSize: "14px", color: "var(--secondary)" }}>Total Candidates: {applicants.length}</div>
            </div>
          </div>
        )}

        {appsLoading ? (
          <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading pipeline...</div>
        ) : (
          <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "16px", alignItems: "flex-start", flex: 1 }}>
            {STAGES.map(stage => (
              <div key={stage.id} style={{ minWidth: "260px", width: "260px", flexShrink: 0, display: "flex", flexDirection: "column", height: "100%" }}>
                {/* Column header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderRadius: "12px 12px 0 0",
                  background: stage.bg, border: `1px solid ${stage.border}`, borderBottom: "none"
                }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: stage.color, display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: stage.color }} />
                    {stage.label}
                  </div>
                  <div style={{ fontSize: "12px", color: stage.color, background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                    {stageMap[stage.id].length}
                  </div>
                </div>

                {/* Cards */}
                <div style={{
                  flex: 1, padding: "12px",
                  background: "var(--ink2)", border: `1px solid ${stage.border}`, borderTop: "none",
                  borderRadius: "0 0 12px 12px", display: "flex", flexDirection: "column", gap: "12px",
                  overflowY: "auto"
                }}>
                  {stageMap[stage.id].map(app => {
                    const name = app.candidates?.name || app.candidate_name || "Candidate"
                    const role = app.candidates?.current_role || ""
                    const initials = name.split(" ").filter(Boolean).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                    return (
                      <div
                        key={app.id}
                        onClick={() => { setSelectedApp(app); setNote(app.notes || "") }}
                        style={{
                          background: "var(--ink)", border: "1px solid var(--line)",
                          borderRadius: "8px", padding: "16px", cursor: "pointer",
                          transition: "all 0.2s",
                          borderColor: selectedApp?.id === app.id ? stage.color : "var(--line)",
                          boxShadow: selectedApp?.id === app.id ? `0 0 0 1px ${stage.color}` : "0 2px 4px rgba(0,0,0,0.05)"
                        }}
                      >
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: stage.bg, border: `1px solid ${stage.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: stage.color, fontWeight: 600, flexShrink: 0 }}>
                            {initials}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: "14px", color: "var(--bright)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "2px" }}>{name}</div>
                            <div style={{ fontSize: "12px", color: "var(--secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{role || "No Role"}</div>
                            <div style={{ fontSize: "11px", color: "var(--dim)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                                {app.candidates?.location && <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>📍 {app.candidates.location}</span>}
                                {app.candidates?.total_experience && <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>⏳ {app.candidates.total_experience}y</span>}
                            </div>
                          </div>
                        </div>
                        {app.notes && (
                          <div style={{ fontSize: "12px", color: "var(--secondary)", background: "var(--ink3)", padding: "8px 10px", borderRadius: "6px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", borderLeft: `2px solid ${stage.color}` }}>
                            {app.notes}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {stageMap[stage.id].length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 0", fontSize: "12px", color: "var(--dim)" }}>No candidates</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side panel */}
      {selectedApp && (
        <div style={{
          position: "fixed", right: 0, top: 0, bottom: 0, width: "380px",
          background: "var(--ink2)", borderLeft: "1px solid var(--line)",
          padding: "24px 20px", overflowY: "auto", zIndex: 50, boxSizing: "border-box"
        }}>
          <button onClick={() => setSelectedApp(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", fontSize: "18px", marginBottom: "16px" }}>✕</button>

          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "24px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "var(--ink3)", border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "var(--secondary)", fontWeight: 600, flexShrink: 0 }}>
              {(selectedApp.candidates?.name || "C").substring(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--bright)", fontWeight: 600, marginBottom: "4px" }}>
                {selectedApp.candidates?.name || "Candidate"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span title={selectedApp.candidates?.current_role} style={{ maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedApp.candidates?.current_role || "No role"}</span>
                {selectedApp.candidates?.location && <span>· {selectedApp.candidates.location}</span>}
              </div>
              {selectedApp.candidates?.file_url && (
                <a href={selectedApp.candidates.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--blue)", marginTop: "8px", textDecoration: "none", fontWeight: 500 }}>
                  📄 View Resume
                </a>
              )}
            </div>
          </div>

          {/* Stage changer */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Move to stage</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {STAGES.map(s => (
                <button key={s.id} onClick={() => moveStage(selectedApp.id, s.id)} style={{
                  padding: "5px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "11px",
                  fontFamily: "var(--font-mono)", border: "1px solid",
                  background: selectedApp.status === s.id ? s.bg : "var(--ink3)",
                  borderColor: selectedApp.status === s.id ? s.border : "var(--line2)",
                  color: selectedApp.status === s.id ? s.color : "var(--secondary)"
                }}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r2)", padding: "14px 16px", marginBottom: "20px" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Contact</div>
            {selectedApp.candidates?.phone && <div style={{ fontSize: "12px", color: "var(--blue)", marginBottom: "4px" }}>📞 {selectedApp.candidates.phone}</div>}
            {selectedApp.candidates?.email && <div style={{ fontSize: "12px", color: "var(--blue)" }}>✉️ {selectedApp.candidates.email}</div>}
            {!selectedApp.candidates?.phone && !selectedApp.candidates?.email && <div style={{ fontSize: "12px", color: "var(--muted)" }}>Contact not available</div>}
          </div>

          {/* Notes */}
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Internal Notes</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={5}
              placeholder="Add notes about this candidate…"
              style={{ width: "100%", padding: "10px 12px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--bright)", fontSize: "12px", fontFamily: "var(--font-body)", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            <button onClick={saveNote} disabled={savingNote} style={{
              marginTop: "8px", width: "100%", padding: "9px", background: savingNote ? "var(--ink4)" : "var(--blue-bg)",
              border: `1px solid var(--blue-border)`, borderRadius: "var(--r)", cursor: savingNote ? "not-allowed" : "pointer",
              color: "var(--blue)", fontSize: "12px", fontFamily: "var(--font-mono)"
            }}>
              {savingNote ? "Saving…" : "Save Note"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
