"use client"
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { BRAND_LOGO_URL } from "@/lib/branding"

/* ── Icons ──────────────────────────────────────────────────── */
function Icon({ path, size = 15 }: { path: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flex: "0 0 auto" }}>
      {path}
    </svg>
  )
}

const IcoHome     = () => <Icon path={<><path d="M4 20V10l8-7 8 7v10"/><path d="M9 20v-6h6v6"/></>} />
const IcoJobs     = () => <Icon path={<><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>} />
const IcoApplicants = () => <Icon path={<><path d="M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M16 14a3 3 0 1 0 0-6M21 20c0-2.5-2-4-4.5-4.5"/></>} />
const IcoDB       = () => <Icon path={<><ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>} />
const IcoUnlock   = () => <Icon path={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V8a5 5 0 0 1 9.6-2"/></>} />
const IcoBilling  = () => <Icon path={<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>} />
const IcoChevronL = () => <Icon path={<><polyline points="15 18 9 12 15 6"/></>} />
const IcoChevronR = () => <Icon path={<><polyline points="9 18 15 12 9 6"/></>} />
const IcoSignOut  = () => <Icon size={13} path={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>} />
const IcoSettings = () => <Icon size={14} path={<><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8l2.8-2.8M17 7l2.8-2.8"/></>} />

/* ── Nav config ─────────────────────────────────────────────── */
const NAV = [
  {
    section: "HIRING",
    items: [
      {
        id: "home",        label: "Home",              Icon: IcoHome,
        href: "/dashboard",
        match: (p: string) => p === "/dashboard",
      },
      {
        id: "jobs",        label: "Jobs",              Icon: IcoJobs,
        href: "/dashboard/jobs",
        match: (p: string) => p.startsWith("/dashboard/jobs"),
      },
      {
        id: "applicants",  label: "Applicants",        Icon: IcoApplicants,
        href: "/dashboard/pipeline",
        match: (p: string) => p.startsWith("/dashboard/pipeline"),
      },
    ],
  },
  {
    section: "TALENT",
    items: [
      {
        id: "database",    label: "Database search",     Icon: IcoDB,
        href: "/dashboard/searches",
        match: (p: string) => p.startsWith("/dashboard/searches"),
      },
      {
        id: "unlocked",    label: "Unlocked profiles", Icon: IcoUnlock,
        href: "/dashboard/unlocked",
        match: (p: string) => p.startsWith("/dashboard/unlocked"),
      },
    ],
  },
  {
    section: "ACCOUNT",
    items: [
      {
        id: "billing",     label: "Credits & billing", Icon: IcoBilling,
        href: "/dashboard/billing",
        match: (p: string) => p.startsWith("/dashboard/billing"),
      },
    ],
  },
]

/* ── Shell ──────────────────────────────────────────────────── */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname() || ""

  const [collapsed,   setCollapsed]   = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
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
      if (d.needsOnboarding) {
        router.push("/onboarding")
        return
      }
      setClientData(d.client || null)
      setClientName(d.client?.name || "")
      setCredits(d.credits || null)
    }
  }, [router])

  useEffect(() => { loadUserData() }, [loadUserData])

  const initials = useMemo(() => {
    const n = clientName || userEmail || "U"
    return n.slice(0, 2).toUpperCase()
  }, [clientName, userEmail])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  // Current page label for topbar
  const currentItem = NAV.flatMap(s => s.items).find(item => item.match(pathname))
  const pageTitle = currentItem?.label || (pathname === "/dashboard" ? "Home" : "")

  const lowCredits = credits !== null && credits.profile_unlock_credits <= 2

  const sideW = collapsed ? 64 : 228

  return (
    <div style={{
      display: "flex", width: "100%", height: "100vh",
      overflow: "hidden", background: "var(--ink)",
    }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sideW, minWidth: sideW, flexShrink: 0,
        background: "#ffffff",
        borderRight: "1px solid var(--line)",
        display: "flex", flexDirection: "column",
        height: "100vh", position: "relative",
        transition: "width 0.18s ease, min-width 0.18s ease",
        zIndex: 2,
      }}>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{
            position: "absolute", right: -11, top: 22,
            width: 22, height: 22,
            background: "#fff", border: "1px solid var(--line)",
            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--muted)", zIndex: 10, padding: 0,
            boxShadow: "0 1px 3px rgba(0,0,0,.08)",
          }}
        >
          {collapsed ? <IcoChevronR /> : <IcoChevronL />}
        </button>

        {/* Logo area */}
        <div style={{
          padding: collapsed ? "18px 12px 16px" : "16px 14px 14px",
          borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
        }}>
          {collapsed ? (
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <img
                src={BRAND_LOGO_URL}
                alt="GatiHire"
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            </Link>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <img
                  src={BRAND_LOGO_URL}
                  alt="GatiHire"
                  style={{ width: 36, height: 36, objectFit: "contain" }}
                />
              </Link>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--bright)", letterSpacing: "-0.02em" }}>
                  gatihire<span style={{ color: "var(--gold)" }}>.</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase", marginTop: 1 }}>
                  Client Portal
                </div>
              </div>
            </div>
          )}
          {!collapsed && (
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: ".06em",
              color: "var(--muted)", padding: "2px 6px",
              border: "1px solid var(--line)", borderRadius: 4,
            }}>BETA</span>
          )}
        </div>

        {/* Company pill */}
        {clientName && (
          <div style={{
            margin: collapsed ? "10px 6px 6px" : "10px 10px 6px",
            padding: collapsed ? "8px" : "9px 10px",
            background: "var(--ink2)", border: "1px solid var(--line)",
            borderRadius: 9, display: "flex", alignItems: "center",
            gap: 8, justifyContent: collapsed ? "center" : "flex-start",
            cursor: "default",
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6, background: "var(--gold)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 10, flexShrink: 0,
            }}>
              {clientName.slice(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: "var(--bright)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {clientName}
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>
                  Workspace · Growth
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflow: "auto", padding: "6px 0 8px" }}>
          {NAV.map(section => (
            <div key={section.section}>
              {!collapsed && (
                <div style={{
                  padding: "12px 14px 4px",
                  fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)",
                  textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700,
                }}>
                  {section.section}
                </div>
              )}
              {section.items.map(item => {
                const active = item.match(pathname)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex", alignItems: "center",
                      gap: collapsed ? 0 : 9,
                      padding: collapsed ? "9px" : "8px 10px",
                      margin: collapsed ? "1px 8px" : "1px 8px",
                      borderRadius: 8, cursor: "pointer",
                      color: active ? "var(--gold)" : "var(--secondary)",
                      fontWeight: active ? 700 : 500,
                      fontSize: 13, textDecoration: "none",
                      border: `1px solid ${active ? "var(--gold-border)" : "transparent"}`,
                      background: active ? "var(--gold-bg)" : "transparent",
                      justifyContent: collapsed ? "center" : "flex-start",
                      transition: "all 0.1s",
                      position: "relative",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "var(--ink2)"
                        ;(e.currentTarget as HTMLElement).style.color = "var(--primary)"
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent"
                        ;(e.currentTarget as HTMLElement).style.color = "var(--secondary)"
                      }
                    }}
                  >
                    {/* Active indicator bar */}
                    {active && !collapsed && (
                      <span style={{
                        position: "absolute", left: -8, top: 8, bottom: 8,
                        width: 2.5, background: "var(--gold)", borderRadius: 99,
                      }} />
                    )}
                    <item.Icon />
                    {!collapsed && (
                      <span style={{ flex: 1 }}>{item.label}</span>
                    )}
                    {/* Credits badge on billing removed */}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: collapsed ? "10px 8px" : "10px 10px",
          borderTop: "1px solid var(--line)",
        }}>
          {/* Settings link */}
          {!collapsed && (
            <Link href="/dashboard/profile" style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "8px 10px", borderRadius: 8, marginBottom: 6,
              color: "var(--muted)", fontSize: 13, fontWeight: 500,
              textDecoration: "none", transition: "all 0.1s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ink2)"; (e.currentTarget as HTMLElement).style.color = "var(--primary)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--muted)" }}
            >
              <IcoSettings /> Settings
            </Link>
          )}

          {/* User row */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                width: "100%", background: "var(--ink2)", border: "1px solid var(--line)",
                borderRadius: 9, cursor: "pointer",
                display: "flex", alignItems: "center",
                gap: 8, padding: collapsed ? "8px" : "8px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "border-color 0.1s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line2)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)" }}
            >
              {/* Avatar */}
              <div style={{
                width: 28, height: 28, borderRadius: 99, flexShrink: 0,
                background: avatarUrl ? "transparent" : "var(--gold-bg)",
                border: "1px solid var(--gold-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gold)",
                overflow: "hidden",
              }}>
                {avatarUrl
                  ? <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initials
                }
              </div>
              {!collapsed && (
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bright)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {clientName || "My account"}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {userEmail}
                  </div>
                </div>
              )}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 6px)", left: 0, right: 0,
                background: "#fff", border: "1px solid var(--line)", borderRadius: 10,
                padding: 6, zIndex: 50,
                boxShadow: "0 8px 24px -4px rgba(0,0,0,.12)",
              }}>
                <Link href="/dashboard/profile" style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 7, textDecoration: "none",
                  color: "var(--secondary)", fontSize: 12.5, fontWeight: 500,
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--ink2)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                  onClick={() => setMenuOpen(false)}
                >
                  <IcoSettings /> Profile &amp; settings
                </Link>
                <div style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
                <button
                  onClick={signOut}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "8px 10px", background: "none",
                    border: "none", cursor: "pointer", color: "var(--rose)",
                    fontSize: 12.5, borderRadius: 7, fontFamily: "var(--font-body)",
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--rose-bg)" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  <IcoSignOut /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "0 24px", height: 52,
          borderBottom: "1px solid var(--line)",
          background: "#fff", flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)",
              textTransform: "uppercase", letterSpacing: ".12em",
            }}>
              GatiHire Client Portal
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--bright)", letterSpacing: "-0.02em" }}>
              {pageTitle}
            </div>
          </div>

          {/* Topbar actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Credits indicator */}
            {credits && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 10px",
                  background: lowCredits ? "var(--rose-bg)" : "var(--gold-bg)",
                  border: `1px solid ${lowCredits ? "var(--rose-border)" : "var(--gold-border)"}`,
                  borderRadius: 7, fontSize: 11.5, fontWeight: 600,
                  color: lowCredits ? "var(--rose)" : "var(--gold)",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V8a5 5 0 0 1 9.6-2" strokeLinecap="round"/>
                  </svg>
                  {credits.profile_unlock_credits} unlocks left
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 10px",
                  background: credits.job_post_credits <= 0 ? "var(--rose-bg)" : "var(--gold-bg)",
                  border: `1px solid ${credits.job_post_credits <= 0 ? "var(--rose-border)" : "var(--gold-border)"}`,
                  borderRadius: 7, fontSize: 11.5, fontWeight: 600,
                  color: credits.job_post_credits <= 0 ? "var(--rose)" : "var(--gold)",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="8" width="18" height="13" rx="2"/>
                    <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  {credits.job_post_credits} job credits
                </div>
                <Link href="/dashboard/billing" style={{
                  fontSize: 12, fontWeight: 700, color: "var(--gold)", textDecoration: "underline", marginLeft: 4
                }}>
                  Add credits
                </Link>
              </div>
            )}
            <Link href="/dashboard/jobs/new" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", background: "var(--bright)",
              borderRadius: 7, color: "#fff", fontSize: 12.5, fontWeight: 700,
              textDecoration: "none",
            }}>
              + Post a job
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="content page-enter">
          <Suspense fallback={
            <div style={{
              color: "var(--muted)", fontFamily: "var(--font-mono)",
              fontSize: 11, padding: "40px", letterSpacing: ".08em",
            }}>
              LOADING…
            </div>
          }>
            {children}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
