"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { MoreHorizontal } from "lucide-react"
import { JobDashboardClient } from "@/components/jobs/JobDashboardClient"
import { PageLoader } from "@/components/ui/Loader"

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState({ job_post_credits: 0 })
  const [userName, setUserName] = useState("")
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) {
          setLoading(false)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserName((user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || user.email?.split("@")[0] || "User")
        }

        const [jobsRes, meRes] = await Promise.all([
          fetch("/api/client/jobs", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/client/me", { headers: { Authorization: `Bearer ${token}` } })
        ])
        
        let jd = { jobs: [] };
        let md = { credits: { job_post_credits: 0 } };

        if (jobsRes.ok) {
          jd = await jobsRes.json().catch(() => ({ jobs: [] }))
        }
        if (meRes.ok) {
          md = await meRes.json().catch(() => ({ credits: { job_post_credits: 0 } }))
        }

        setJobs(Array.isArray(jd.jobs) ? jd.jobs : [])
        setCredits(md.credits || { job_post_credits: 0 })
      } catch (err) {
        console.error("Failed to load jobs", err)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 600, color: "var(--bright)", margin: 0 }}>
          All jobs
        </h1>
      </div>

      {/* Credits Banner */}
      <div style={{
        background: "var(--ink2)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r2)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--blue-bg)", border: "1px solid var(--blue-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue)", fontSize: "14px" }}>
            💳
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "var(--bright)", fontWeight: 500 }}>Active Credits</div>
            <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "2px" }}>You have {credits.job_post_credits} job post credit{credits.job_post_credits !== 1 ? "s" : ""} remaining</div>
          </div>
        </div>
        {credits.job_post_credits === 0 && (
          <Link href="/dashboard/billing" style={{ padding: "8px 16px", background: "var(--ink3)", border: "1px solid var(--gold-border)", borderRadius: "var(--r)", color: "var(--gold)", fontSize: "12px", textDecoration: "none", fontFamily: "var(--font-mono)" }}>
            + Get Credits
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "100px 20px",
          background: "var(--ink2)", border: "1px dashed var(--line2)",
          borderRadius: "var(--r2)", display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "var(--ink3)", border: "1px solid var(--line)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", marginBottom: "20px"
          }}>
            💼
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: "var(--bright)", marginBottom: "8px" }}>No mandates active</div>
          <div style={{ fontSize: "13px", color: "var(--dim)", marginBottom: "32px", maxWidth: "340px", lineHeight: 1.5 }}>
            You haven&apos;t posted any jobs yet. Create your first mandate to start receiving AI-vetted candidates from the GatiHire network.
          </div>
          {credits.job_post_credits > 0
            ? <Link href="/dashboard/jobs/new" style={{ padding: "12px 28px", background: "var(--gold)", borderRadius: "var(--r)", color: "var(--ink)", fontWeight: 600, fontSize: "13px", textDecoration: "none", boxShadow: "0 4px 12px rgba(232,201,109,0.2)" }}>Create Mandate</Link>
            : <Link href="/dashboard/billing" style={{ padding: "12px 28px", background: "var(--ink3)", border: "1px solid var(--gold-border)", borderRadius: "var(--r)", color: "var(--gold)", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>Purchase Credits First →</Link>
          }
        </div>
      ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Search and Filters */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ 
                flex: 1, display: "flex", alignItems: "center", gap: "8px", 
                background: "var(--ink2)", border: "1px solid var(--line)", 
                borderRadius: "8px", padding: "8px 12px" 
              }}>
                <span style={{ color: "var(--dim)" }}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search" 
                  style={{ background: "transparent", border: "none", outline: "none", color: "var(--bright)", width: "100%", fontSize: "14px" }} 
                />
              </div>
              <button style={{ 
                display: "flex", alignItems: "center", gap: "6px", 
                background: "var(--ink2)", border: "1px solid var(--line)", 
                borderRadius: "8px", padding: "8px 16px", color: "var(--bright)",
                cursor: "pointer", fontSize: "14px"
              }}>
                <span style={{ fontSize: "14px" }}>⧎</span> Filters
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px", marginTop: "8px" }}>
              {jobs.map((job: any) => {
                const dateStr = job.created_at ? new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "N/A"
                const budgetStr = (job.salary_min || job.salary_max) 
                  ? `$${job.salary_min || 0}${job.salary_max ? ` - $${job.salary_max}` : "+"} ${job.salary_type || "budget"}`
                  : "Not specified"
                  
                const skillsMustHave = Array.isArray(job.skills_must_have) ? job.skills_must_have : []
                const skillsGoodToHave = Array.isArray(job.skills_good_to_have) ? job.skills_good_to_have : []
                const skillsCount = skillsMustHave.length + skillsGoodToHave.length
                
                const statusColor = job.status === "open" ? "var(--green)" : "var(--gold)"
                const displayId = String(job.id || "").slice(0, 6).toUpperCase()

                return (
                  <div key={job.id || Math.random()} onClick={() => setSelectedJobId(job.id)} style={{ 
                    background: "var(--ink)", border: "1px solid var(--line)", borderRadius: "12px", 
                    padding: "20px", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s",
                    display: "flex", flexDirection: "column", gap: "16px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                  }} className="hover:border-blue-400 hover:shadow-md">
                    
                    {/* Top row: Date & Owner & Status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "var(--dim)", fontWeight: 500 }}>
                      <div>{dateStr} <span style={{ margin: "0 4px" }}>|</span> Owner: {userName}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: statusColor, fontWeight: 600 }}>{job.status === "open" ? "Published" : "Un-published"}</span>
                      </div>
                    </div>

                    {/* Title & Job ID */}
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--bright)", display: "flex", alignItems: "center", gap: "8px" }}>
                        {job.title || "Untitled Job"}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--dim)", marginTop: "6px", fontFamily: "var(--font-mono)" }}>
                        Job ID: {displayId}
                      </div>
                    </div>

                    {/* Applicants Stats */}
                    <div style={{ fontSize: "13px", color: "var(--secondary)", display: "flex", alignItems: "center" }}>
                      <span style={{ fontWeight: 500, color: "var(--bright)" }}>Applicants: <span style={{ fontWeight: 600 }}>{job.totalApplicants || 0}</span></span>
                      <span style={{ margin: "0 10px", color: "var(--line2)" }}>|</span>
                      <span style={{ fontWeight: 500, color: job.newApplicants > 0 ? "var(--gold)" : "var(--dim)" }}>New pending: <span style={{ fontWeight: 600 }}>{job.newApplicants || 0}</span></span>
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                      {[
                        typeof job.employment_type === "string" ? job.employment_type.replace('_', ' ') : "Full Time",
                        job.location,
                        job.openings ? `${job.openings} Openings` : null,
                        budgetStr,
                        `${skillsCount} Skills ⓘ`
                      ].filter(Boolean).map((t, i) => (
                        <span key={i} style={{ 
                          border: "1px solid var(--line)", borderRadius: "6px", padding: "4px 10px", 
                          fontSize: "12px", color: "var(--dim)", background: "var(--ink2)", fontWeight: 500
                        }}>{t}</span>
                      ))}
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        )}

      {selectedJobId && (
        <JobDashboardClient jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </div>
  )
}
