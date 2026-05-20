"use client"

import { useCallback, useEffect, useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

// ── SVG Icon Components ─────────────────────────────────────────────────────
function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}
function IconUnlock() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>
  )
}
function IconBriefcase() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  )
}
function IconKanban() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="7" rx="1"/>
    </svg>
  )
}
function IconCreditCard() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}
function IconBarChart() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
}
function IconLogOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}
function IconKey() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>
  )
}
function IconAlertTriangle() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
}

// ── Nav config ──────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: "DISCOVER",
    items: [
      { id: "search",   label: "Smart Search",      Icon: IconSearch,     href: "/dashboard/searches", match: (p: string) => p.startsWith("/dashboard/searches") },
      { id: "unlocked", label: "Unlocked Profiles",  Icon: IconUnlock,     href: "/dashboard/unlocked", match: (p: string) => p.startsWith("/dashboard/unlocked") },
    ]
  },
  {
    label: "HIRING",
    items: [
      { id: "jobs",     label: "My Jobs",            Icon: IconBriefcase,  href: "/dashboard/jobs",     match: (p: string) => p.startsWith("/dashboard/jobs") },
      { id: "pipeline", label: "Pipeline",           Icon: IconKanban,     href: "/dashboard/pipeline", match: (p: string) => p.startsWith("/dashboard/pipeline") },
    ]
  },
  {
    label: "ACCOUNT",
    items: [
      { id: "billing",  label: "Credits & Billing",  Icon: IconCreditCard, href: "/dashboard/billing",  match: (p: string) => p.startsWith("/dashboard/billing") },
      { id: "home",     label: "Overview",           Icon: IconBarChart,   href: "/dashboard",          match: (p: string) => p === "/dashboard" },
    ]
  }
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname() || ""
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [credits,     setCredits]     = useState<{ job_post_credits: number; profile_unlock_credits: number } | null>(null)
  const [clientData,  setClientData]  = useState<any>(null)
  const [clientName,  setClientName]  = useState("")
  const [userEmail,   setUserEmail]   = useState("")
  const [avatarUrl,   setAvatarUrl]   = useState("")

  const loadUserData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/auth/login"); return }

    const meta = (user.user_metadata as any) || {}
    setUserEmail(user.email || "")
    setAvatarUrl(meta.avatar_url || meta.picture || "")

    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return

    const res = await fetch("/api/client/me", { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const d = await res.json()
      setClientData(d.client || null)
      setClientName(d.client?.name || "")
      setCredits(d.credits || null)
    }
  }, [router])

  useEffect(() => { loadUserData() }, [loadUserData])

  const initials = useMemo(() => {
    const src = userEmail || "U"
    return src.slice(0, 2).toUpperCase()
  }, [userEmail])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const lowCredits = credits !== null && credits.profile_unlock_credits <= 2

  return (
    <div style={{ display: "flex", flex: 1, width: "100%", height: "100vh", overflow: "hidden", background: "#f6f8fa" }}>
      {/* ── SIDEBAR ── */}
      <aside className="sidebar" style={{ display: "flex", flexDirection: "column", width: isSidebarCollapsed ? 68 : 220, minWidth: isSidebarCollapsed ? 68 : 220, transition: "width 0.2s" }}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{
            position: "absolute", right: -12, top: 24, width: 24, height: 24,
            background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            color: "var(--secondary)", zIndex: 10, padding: 0
          }}
        >
          {isSidebarCollapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </button>

        {/* Logo */}
        <div className="logo-area" style={{ padding: isSidebarCollapsed ? "24px 10px 20px" : "24px 20px 20px", display: "flex", justifyContent: "center", overflow: "hidden" }}>
          {isSidebarCollapsed ? (
            <div className="logo-wordmark" style={{ fontSize: 16 }}>G<span>H</span></div>
          ) : (
            <div>
              <div className="logo-wordmark">Gati<span>Hire</span></div>
              <div className="logo-tagline">Client Portal</div>
            </div>
          )}
        </div>

        {/* Company pill */}
        {clientName && !isSidebarCollapsed && (
          <div className="workspace-pill">
            <div className="ws-icon">{clientName.slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="ws-name">{clientName}</div>
              <div className="ws-plan">Hiring Account</div>
            </div>
          </div>
        )}
        {clientName && isSidebarCollapsed && (
           <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
             <div className="ws-icon">{clientName.slice(0, 2).toUpperCase()}</div>
           </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              {!isSidebarCollapsed && <div className="nav-group-label">{section.label}</div>}
              {section.items.map(item => {
                const active = item.match(pathname)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`nav-item${active ? " active" : ""}`}
                    style={{ textDecoration: "none", justifyContent: isSidebarCollapsed ? "center" : "flex-start", padding: isSidebarCollapsed ? "10px" : undefined }}
                  >
                    <span className="nav-icon"><item.Icon /></span>
                    {!isSidebarCollapsed && (
                      <>
                        {item.label}
                        {item.id === "billing" && credits && (
                          <span className="nav-badge">
                            {credits.profile_unlock_credits + credits.job_post_credits}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer" style={{ padding: isSidebarCollapsed ? "12px 6px" : "12px" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="user-row"
              style={{ width: "100%", background: "none", border: "none", cursor: "pointer", justifyContent: isSidebarCollapsed ? "center" : "flex-start", padding: isSidebarCollapsed ? "8px 0" : undefined }}
            >
              <div className="user-av" style={{ margin: isSidebarCollapsed ? 0 : undefined }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                  : initials
                }
              </div>
              {!isSidebarCollapsed && (
                <div style={{ textAlign: "left" }}>
                  <div className="user-name">{clientName || "My Account"}</div>
                  <div className="user-role">{userEmail}</div>
                </div>
              )}
            </button>

            {menuOpen && (
              <div style={{
                position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: "4px",
                background: "#ffffff", border: "1px solid #eaecf0", borderRadius: "var(--r2)",
                padding: "6px", zIndex: 50,
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
              }}>
                <button
                  onClick={signOut}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    width: "100%", padding: "8px 10px", background: "none", border: "none",
                    cursor: "pointer", color: "var(--rose)", fontSize: "12px", borderRadius: "var(--r)",
                    fontFamily: "var(--font-body)"
                  }}
                >
                  <IconLogOut /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            {NAV_SECTIONS.flatMap(s => s.items).map(item =>
              item.match(pathname) ? (
                <div key={item.id}>
                  <div className="page-eyebrow">GatiHire Client Portal</div>
                  <div className="page-heading">{item.label}</div>
                </div>
              ) : null
            )}
            {pathname === "/dashboard" && (
              <div>
                <div className="page-eyebrow">GatiHire Client Portal</div>
                <div className="page-heading">Overview</div>
              </div>
            )}
          </div>

          <div className="topbar-right">
            <Link href="/dashboard/jobs/new" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", background: "var(--gold)", borderRadius: "var(--r)",
              color: "var(--ink)", fontSize: "12px", fontWeight: 600, textDecoration: "none",
              fontFamily: "var(--font-body)"
            }}>
              + Post a Job
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="content page-enter">
          <Suspense fallback={<div style={{ color: "var(--muted)", fontSize: "12px", fontFamily: "var(--font-mono)", padding: "40px" }}>LOADING...</div>}>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
