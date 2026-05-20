"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { PageLoader, SkeletonGrid } from "@/components/ui/Loader"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return
      const [meRes, jobsRes] = await Promise.all([
        fetch("/api/client/me", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/client/jobs", { headers: { Authorization: `Bearer ${token}` } })
      ])
      const me = await meRes.json()
      const jobs = await jobsRes.json()
      setData({ ...me, jobs: jobs.jobs || [] })
      setLoading(false)
    }
    load()
  }, [])

  const credits = data?.credits || { job_post_credits: 0, profile_unlock_credits: 0 }
  const jobs = data?.jobs || []
  const clientName = data?.client?.name || ""

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="page-enter">
      <div className="ai-insight-banner" style={{ marginBottom: "24px" }}>
        <div className="ai-banner-icon">👋</div>
        <div className="ai-banner-body">
          <div className="ai-banner-label">Welcome</div>
          <div className="ai-banner-text">
            {loading ? "Loading your workspace…" : <>Your hiring dashboard for <strong>{clientName || "your company"}</strong> is ready. Use <span className="hl">Smart Search</span> to find talent or <span className="hl">Post a Job</span> to start receiving applications.</>}
          </div>
          <div className="ai-banner-actions">
            <Link href="/dashboard/searches" style={{ padding: "6px 14px", background: "var(--blue-bg)", border: "1px solid var(--blue-border)", borderRadius: "var(--r)", color: "var(--blue)", fontSize: "11px", textDecoration: "none", fontFamily: "var(--font-mono)" }}>
              🔍 Smart Search
            </Link>
            <Link href="/dashboard/jobs/new" style={{ padding: "6px 14px", background: "var(--gold-bg)", border: "1px solid var(--gold-border)", borderRadius: "var(--r)", color: "var(--gold)", fontSize: "11px", textDecoration: "none", fontFamily: "var(--font-mono)" }}>
              + Post a Job
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="intel-grid">
        <div className="metric-card gold">
          <div className="metric-eyebrow">🔓 Unlock Credits</div>
          <div className="metric-value">{loading ? "…" : credits.profile_unlock_credits}</div>
          <div className="metric-sub">Profile unlocks remaining</div>
          <Link href="/dashboard/billing" style={{ display: "inline-block", marginTop: "10px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--gold)" }}>Get more →</Link>
        </div>
        <div className="metric-card blue">
          <div className="metric-eyebrow">💼 Job Credits</div>
          <div className="metric-value">{loading ? "…" : credits.job_post_credits}</div>
          <div className="metric-sub">Job post credits remaining</div>
          <Link href="/dashboard/billing" style={{ display: "inline-block", marginTop: "10px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--blue)" }}>Get more →</Link>
        </div>
        <div className="metric-card teal">
          <div className="metric-eyebrow">📋 Active Jobs</div>
          <div className="metric-value">{loading ? "…" : jobs.filter((j: any) => j.status === "open").length}</div>
          <div className="metric-sub">Currently open positions</div>
          <Link href="/dashboard/jobs" style={{ display: "inline-block", marginTop: "10px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--blue)" }}>View all →</Link>
        </div>
        <div className="metric-card green">
          <div className="metric-eyebrow">👥 Total Posted</div>
          <div className="metric-value">{loading ? "…" : jobs.length}</div>
          <div className="metric-sub">Jobs posted on GatiHire</div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="section-card">
        <div className="section-header">
          <div>
            <div className="section-title">Recent Job Postings</div>
            <div className="section-sub">Your latest open positions</div>
          </div>
          <Link href="/dashboard/jobs/new" style={{ padding: "7px 14px", background: "var(--gold)", borderRadius: "var(--r)", color: "var(--ink)", fontSize: "12px", fontWeight: 600, textDecoration: "none", fontFamily: "var(--font-body)" }}>+ New Job</Link>
        </div>
        <div className="section-body">
          {loading ? <div style={{ color: "var(--muted)", fontSize: "13px" }}>Loading…</div>
            : jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--dim)", fontSize: "13px" }}>
                No jobs posted yet.{" "}
                <Link href="/dashboard/jobs/new" style={{ color: "var(--gold)" }}>Post your first job →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {jobs.slice(0, 5).map((job: any) => (
                  <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 14px", background: "var(--ink3)", border: "1px solid var(--line)", borderRadius: "var(--r2)", textDecoration: "none", transition: "border-color 0.12s" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", color: "var(--bright)", fontWeight: 600 }}>{job.title}</div>
                      <div style={{ fontSize: "11px", color: "var(--secondary)", marginTop: "2px" }}>{job.location} · {job.employment_type?.replace('_', ' ') || "Full-time"}</div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", padding: "3px 8px", borderRadius: "4px", background: job.status === "open" ? "var(--green-bg)" : "var(--ink4)", color: job.status === "open" ? "var(--green)" : "var(--dim)", border: `1px solid ${job.status === "open" ? "var(--green-border)" : "var(--line2)"}` }}>
                        {job.status || "open"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
