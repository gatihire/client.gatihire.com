"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Target, FileText, ArrowLeft, MoreHorizontal, Sparkles, Plus, Check } from "lucide-react"
import { CandidateCard, ProfileDrawer } from "@/components/dashboard/search-helpers"

export function JobDashboardClient({ jobId, onClose }: { jobId: string; onClose?: () => void }) {
  const router = useRouter()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"applicants" | "suggested" | "unlocked">("applicants")
  const [stages, setStages] = useState<any[]>([])
  const [activeStage, setActiveStage] = useState<string>("new")
  const [stagesLoaded, setStagesLoaded] = useState(false)
  
  // Applicants state
  const [applicants, setApplicants] = useState<any[]>([])
  const [loadingApplicants, setLoadingApplicants] = useState(false)

  // Suggested state
  const [suggested, setSuggested] = useState<any[]>([])
  const [loadingSuggested, setLoadingSuggested] = useState(false)
  const [suggestedFetched, setSuggestedFetched] = useState(false)
  const [page, setPage] = useState(1)
  const [totalSuggested, setTotalSuggested] = useState(0)
  const [selectedSuggestedIds, setSelectedSuggestedIds] = useState<Set<string>>(new Set())

  // Unlocked state
  const [unlockedProfiles, setUnlockedProfiles] = useState<any[]>([])
  const [loadingUnlocked, setLoadingUnlocked] = useState(false)
  const [unlockedFetched, setUnlockedFetched] = useState(false)
  const [selectedUnlockedIds, setSelectedUnlockedIds] = useState<Set<string>>(new Set())
  const [lastSuggestedError, setLastSuggestedError] = useState<string | null>(null)

  
  // Profile interaction state
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<any | null>(null)
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, string>>({})

  // Edit & Delete Job State
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", location: "", description: "" })
  const [savingJob, setSavingJob] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchJob() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      try {
        const res = await fetch(`/api/client/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.job) {
          setJob(data.job)
          setEditForm({ title: data.job.title, location: data.job.location || "", description: data.job.description || "" })
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchJob()
  }, [jobId])

  // ... fetchApplicants, fetchSuggested, addToPipeline

  async function deleteJob() {
    if (!confirm("Are you sure you want to delete this job? This cannot be undone.")) return;
    setIsDeleting(true)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (token) {
      try {
        await fetch(`/api/client/jobs/${jobId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        })
        if (onClose) onClose()
        else router.push("/dashboard/jobs")
        router.refresh()
      } catch (e) {
        console.error(e)
      }
    }
  }

  async function saveJob() {
    setSavingJob(true)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (token) {
      try {
        const res = await fetch(`/api/client/jobs/${jobId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(editForm)
        })
        const data = await res.json()
        if (data.job) setJob(data.job)
        setIsEditing(false)
      } catch (e) {
        console.error(e)
      }
    }
    setSavingJob(false)
  }

  useEffect(() => {
    if (activeTab === "applicants" && applicants.length === 0) {
      if (!stagesLoaded) {
        fetchStages().then(fetchApplicants)
      } else {
        fetchApplicants()
      }
    } else if (activeTab === "suggested" && !suggestedFetched && job?.description) {
      fetchSuggested()
    } else if (activeTab === "unlocked" && !unlockedFetched) {
      fetchUnlockedProfiles()
    }
  }, [activeTab, job])

  async function fetchStages() {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    try {
      const res = await fetch(`/api/client/jobs/${jobId}/stages`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      const nextStages = data.stages || []
      setStages(nextStages)
      if (nextStages.length && !nextStages.find((s: any) => s.slug === activeStage)) {
        setActiveStage(nextStages[0].slug)
      }
      setStagesLoaded(true)
    } catch (e) {
      console.error(e)
    }
  }

  async function createStage() {
    const name = prompt("Stage name")
    if (!name) return
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    try {
      const res = await fetch(`/api/client/jobs/${jobId}/stages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create stage")
      setStages((prev) => [...prev, data.stage])
      setActiveStage(data.stage.slug)
    } catch (e: any) {
      alert(e.message)
    }
  }

  async function fetchUnlockedProfiles() {
    setLoadingUnlocked(true)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (token) {
      try {
        // Job dashboard unlocked tab shows ONLY profiles unlocked from Suggested for this job
        const res = await fetch(`/api/client/jobs/${jobId}/unlocked`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setUnlockedProfiles(data.profiles || [])
        setUnlockedFetched(true)
      } catch (e) {
        console.error(e)
      }
    }
    setLoadingUnlocked(false)
  }

  async function fetchApplicants() {
    setLoadingApplicants(true)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (token) {
      try {
        const res = await fetch(`/api/client/jobs/${jobId}/applicants`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setApplicants(data.applicants || [])
      } catch (e) {
        console.error(e)
      }
    }
    setLoadingApplicants(false)
  }

  async function fetchSuggested(pageToFetch = 1) {
    setLoadingSuggested(true)
    setLastSuggestedError(null)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (token && job?.description) {
      try {
        let res = await fetch(`/api/client/jobs/${jobId}/matches?page=${pageToFetch}&limit=25`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        let data = await res.json()
        
        if (data.needs_matchmaking) {
            // trigger match generation
            const genRes = await fetch(`/api/client/jobs/${jobId}/matches`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!genRes.ok) {
              const gd = await genRes.json().catch(() => ({}))
              throw new Error(gd.error || "Failed to generate matches")
            }
            // fetch again
            res = await fetch(`/api/client/jobs/${jobId}/matches?page=${pageToFetch}&limit=25`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            data = await res.json()
        }

        setSuggested(data.results || [])
        setTotalSuggested(data.total || 0)
        setSuggestedFetched(true)
        
        // Fetch AI analysis for top 5 unanalyzed candidates
        if (data.results && data.results.length > 0) {
           const unanalyzed = data.results.filter((c: any) => !aiAnalysisMap[c.id]).slice(0, 5)
           if (unanalyzed.length > 0) {
             fetch("/api/client/search/analyze", {
               method: "POST",
               headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
               body: JSON.stringify({ candidates: unanalyzed, requirement: job.description })
             }).then(r => r.json()).then(d => {
               if (d.analysis) {
                 setAiAnalysisMap(prev => {
                   const next = { ...prev }
                   d.analysis.forEach((item: any) => {
                     if (item.id && item.analysis) next[item.id] = item.analysis
                   })
                   return next
                 })
               }
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

  const unlock = async (candidateId: string) => {
    setUnlocking(candidateId)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return
      
      const res = await fetch("/api/client/unlock", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId, job_id: jobId, source: "suggested" })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Unlock failed")
      
      setSuggested(prev => prev.map(c => c.id === candidateId
        ? { ...c, is_unlocked: true, name: data.candidate?.name, email: data.candidate?.email, phone: data.candidate?.phone, file_url: data.candidate?.file_url, linkedin_profile: data.candidate?.linkedin_profile, summary: data.candidate?.summary }
        : c
      ))
      if (selectedCard?.id === candidateId) setSelectedCard((prev: any) => prev ? { ...prev, is_unlocked: true, ...data.candidate } : prev)
    } catch (e: any) { alert(e.message) } finally { setUnlocking(null) }
  }

  async function setApplicantStage(applicationId: string, stage: string) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    
    // update status to stage slug
    await fetch(`/api/client/jobs/${jobId}/applicants`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ application_id: applicationId, status: stage })
    })

    setApplicants(prev => prev.map(a => a.id === applicationId ? { ...a, status: stage } : a))
  }

  async function addMultipleToPipeline(candidateIds: string[], source: "suggested" | "unlocked") {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return

    setUnlocking("multiple") // use a special flag or just show global loader
    
    try {
        // For each candidate, we need to create an application and set status to 'in_pipeline'
        // But if they are not unlocked, we need to unlock them first!
        const res = await fetch(`/api/client/jobs/${jobId}/pipeline/batch`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ candidate_ids: candidateIds, unlock_first: source === "suggested", default_stage: "screening" })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to add to pipeline")
        
        alert(`Successfully added ${candidateIds.length} candidates to pipeline!`)
        
        // Refresh applicants and tabs
        if (source === "suggested") setSelectedSuggestedIds(new Set())
        if (source === "unlocked") setSelectedUnlockedIds(new Set())
        
        fetchApplicants()
        if (source === "suggested") fetchSuggested(page)
        
    } catch(e: any) {
        alert(e.message)
    } finally {
        setUnlocking(null)
    }
  }

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--dim)" }}>Loading job details...</div>
  }

  if (!job) {
    return <div style={{ padding: "40px", textAlign: "center", color: "var(--dim)" }}>Job not found.</div>
  }

  const dateStr = job.created_at ? new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "N/A"
  const newCount = applicants.filter(a => a.status === "new" || a.status === "pending").length
  const normalizedApplicants = applicants.map((a: any) => {
    const s = a.status || "new"
    // Back-compat
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

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "stretch", justifyContent: "stretch", background: "rgba(0,0,0,0.6)" }}>
      <div style={{ position: "relative", width: "100vw", height: "100vh", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--line)", background: "var(--ink2)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--bright)", margin: 0 }}>Job Dashboard</h2>
          <button onClick={onClose || (() => router.push("/dashboard/jobs"))} style={{ background: "none", border: "none", color: "var(--secondary)", cursor: "pointer", fontSize: "24px", lineHeight: 1 }}>
            &times;
          </button>
        </div>

        {/* Main Content Scrollable Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", gap: "24px", alignItems: "flex-start" }}>
          {/* Left Sidebar */}
          <div style={{ width: "320px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Job Card Info */}
            <div style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: "48px", height: "48px", background: "var(--blue-bg)", borderRadius: "8px", border: "1px solid var(--blue-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)" }}>
                  <FileText size={24} />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/apply/${jobId}`);
                    alert("Link copied!");
                  }} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", color: "var(--bright)", fontSize: "12px" }}>
                    Copy Link
                  </button>
                  <button onClick={() => setIsEditing(true)} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "6px", padding: "6px", cursor: "pointer", color: "var(--bright)" }}>
                    ✎ Edit
                  </button>
                  <button onClick={deleteJob} disabled={isDeleting} style={{ background: "var(--rose-bg)", border: "1px solid var(--rose-border)", borderRadius: "6px", padding: "6px", cursor: isDeleting ? "wait" : "pointer", color: "var(--rose)" }}>
                    {isDeleting ? "..." : "🗑"}
                  </button>
                </div>
              </div>

              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 600, color: "var(--bright)", marginBottom: "6px" }}>
                  {job.title}
                </h1>
                <div style={{ fontSize: "13px", color: "var(--dim)", fontFamily: "var(--font-mono)", marginBottom: "16px" }}>
                  Job ID: {String(job.id || "").slice(0, 6).toUpperCase()}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--secondary)" }}>Status:</span>
                    <span style={{ color: job.status === "open" ? "var(--green)" : "var(--gold)", fontWeight: 500 }}>
                      {job.status === "open" ? "Published" : "Closed"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--secondary)" }}>Location:</span>
                    <span style={{ color: "var(--bright)", fontWeight: 500 }}>{job.location || "Not specified"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--secondary)" }}>Openings:</span>
                    <span style={{ color: "var(--bright)", fontWeight: 500 }}>{job.openings || "Not specified"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "var(--secondary)" }}>Type:</span>
                    <span style={{ color: "var(--bright)", fontWeight: 500 }}>{typeof job.employment_type === "string" ? job.employment_type.replace('_', ' ') : "Full Time"}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ border: "1px solid var(--line2)", borderRadius: "6px", padding: "10px 12px", fontSize: "12px", color: "var(--secondary)" }}>
                  Created On: <span style={{ color: "var(--bright)" }}>{dateStr}</span>
                </div>
                <div style={{ border: "1px solid var(--line2)", borderRadius: "6px", padding: "10px 12px", fontSize: "12px", color: "var(--secondary)" }}>
                  Owner: <span style={{ color: "var(--bright)" }}>You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div style={{ flex: 1, minWidth: 0, background: "var(--ink)", border: "1px solid var(--line)", borderRadius: "12px", display: "flex", flexDirection: "column", minHeight: "600px" }}>
            
            {/* Header Tabs */}
            <div style={{ borderBottom: "1px solid var(--line)", padding: "16px 24px", display: "flex", alignItems: "center", gap: "24px" }}>
              <button 
                onClick={() => setActiveTab("applicants")}
                style={{ 
                  background: "none", border: "none", padding: "0 0 12px 0", cursor: "pointer", 
                  fontSize: "14px", fontWeight: activeTab === "applicants" ? 600 : 500,
                  color: activeTab === "applicants" ? "var(--blue)" : "var(--secondary)",
                  borderBottom: activeTab === "applicants" ? "2px solid var(--blue)" : "2px solid transparent",
                  marginBottom: "-17px", display: "flex", alignItems: "center", gap: "6px"
                }}
              >
                Applicants ({applicants.length})
                {newCount > 0 && (
                  <span style={{ background: "var(--gold-bg)", color: "var(--gold)", fontSize: "10px", padding: "2px 6px", borderRadius: "10px", fontWeight: 600 }}>{newCount} New</span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab("suggested")}
                style={{ 
                  background: "none", border: "none", padding: "0 0 12px 0", cursor: "pointer", 
                  fontSize: "14px", fontWeight: activeTab === "suggested" ? 600 : 500,
                  color: activeTab === "suggested" ? "var(--blue)" : "var(--secondary)",
                  borderBottom: activeTab === "suggested" ? "2px solid var(--blue)" : "2px solid transparent",
                  marginBottom: "-17px"
                }}
              >
                Suggested Candidates ({suggested.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab("unlocked")}
                style={{ 
                  background: "none", border: "none", padding: "0 0 12px 0", cursor: "pointer", 
                  fontSize: "14px", fontWeight: activeTab === "unlocked" ? 600 : 500,
                  color: activeTab === "unlocked" ? "var(--blue)" : "var(--secondary)",
                  borderBottom: activeTab === "unlocked" ? "2px solid var(--blue)" : "2px solid transparent",
                  marginBottom: "-17px"
                }}
              >
                Unlocked Profiles
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "24px", flex: 1 }}>
              {activeTab === "applicants" && (
                <div>
                  {!stagesLoaded ? null : (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px", flexWrap: "wrap" }}>
                      {(stages || []).map((s: any) => {
                        const count = (applicantsByStage[s.slug] || []).length
                        const active = activeStage === s.slug
                        return (
                          <button
                            key={s.id || s.slug}
                            onClick={() => setActiveStage(s.slug)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 12px",
                              borderRadius: "999px",
                              cursor: "pointer",
                              border: "1px solid",
                              borderColor: active ? "var(--blue-border)" : "var(--line2)",
                              background: active ? "var(--blue-bg)" : "var(--ink2)",
                              color: active ? "var(--blue)" : "var(--secondary)",
                              fontSize: "12px",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            <span>{s.name}</span>
                            <span style={{ padding: "1px 8px", borderRadius: "999px", background: "var(--ink3)", border: "1px solid var(--line2)", color: "var(--secondary)", fontSize: "11px" }}>
                              {count}
                            </span>
                          </button>
                        )
                      })}
                      <button
                        onClick={createStage}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 12px",
                          borderRadius: "999px",
                          cursor: "pointer",
                          border: "1px dashed var(--line2)",
                          background: "var(--ink2)",
                          color: "var(--secondary)",
                          fontSize: "12px",
                          fontFamily: "var(--font-mono)",
                        }}
                        title="Add a new stage (limited)"
                      >
                        <Plus size={14} /> Add stage
                      </button>
                    </div>
                  )}
                  {loadingApplicants ? (
                    <div style={{ textAlign: "center", color: "var(--dim)", padding: "40px" }}>Loading applicants...</div>
                  ) : normalizedApplicants.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--dim)", padding: "40px" }}>No applicants yet.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {(stagesLoaded ? (applicantsByStage[activeStage] || []) : normalizedApplicants).map(app => {
                        const c = app.candidates
                        if (!c) return null
                        const isNew = app.status === "new" || app.status === "pending"
                        return (
                          <div
                            key={app.id}
                            onClick={() => setSelectedCard({ ...c, is_unlocked: true })}
                            style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "12px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", cursor: "pointer" }}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--bright)" }}>{c.name || "Unknown"}</span>
                                {isNew && <span style={{ background: "var(--blue-bg)", color: "var(--blue)", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>NEW</span>}
                                {!isNew && (
                                  <span style={{ background: "var(--ink3)", color: "var(--secondary)", fontSize: "10px", padding: "2px 6px", borderRadius: "4px", fontWeight: 600, textTransform: "uppercase" }}>
                                    {String(app.status || "new")}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "13px", color: "var(--secondary)", display: "flex", gap: "12px", alignItems: "center" }}>
                                <span>{c.current_role || "No Role Specified"}</span>
                                {c.total_experience && <span>Exp: {c.total_experience} yrs</span>}
                                {c.location && <span>{c.location}</span>}
                              </div>
                              <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {(Array.isArray(c.technical_skills) ? c.technical_skills : []).slice(0, 5).map((s: string, i: number) => (
                                  <span key={i} style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "4px", padding: "2px 8px", fontSize: "11px", color: "var(--dim)" }}>{s}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              {stagesLoaded ? (
                                <select
                                  value={String(app.status || "new")}
                                  onChange={(e) => { e.stopPropagation(); setApplicantStage(app.id, e.target.value) }}
                                  style={{
                                    height: "38px",
                                    background: "var(--ink3)",
                                    border: "1px solid var(--line2)",
                                    borderRadius: "10px",
                                    padding: "0 10px",
                                    color: "var(--bright)",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontFamily: "var(--font-mono)",
                                  }}
                                >
                                  {(stages || []).map((s: any) => (
                                    <option key={s.slug} value={s.slug}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "suggested" && (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  {loadingSuggested ? (
                    <div style={{ textAlign: "center", color: "var(--dim)", padding: "40px" }}>Finding best matches based on JD...</div>
                  ) : suggested.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--dim)", padding: "40px" }}>
                      <div style={{ marginBottom: "10px" }}>{lastSuggestedError ? lastSuggestedError : "No suggestions found yet."}</div>
                      <button
                        onClick={() => fetchSuggested(page)}
                        style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "8px", padding: "10px 16px", color: "var(--bright)", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                      >
                        Try again
                      </button>
                      <div style={{ marginTop: "10px", fontSize: "12px", color: "var(--secondary)" }}>
                        This will rerun JD matching and fetch results.
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ background: "var(--blue-bg)", border: "1px solid var(--blue-border)", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", color: "var(--blue)", display: "flex", alignItems: "center", gap: "8px", flex: 1, marginRight: "16px" }}>
                          <Sparkles size={16} /> We found {totalSuggested} pre-vetted candidates for this role.
                        </div>
                        {selectedSuggestedIds.size > 0 && (
                          <button 
                            onClick={() => addMultipleToPipeline(Array.from(selectedSuggestedIds), "suggested")}
                            disabled={unlocking === "multiple"}
                            style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--gold)", border: "none", color: "white", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: unlocking === "multiple" ? "wait" : "pointer" }}
                          >
                            {unlocking === "multiple" ? "Adding..." : `Unlock & Add ${selectedSuggestedIds.size} to Pipeline`}
                          </button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                        {suggested.map(c => (
                          <CandidateCard 
                            key={c.id} 
                            c={c} 
                            unlocking={unlocking === c.id} 
                            onUnlock={() => unlock(c.id)} 
                            onClick={() => setSelectedCard(c)} 
                            aiAnalysis={aiAnalysisMap[c.id]}
                            selectable={true}
                            selected={selectedSuggestedIds.has(c.id)}
                            onToggleSelect={() => {
                              setSelectedSuggestedIds(prev => {
                                const next = new Set(prev)
                                if (next.has(c.id)) next.delete(c.id)
                                else next.add(c.id)
                                return next
                              })
                            }}
                            primaryCta={{
                              label: "Add to Screening",
                              disabled: !c.is_unlocked,
                              onClick: () => addMultipleToPipeline([c.id], "suggested")
                            }}
                          />
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalSuggested > 25 && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px", paddingBottom: "20px" }}>
                          <button 
                            onClick={() => { setPage(p => p - 1); fetchSuggested(page - 1); }} 
                            disabled={page <= 1 || loadingSuggested} 
                            style={{ padding: "6px 14px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--secondary)", fontSize: "12px", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}
                          >
                            Prev
                          </button>
                          <span style={{ fontSize: "12px", color: "var(--secondary)" }}>
                            Page {page} of {Math.ceil(totalSuggested / 25)}
                          </span>
                          <button 
                            onClick={() => { setPage(p => p + 1); fetchSuggested(page + 1); }} 
                            disabled={page >= Math.ceil(totalSuggested / 25) || loadingSuggested} 
                            style={{ padding: "6px 14px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--secondary)", fontSize: "12px", cursor: page >= Math.ceil(totalSuggested / 25) ? "not-allowed" : "pointer", opacity: page >= Math.ceil(totalSuggested / 25) ? 0.5 : 1 }}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {activeTab === "unlocked" && (
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  {loadingUnlocked ? (
                    <div style={{ textAlign: "center", color: "var(--dim)", padding: "40px" }}>Loading unlocked profiles...</div>
                  ) : unlockedProfiles.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--dim)", padding: "40px" }}>
                      No unlocked profiles for this job yet.
                      <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--secondary)" }}>
                        Unlock from <b>Suggested Candidates</b> to show profiles here.
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ fontSize: "14px", color: "var(--secondary)" }}>
                          Showing {unlockedProfiles.length} unlocked profiles from Suggested Candidates for this job.
                        </div>
                        {selectedUnlockedIds.size > 0 && (
                          <button 
                            onClick={() => addMultipleToPipeline(Array.from(selectedUnlockedIds), "unlocked")}
                            disabled={unlocking === "multiple"}
                            style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--blue)", border: "none", color: "white", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: unlocking === "multiple" ? "wait" : "pointer" }}
                          >
                            {unlocking === "multiple" ? "Adding..." : `Add ${selectedUnlockedIds.size} to Pipeline`}
                          </button>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                        {unlockedProfiles.map((c: any) => {
                          c.is_unlocked = true
                          return (
                            <CandidateCard 
                              key={c.id} 
                              c={c} 
                              unlocking={false} 
                              onUnlock={() => {}} 
                              onClick={() => setSelectedCard(c)} 
                              selectable={true}
                              selected={selectedUnlockedIds.has(c.id)}
                              onToggleSelect={() => {
                                setSelectedUnlockedIds(prev => {
                                  const next = new Set(prev)
                                  if (next.has(c.id)) next.delete(c.id)
                                  else next.add(c.id)
                                  return next
                                })
                              }}
                              primaryCta={{
                                label: "Add to Screening",
                                onClick: () => addMultipleToPipeline([c.id], "unlocked")
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Drawer */}
        {selectedCard && <ProfileDrawer c={selectedCard} unlocking={unlocking === selectedCard.id} onUnlock={() => unlock(selectedCard.id)} onClose={() => setSelectedCard(null)} aiAnalysis={aiAnalysisMap[selectedCard.id]} />}

        {/* Edit Modal (Inner Modal) */}
        {isEditing && (
          <div style={{ position: "absolute", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setIsEditing(false)} />
            <div style={{ position: "relative", width: "500px", background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "var(--r2)", padding: "24px", zIndex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
              <h2 style={{ fontSize: "18px", color: "var(--bright)", fontWeight: 600, margin: 0 }}>Edit Job Opening</h2>
              
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--secondary)", marginBottom: "6px" }}>Title</label>
                <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ width: "100%", padding: "10px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "6px", color: "var(--bright)", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--secondary)", marginBottom: "6px" }}>Location</label>
                <input value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} style={{ width: "100%", padding: "10px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "6px", color: "var(--bright)", boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--secondary)", marginBottom: "6px" }}>Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={6} style={{ width: "100%", padding: "10px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "6px", color: "var(--bright)", boxSizing: "border-box", resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
                <button onClick={() => setIsEditing(false)} style={{ padding: "8px 16px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "6px", color: "var(--secondary)", cursor: "pointer" }}>Cancel</button>
                <button onClick={saveJob} disabled={savingJob} style={{ padding: "8px 16px", background: "var(--blue)", border: "none", borderRadius: "6px", color: "white", cursor: "pointer", fontWeight: 500 }}>
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
