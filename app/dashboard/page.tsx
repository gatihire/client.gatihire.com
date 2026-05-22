"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { PageLoader } from "@/components/ui/Loader"

/* ── Avatar component ──────────────────────────────────────────── */
function Avatar({ name = "U" }: { name: string }) {
  const initials = name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  const colors = ["var(--gold)", "var(--green)", "var(--blue)", "var(--violet)", "var(--rose)"]
  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1)
  const bgColor = colors[hash % colors.length]

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: bgColor,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

/* ── Stat card ─────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  delta,
  sub,
  accent = "var(--gold)",
}: {
  label: string
  value: string | number
  delta?: string
  sub?: string
  accent?: string
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 12,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.15s, transform 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"
        ;(e.currentTarget as HTMLElement).style.borderColor = "var(--line2)"
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "none"
        ;(e.currentTarget as HTMLElement).style.borderColor = "var(--line)"
      }}
    >
      {/* Corner accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          borderRadius: "0 12px 0 60px",
          background: accent,
          opacity: 0.08,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--dim)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 12,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "var(--bright)",
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {delta && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 6,
              background: "var(--green-bg)",
              color: "var(--green)",
              border: "1px solid var(--green-border)",
            }}
          >
            {delta}
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

/* ── Main dashboard ─────────────────────────────────────────────── */
export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState("Welcome")

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting("Good morning")
    else if (h < 17) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return
      const [meRes, jobsRes] = await Promise.all([
        fetch("/api/client/me", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/client/jobs", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const me = await meRes.json()
      const jobs = await jobsRes.json()
      setData({ ...me, jobs: jobs.jobs || [] })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <PageLoader />

  const credits = data?.credits || { job_post_credits: 0, profile_unlock_credits: 0 }
  const jobs: any[] = data?.jobs || []
  const clientName = data?.client?.name || "your company"
  const contactName = data?.user?.email?.split("@")[0] || ""
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })

  const openJobs = jobs.filter(j => j.status === "open" || !j.status)
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.totalApplicants || 0), 0)
  const newApplicants = jobs.reduce((sum, j) => sum + (j.newApplicants || 0), 0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Welcome banner ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 20px",
          background: "#fff",
          border: "1px solid var(--line)",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--gold-bg)",
            border: "1px solid var(--gold-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          👋
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: "var(--bright)", fontWeight: 700 }}>
            {greeting}, {contactName}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 2 }}>
            {today} · Hiring dashboard for <strong style={{ color: "var(--bright)" }}>{clientName}</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Link
            href="/dashboard/searches"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              background: "#fff",
              border: "1px solid var(--line2)",
              borderRadius: 9,
              color: "var(--secondary)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
            Search talent
          </Link>
          <Link
            href="/dashboard/jobs/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 16px",
              background: "var(--gold)",
              border: "none",
              borderRadius: 9,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Post a job
          </Link>
        </div>
      </div>

      {/* ── Stat cards grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard
          label="Active jobs"
          value={openJobs.length}
          delta={`+${openJobs.length > 0 ? 1 : 0}`}
          sub={`${openJobs.length} open · ${jobs.length - openJobs.length} draft`}
          accent="var(--gold)"
        />
        <StatCard
          label="New applicants"
          value={newApplicants}
          delta={newApplicants > 0 ? `+${newApplicants}` : "0"}
          sub="Last 7 days"
          accent="var(--blue)"
        />
        <StatCard
          label="In pipeline"
          value={totalApplicants}
          sub={`${openJobs.length} open role${openJobs.length !== 1 ? "s" : ""}`}
          accent="var(--green)"
        />
        <StatCard
          label="Credits remaining"
          value={credits.profile_unlock_credits || 0}
          sub={`${credits.job_post_credits || 0} job post credits`}
          accent="var(--violet)"
        />
      </div>

      {/* ── Main 2-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        {/* Left: Open roles */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "var(--bright)", letterSpacing: "-0.01em" }}>
                Open roles
              </h3>
              <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 4 }}>
                {openJobs.length} active mandate{openJobs.length !== 1 ? "s" : ""}
              </div>
            </div>
            <Link
              href="/dashboard/jobs"
              style={{
                fontSize: 12,
                color: "var(--gold)",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              View all →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {openJobs.slice(0, 6).map((job, i) => (
              <Link
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 12,
                  padding: i > 0 ? "14px 0 0" : "0",
                  borderTop: i > 0 ? "1px solid var(--line)" : "none",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.8" }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1" }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--bright)" }}>
                    {job.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 3 }}>
                    {job.location || "Remote"} · {job.employment_type?.replace("_", " ") || "Full-time"}
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px 10px",
                    borderRadius: 99,
                    background: "var(--gold-bg)",
                    color: "var(--gold)",
                    fontSize: 11,
                    fontWeight: 700,
                    border: "1px solid var(--gold-border)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {job.totalApplicants || 0} applies
                </div>
              </Link>
            ))}
            {openJobs.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--dim)", fontSize: 13 }}>
                No open roles yet. <Link href="/dashboard/jobs/new" style={{ color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>Post your first job →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick actions + Credits */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Today's tasks */}
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "20px",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px", color: "var(--bright)", letterSpacing: "-0.01em" }}>
              Quick actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "🔍", label: "Search talent", href: "/dashboard/searches" },
                { icon: "📝", label: "Post a job", href: "/dashboard/jobs/new" },
                { icon: "📊", label: "View pipeline", href: "/dashboard/pipeline" },
                { icon: "👥", label: "Manage company", href: "/dashboard/profile" },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 12px",
                    borderRadius: 9,
                    background: "var(--ink)",
                    border: "1px solid var(--line2)",
                    color: "var(--bright)",
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => {
                    ;(e.currentTarget as HTMLElement).style.background = "var(--ink2)"
                    ;(e.currentTarget as HTMLElement).style.borderColor = "var(--line)"
                  }}
                  onMouseLeave={e => {
                    ;(e.currentTarget as HTMLElement).style.background = "var(--ink)"
                    ;(e.currentTarget as HTMLElement).style.borderColor = "var(--line2)"
                  }}
                >
                  <span style={{ fontSize: 16 }}>{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Credits card */}
          <div
            style={{
              background: "#12151f",
              borderRadius: 12,
              padding: "20px",
              color: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "var(--gold)",
                opacity: 0.08,
              }}
            />
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                borderRadius: 99,
                background: "var(--gold-bg)",
                border: "1px solid var(--gold-border)",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--gold)",
                marginBottom: 12,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--gold)" }} />
              Credits
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 4 }}>
                {credits.profile_unlock_credits}{" "}
                <span style={{ fontSize: 13, opacity: 0.6, fontWeight: 500 }}>/ 50 unlocks</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>
                {credits.job_post_credits} job post credits available
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,.1)", marginBottom: 14, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(credits.profile_unlock_credits / 50) * 100}%`,
                    background: "var(--gold)",
                  }}
                />
              </div>
              <Link
                href="/dashboard/billing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "var(--gold)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Buy credits
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom analytics row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {/* Hiring stages */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", color: "var(--bright)" }}>
            Hiring funnel
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Applied", count: totalApplicants, pct: 100 },
              { label: "Screening", count: Math.floor(totalApplicants * 0.4), pct: 40 },
              { label: "Interview", count: Math.floor(totalApplicants * 0.15), pct: 15 },
              { label: "Offer", count: Math.floor(totalApplicants * 0.08), pct: 8 },
            ].map((stage, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, borderRadius: 3, background: "var(--ink3)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${stage.pct}%`,
                        background: "var(--gold)",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "var(--secondary)", minWidth: 70 }}>
                  {stage.label}
                </span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--dim)", minWidth: 32, textAlign: "right" }}>
                  {stage.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top sources */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", color: "var(--bright)" }}>
            Top sources
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Applied directly", pct: 45, color: "var(--gold)" },
              { label: "Talent DB", pct: 30, color: "var(--blue)" },
              { label: "Referrals", pct: 15, color: "var(--green)" },
              { label: "Other", pct: 10, color: "var(--violet)" },
            ].map((source, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: source.color,
                  }}
                />
                <span style={{ flex: 1, fontSize: 12.5, color: "var(--bright)" }}>
                  {source.label}
                </span>
                <span style={{ fontSize: 12, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
                  {source.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming tasks */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", color: "var(--bright)" }}>
            Upcoming tasks
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "📋", label: "Review new applications", priority: "high" },
              { icon: "📞", label: "Schedule interviews", priority: "mid" },
              { icon: "💳", label: "Renew job credits", priority: "low" },
              { icon: "⭐", label: "Verify employer badge", priority: "mid" },
            ].map((task, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "var(--ink)",
                  border: "1px solid var(--line2)",
                }}
              >
                                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 99,
                    flexShrink: 0,
                    background:
                      task.priority === "high"
                        ? "var(--rose)"
                        : task.priority === "mid"
                          ? "var(--gold)"
                          : "var(--dim)",
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--bright)", flex: 1 }}>
                  {task.icon} {task.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
