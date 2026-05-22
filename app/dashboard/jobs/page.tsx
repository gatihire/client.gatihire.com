"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { JobDashboardClient } from "@/components/jobs/JobDashboardClient"
import { PageLoader } from "@/components/ui/Loader"

const STAGE_COLORS: Record<string, string> = {
  open: "var(--green)",
  closed: "var(--dim)",
  draft: "var(--gold)",
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState({ job_post_credits: 0 })
  const [userName, setUserName] = useState("")
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) { setLoading(false); return }
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserName((user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || user.email?.split("@")[0] || "User")
        }
        const [jobsRes, meRes] = await Promise.all([
          fetch("/api/client/jobs", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/client/me", { headers: { Authorization: `Bearer ${token}` } })
        ])
        let jd = { jobs: [] }, md = { credits: { job_post_credits: 0 } }
        if (jobsRes.ok) jd = await jobsRes.json().catch(() => ({ jobs: [] }))
        if (meRes.ok) md = await meRes.json().catch(() => ({ credits: { job_post_credits: 0 } }))
        setJobs(Array.isArray(jd.jobs) ? jd.jobs : [])
        setCredits(md.credits || { job_post_credits: 0 })
      } catch (err) {
        setJobs([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = jobs.filter(j =>
    !search || (j.title || "").toLowerCase().includes(search.toLowerCase()) || (j.location || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageLoader />

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1100, margin: "0 auto", width: "100%" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em", margin: 0 }}>Jobs</h1>
          <p style={{ fontSize: 12.5, color: "var(--dim)", margin: "2px 0 0" }}>
            {jobs.length} active mandate{jobs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {credits.job_post_credits > 0 ? (
            <Link
              href="/dashboard/jobs/new"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 9,
                background: "var(--gold)", color: "#fff",
                fontSize: 13, fontWeight: 700, textDecoration: "none",
                fontFamily: "var(--font-body)"
              }}
            >
              + Post a job
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              style={{ padding: "9px 18px", borderRadius: 9, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
            >
              Buy credits to post
            </Link>
          )}
        </div>
      </div>

      {/* Credits banner */}
      <div style={{
        background: "#fff", border: "1px solid var(--line)", borderRadius: 12,
        padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: credits.job_post_credits > 0 ? "var(--gold-bg)" : "var(--rose-bg)",
            border: `1px solid ${credits.job_post_credits > 0 ? "var(--gold-border)" : "var(--rose-border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
          }}>
            💳
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--bright)" }}>
              {credits.job_post_credits} job post credit{credits.job_post_credits !== 1 ? "s" : ""} remaining
            </div>
            <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 1 }}>
              Each published mandate uses 1 credit
            </div>
          </div>
        </div>
        {credits.job_post_credits === 0 && (
          <Link href="/dashboard/billing" style={{
            padding: "7px 14px", background: "var(--ink3)",
            border: "1px solid var(--gold-border)", borderRadius: 8,
            color: "var(--gold)", fontSize: 12, textDecoration: "none", fontWeight: 600
          }}>
            + Get credits
          </Link>
        )}
      </div>

      {/* Empty state */}
      {jobs.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          background: "#fff", border: "1px dashed var(--line2)",
          borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 14,
            background: "var(--gold-bg)", border: "1px solid var(--gold-border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, marginBottom: 18
          }}>
            💼
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--bright)", marginBottom: 8, letterSpacing: "-0.015em" }}>No mandates yet</div>
          <div style={{ fontSize: 13, color: "var(--dim)", marginBottom: 28, maxWidth: 360, lineHeight: 1.6 }}>
            Post your first job to start receiving AI-vetted candidates from the GatiHire network.
          </div>
          {credits.job_post_credits > 0 ? (
            <Link href="/dashboard/jobs/new" style={{
              padding: "11px 28px", background: "var(--gold)", borderRadius: 9,
              color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none"
            }}>
              Post a job
            </Link>
          ) : (
            <Link href="/dashboard/billing" style={{
              padding: "11px 28px", background: "var(--ink3)",
              border: "1px solid var(--gold-border)", borderRadius: 9,
              color: "var(--gold)", fontSize: 13, fontWeight: 600, textDecoration: "none"
            }}>
              Purchase credits first →
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#fff", border: "1px solid var(--line)", borderRadius: 9,
            padding: "9px 14px"
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--dim)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or location…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--bright)", fontSize: 13, fontFamily: "var(--font-body)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--dim)", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
            )}
          </div>

          {/* Jobs grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {filtered.map((job: any) => {
              const dateStr = job.created_at
                ? new Date(job.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : "—"
              const status = job.status || "draft"
              const statusLabel = status === "open" ? "Published" : status === "closed" ? "Closed" : "Draft"
              const skillsCount = (job.skills_must_have?.length || 0) + (job.skills_good_to_have?.length || 0)
              const salaryStr = (job.salary_min || job.salary_max)
                ? `₹${job.salary_min ? (job.salary_min >= 100000 ? (job.salary_min / 100000).toFixed(1) + "L" : job.salary_min.toLocaleString()) : "—"}${job.salary_max ? " – " + (job.salary_max >= 100000 ? (job.salary_max / 100000).toFixed(1) + "L" : job.salary_max.toLocaleString()) : "+"}`
                : null

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  style={{
                    background: "#fff", border: "1px solid var(--line)", borderRadius: 12,
                    padding: "18px 20px", cursor: "pointer", transition: "box-shadow 0.15s, border-color 0.15s",
                    display: "flex", flexDirection: "column", gap: 14,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; (e.currentTarget as HTMLElement).style.boxShadow = "none" }}
                >
                  {/* Top: date + status */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>{dateStr}</span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      color: STAGE_COLORS[status] || "var(--dim)",
                      background: status === "open" ? "var(--green-bg)" : status === "draft" ? "var(--gold-bg)" : "var(--ink3)",
                      border: `1px solid ${status === "open" ? "var(--green-border)" : status === "draft" ? "var(--gold-border)" : "var(--line2)"}`
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: 99, background: STAGE_COLORS[status] || "var(--dim)" }} />
                      {statusLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.015em", marginBottom: 3 }}>
                      {job.title || "Untitled Job"}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
                      {job.location || job.city || "—"}{job.openings ? ` · ${job.openings} opening${job.openings !== 1 ? "s" : ""}` : ""}
                    </div>
                  </div>

                  {/* Applicants */}
                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em" }}>{job.totalApplicants || 0}</div>
                      <div style={{ fontSize: 10.5, color: "var(--dim)" }}>applicants</div>
                    </div>
                    {(job.newApplicants || 0) > 0 && (
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold)", letterSpacing: "-0.02em" }}>{job.newApplicants}</div>
                        <div style={{ fontSize: 10.5, color: "var(--dim)" }}>new</div>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {[
                      job.employment_type ? job.employment_type.replace("_", "-") : null,
                      job.shift_type ? job.shift_type + " shift" : null,
                      salaryStr,
                      skillsCount > 0 ? `${skillsCount} skills` : null,
                    ].filter(Boolean).map((t, i) => (
                      <span key={i} style={{
                        padding: "3px 9px", borderRadius: 6,
                        background: "var(--ink)", border: "1px solid var(--line)",
                        fontSize: 11.5, color: "var(--secondary)"
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--dim)", fontSize: 13 }}>
              No jobs match &ldquo;{search}&rdquo;
            </div>
          )}
        </>
      )}

      {selectedJobId && (
        <JobDashboardClient jobId={selectedJobId} onClose={() => setSelectedJobId(null)} />
      )}
    </div>
  )
}
