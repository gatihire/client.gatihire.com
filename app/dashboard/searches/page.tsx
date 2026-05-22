"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Sparkles, FileText, Search, ArrowRight, ArrowLeft, ChevronLeft } from "lucide-react"
import {
  SearchMode, Candidate, SidebarFilters, EMPTY_FILTERS,
  FilterSidebar, CandidateCard, CreditBanner, SearchBtn, SearchSkeletonGrid
} from "@/components/dashboard/search-helpers"
import { SearchCandidateProfileModal } from "@/components/jobs/SearchProfileModal"

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token || ""
}

const PAGE_SIZE = 20

export default function SearchesPage() {
  const [mode, setMode] = useState<SearchMode>("ai")
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [jdText, setJdText] = useState("")
  const [results, setResults] = useState<Candidate[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<Candidate | null>(null)
  const [criteria, setCriteria] = useState<any>(null)
  const [credits, setCredits] = useState(0)
  const [filters, setFilters] = useState<SidebarFilters>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(true)
  const [sortBy, setSortBy] = useState<"relevance" | "experience" | "name">("relevance")
  const [page, setPage] = useState(1)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditReqType, setCreditReqType] = useState("profile_unlock")
  const [creditReqAmount, setCreditReqAmount] = useState("10")
  const [creditReqMsg, setCreditReqMsg] = useState("")
  const [creditReqLoading, setCreditReqLoading] = useState(false)
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, string>>({})
  const aiAnalysisFetchingRef = useRef<Set<string>>(new Set())
  const candidateDetailsCache = useRef<Record<string, { work_experience: any[]; education: any[] }>>({})

  useEffect(() => {
    ;(async () => {
      try {
        const token = await getToken()
        const res = await fetch("/api/client/credits", { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) { const d = await res.json(); setCredits(d.credits?.profile_unlock_credits ?? 0) }
      } catch {}
    })()
  }, [])

  const performFetch = useCallback(async (currentOffset: number) => {
    const token = await getToken()
    let res: Response
    const payload: any = { offset: currentOffset, limit: 20, filters }
    if (mode === "simple") {
      payload.query = query
      res = await fetch("/api/client/search/simple", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    } else if (mode === "ai") {
      payload.query = query
      res = await fetch("/api/client/search/ai", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    } else {
      payload.jd = jdText
      res = await fetch("/api/client/search/jd", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) })
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Search failed")
    return data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, query, jdText, filters])

  const doSearch = useCallback(async () => {
    setLoading(true); setError(""); setSearched(false); setPage(1)
    try {
      const data = await performFetch(0)
      setResults(data.results || [])
      setTotalCount(data.total || 0)
      setCriteria(data.criteria || null)
      setSearched(true)
      setAiAnalysisMap({})
      aiAnalysisFetchingRef.current.clear()
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [performFetch])

  const fetchMore = useCallback(async () => {
    if (loadingMore || results.length >= totalCount) return
    setLoadingMore(true)
    try {
      const data = await performFetch(results.length)
      setResults(prev => [...prev, ...(data.results || [])])
    } catch (e: any) { console.error("Fetch more failed:", e) }
    finally { setLoadingMore(false) }
  }, [results.length, totalCount, loadingMore, performFetch])

  useEffect(() => {
    if (page * PAGE_SIZE > results.length && results.length < totalCount) fetchMore()
  }, [page, results.length, totalCount, fetchMore])

  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (searched) doSearch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const unlock = useCallback(async (candidateId: string) => {
    setUnlocking(candidateId)
    try {
      const token = await getToken()
      const res = await fetch("/api/client/unlock", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Unlock failed")
      setResults(prev => prev.map(c => c.id === candidateId
        ? { ...c, is_unlocked: true, name: data.candidate?.name, email: data.candidate?.email, phone: data.candidate?.phone, file_url: data.candidate?.file_url, linkedin_profile: data.candidate?.linkedin_profile, summary: data.candidate?.summary }
        : c
      ))
      if (selectedCard?.id === candidateId) setSelectedCard(prev => prev ? { ...prev, is_unlocked: true, ...data.candidate } : prev)
      if (!data.already_unlocked) setCredits(p => Math.max(0, p - 1))
    } catch (e: any) { alert(e.message) } finally { setUnlocking(null) }
  }, [selectedCard])

  const submitCreditRequest = async () => {
    setCreditReqLoading(true)
    try {
      const token = await getToken()
      const res = await fetch("/api/client/credits", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ request_type: creditReqType, requested_amount: Number(creditReqAmount), message: creditReqMsg })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setShowCreditModal(false); setCreditReqMsg("")
      alert("Credit request submitted! Our team will recharge your account after payment.")
    } catch (e: any) { alert(e.message) } finally { setCreditReqLoading(false) }
  }

  const sorted = useMemo(() => {
    const arr = [...results]
    if (sortBy === "experience") arr.sort((a, b) => (b.total_experience || 0) - (a.total_experience || 0))
    else if (sortBy === "name") arr.sort((a, b) => (a.initials || "").localeCompare(b.initials || ""))
    else arr.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
    return arr
  }, [results, sortBy])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const isWaitingForData = page * PAGE_SIZE > results.length && totalCount > results.length

  // AI analysis batch fetch
  useEffect(() => {
    if (paged.length === 0) return
    const unanalyzed = paged.filter(c => !aiAnalysisMap[c.id] && !aiAnalysisFetchingRef.current.has(c.id))
    if (unanalyzed.length === 0) return
    const batch = unanalyzed.slice(0, 5)
    batch.forEach(c => aiAnalysisFetchingRef.current.add(c.id))
    const fetchAnalysis = async () => {
      try {
        const token = await getToken()
        const reqText = mode === "jd" ? jdText : (query || filters.mustHaveKeywords.join(" "))
        const res = await fetch("/api/client/search/analyze", {
          method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ candidates: batch, requirement: reqText })
        })
        if (res.ok) {
          const data = await res.json()
          if (data.analysis && Array.isArray(data.analysis)) {
            setAiAnalysisMap(prev => {
              const next = { ...prev }
              data.analysis.forEach((item: any) => { if (item.id && item.analysis) next[item.id] = item.analysis })
              return next
            })
          }
        }
      } catch (e) { console.error("Failed to fetch AI analysis", e) }
    }
    const timer = setTimeout(() => fetchAnalysis(), 800)
    return () => clearTimeout(timer)
  }, [paged, aiAnalysisMap, mode, query, jdText, filters.mustHaveKeywords])

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", maxWidth: 1200, margin: "0 auto", width: "100%" }}>

      {/* Left Sidebar — only visible after search */}
      {searched && results.length > 0 && (
        <FilterSidebar filters={filters} setFilters={setFilters} show={showFilters} setShow={setShowFilters} />
      )}

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Page header */}
        {!searched && (
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              Talent Database
            </h1>
            <p style={{ fontSize: 13, color: "var(--dim)", margin: 0 }}>
              1,24,820 verified logistics profiles · AI-powered matching
            </p>
          </div>
        )}

        {/* Mode tabs — only before search */}
        {!searched && !loading && (
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {([
              { id: "ai" as SearchMode, label: "Smart AI Search", icon: <Sparkles size={14} /> },
              { id: "jd" as SearchMode, label: "From JD", icon: <FileText size={14} /> },
              { id: "simple" as SearchMode, label: "Manual Filters", icon: <Search size={14} /> },
            ]).map(m => {
              const active = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => { setMode(m.id); setResults([]); setSearched(false); setCriteria(null) }}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", borderRadius: 9, cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                    background: active ? "var(--gold)" : "#fff",
                    border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`,
                    color: active ? "#fff" : "var(--secondary)",
                    fontFamily: "var(--font-body)", transition: "all 0.12s"
                  }}
                >
                  {m.icon} {m.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Search panel — before search */}
        {!searched && !loading ? (
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: "24px 24px", marginBottom: 20 }}>
            {mode === "ai" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 8,
                  background: "var(--gold-bg)", border: "1px solid var(--gold-border)",
                  fontSize: 12, color: "var(--gold)", fontWeight: 600, alignSelf: "flex-start"
                }}>
                  <Sparkles size={13} />
                  Describe your ideal candidate in plain English
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "var(--ink)", border: "1px solid var(--line)",
                  borderRadius: 10, padding: "12px 16px"
                }}>
                  <Search size={16} color="var(--dim)" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="e.g. Warehouse supervisor in Bhiwandi with SAP EWM and 5+ years"
                    onKeyDown={e => e.key === "Enter" && doSearch()}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--bright)", fontSize: 14, fontFamily: "var(--font-body)" }}
                    autoFocus
                  />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["SAP EWM · Supervisor · Bhiwandi", "Fleet manager · 8+ yrs · Delhi NCR", "Last-mile coordinator · Bangalore"].map(q => (
                    <button key={q} onClick={() => setQuery(q)} style={{
                      padding: "5px 12px", borderRadius: 7, fontSize: 11, cursor: "pointer",
                      background: "var(--ink)", border: "1px solid var(--line)", color: "var(--secondary)", fontFamily: "var(--font-body)",
                      transition: "border-color 0.12s",
                    }}>
                      {q}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <SearchBtn onClick={doSearch} loading={loading} disabled={!query.trim()} label="Search candidates" icon={<Sparkles size={14} />} />
                </div>
              </div>
            )}

            {mode === "jd" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--bright)", marginBottom: 4 }}>Paste your job description</div>
                  <div style={{ fontSize: 12, color: "var(--dim)" }}>AI extracts requirements and finds matching candidates automatically.</div>
                </div>
                <textarea
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  rows={7}
                  placeholder="Paste the full job description here — role, requirements, skills, location, experience..."
                  style={{ ...iStyle, resize: "vertical", height: "auto" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <SearchBtn onClick={doSearch} loading={loading} disabled={!jdText.trim()} label="Analyze & search" icon={<FileText size={14} />} />
                </div>
              </div>
            )}

            {mode === "simple" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={lStyle}>Keywords *</label>
                    <div style={{ background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 9, padding: "8px 12px", minHeight: 90 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                        {filters.mustHaveKeywords.map(kw => (
                          <span key={kw} style={{ background: "var(--gold-bg)", color: "var(--gold)", border: "1px solid var(--gold-border)", padding: "3px 10px", borderRadius: 99, fontSize: 11, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                            {kw}
                            <button onClick={() => setFilters({ ...filters, mustHaveKeywords: filters.mustHaveKeywords.filter(k => k !== kw) })} style={{ cursor: "pointer", background: "transparent", border: "none", color: "var(--gold)", padding: 0, fontSize: 14 }}>x</button>
                          </span>
                        ))}
                        <input
                          style={{ background: "transparent", border: "none", outline: "none", color: "var(--bright)", fontSize: 13, flex: 1, minWidth: 140, fontFamily: "var(--font-body)" }}
                          placeholder="Type keyword + Enter..."
                          onKeyDown={e => {
                            if (e.key === "Enter" && e.currentTarget.value.trim()) {
                              const val = e.currentTarget.value.trim()
                              if (!filters.mustHaveKeywords.includes(val)) setFilters({ ...filters, mustHaveKeywords: [...filters.mustHaveKeywords, val] })
                              e.currentTarget.value = ""
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={lStyle}>City / region</label>
                    <input style={iStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bhiwandi, Mumbai" onKeyDown={e => e.key === "Enter" && doSearch()} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={lStyle}>Min experience</label>
                    <select value={filters.experience.min} onChange={e => setFilters({ ...filters, experience: { ...filters.experience, min: e.target.value } })} style={iStyle}>
                      <option value="">Any</option>
                      {[0, 1, 2, 3, 5, 10].map(v => <option key={v} value={v}>{v}+ yrs</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lStyle}>Max experience</label>
                    <select value={filters.experience.max} onChange={e => setFilters({ ...filters, experience: { ...filters.experience, max: e.target.value } })} style={iStyle}>
                      <option value="">Any</option>
                      {[1, 2, 5, 10, 15].map(v => <option key={v} value={v}>up to {v} yrs</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lStyle}>Min education</label>
                    <select value={filters.education[0] || ""} onChange={e => setFilters({ ...filters, education: e.target.value ? [e.target.value] : [] })} style={iStyle}>
                      <option value="">Any</option>
                      {["10th", "12th", "diploma", "graduate", "postgraduate"].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <button onClick={() => { setFilters(EMPTY_FILTERS); setLocation(""); setQuery("") }} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                    Reset
                  </button>
                  <SearchBtn onClick={doSearch} loading={loading} label="Search candidates" />
                </div>
              </div>
            )}

            {error && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--rose-bg)", border: "1px solid var(--rose-border)", borderRadius: 8, fontSize: 12, color: "var(--rose)" }}>
                {error}
              </div>
            )}
          </div>
        ) : !loading && (
          /* Search pill (after results) */
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#fff", border: "1px solid var(--line)", borderRadius: 12,
            padding: "13px 18px", marginBottom: 16
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "var(--dim)", textTransform: "uppercase", fontFamily: "var(--font-mono)", marginBottom: 3 }}>
                Search query
              </div>
              <div style={{ fontSize: 13, color: "var(--bright)", fontWeight: 600 }}>
                {mode === "ai" ? query : mode === "simple" ? (query || filters.mustHaveKeywords.join(", ") || "Manual search") : "Job description search"}
              </div>
            </div>
            <button
              onClick={() => setSearched(false)}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}
            >
              <ChevronLeft size={13} /> Refine
            </button>
          </div>
        )}

        {/* Criteria chips */}
        {searched && !loading && (
          <div style={{ marginBottom: 14, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--dim)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Matched on:</span>
            {(mode === "ai" || mode === "jd") && criteria ? (
              [criteria.role || criteria.title, ...(criteria.required_skills || criteria.skills || []).slice(0, 6)].filter(Boolean).map((s: string, i: number) => (
                <span key={i} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{s}</span>
              ))
            ) : mode === "simple" ? (
              [query, ...filters.mustHaveKeywords].filter(Boolean).map((s: string, i: number) => (
                <span key={i} style={{ padding: "3px 9px", borderRadius: 99, fontSize: 10, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{s}</span>
              ))
            ) : null}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && <SearchSkeletonGrid />}

        {/* Results */}
        {searched && !loading && (
          <div>
            <CreditBanner credits={credits} onRequest={() => setShowCreditModal(true)} />

            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.015em" }}>
                  {totalCount.toLocaleString()} profiles found
                </div>
                <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 2 }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => { setSearched(false); setQuery("") }} style={{ padding: "7px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}>
                  New search
                </button>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ ...iStyle, width: "auto", padding: "7px 12px", fontSize: 12 }}>
                  <option value="relevance">Sort: Relevance</option>
                  <option value="experience">Sort: Experience</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
            </div>

            {paged.length === 0 && !loadingMore && !isWaitingForData ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--dim)", fontSize: 13, background: "#fff", borderRadius: 12, border: "1px dashed var(--line)" }}>
                No candidates match your criteria. Try broadening the search.
              </div>
            ) : paged.length === 0 && (loadingMore || isWaitingForData) ? (
              <SearchSkeletonGrid />
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {paged.map(c => (
                    <CandidateCard
                      key={c.id}
                      c={c}
                      unlocking={unlocking === c.id}
                      onUnlock={() => unlock(c.id)}
                      onClick={() => setSelectedCard(c)}
                      aiAnalysis={aiAnalysisMap[c.id]}
                    />
                  ))}
                </div>

                {(loadingMore || isWaitingForData) && <div style={{ marginTop: 16 }}><SearchSkeletonGrid /></div>}

                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loadingMore || isWaitingForData} style={{ ...pgBtn, display: "flex", alignItems: "center", gap: 4, opacity: page <= 1 ? 0.4 : 1 }}>
                      <ArrowLeft size={13} /> Prev
                    </button>
                    <span style={{ fontSize: 12, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
                      {(loadingMore || isWaitingForData) ? "Loading..." : `Page ${page} of ${totalPages}`}
                    </span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loadingMore || isWaitingForData} style={{ ...pgBtn, display: "flex", alignItems: "center", gap: 4, opacity: page >= totalPages ? 0.4 : 1 }}>
                      Next <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Profile modal (same as jobs, without stages) */}
      {selectedCard && (
        <SearchCandidateProfileModal
          candidate={selectedCard}
          onClose={() => setSelectedCard(null)}
          detailsCache={candidateDetailsCache}
          aiAnalysis={aiAnalysisMap[selectedCard.id]}
          unlocking={unlocking === selectedCard.id}
          onUnlock={() => unlock(selectedCard.id)}
        />
      )}

      {/* Credit request modal */}
      {showCreditModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowCreditModal(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div style={{ position: "relative", width: 440, background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 28, zIndex: 1 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--bright)", marginBottom: 6 }}>Request more credits</div>
            <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 20, lineHeight: 1.5 }}>Our team will contact you for payment and recharge your account.</div>
            <div style={{ marginBottom: 14 }}>
              <label style={lStyle}>Credit type</label>
              <select value={creditReqType} onChange={e => setCreditReqType(e.target.value)} style={iStyle}>
                <option value="profile_unlock">Profile unlock credits</option>
                <option value="job_post">Job post credits</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lStyle}>Amount</label>
              <input type="number" value={creditReqAmount} onChange={e => setCreditReqAmount(e.target.value)} min={1} style={iStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lStyle}>Message (optional)</label>
              <textarea value={creditReqMsg} onChange={e => setCreditReqMsg(e.target.value)} rows={3} placeholder="Any notes for our team..." style={{ ...iStyle, resize: "vertical", height: "auto" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCreditModal(false)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)" }}>Cancel</button>
              <button onClick={submitCreditRequest} disabled={creditReqLoading || Number(creditReqAmount) < 1} style={{ padding: "8px 20px", background: creditReqLoading ? "var(--ink)" : "var(--gold)", border: "none", borderRadius: 8, color: creditReqLoading ? "var(--dim)" : "#fff", fontWeight: 700, fontSize: 12, cursor: creditReqLoading ? "wait" : "pointer", fontFamily: "var(--font-body)" }}>
                {creditReqLoading ? "Submitting..." : "Submit request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const pgBtn: React.CSSProperties = { padding: "6px 14px", background: "#fff", border: "1px solid var(--line)", borderRadius: 8, color: "var(--secondary)", fontSize: 12, fontFamily: "var(--font-mono)", cursor: "pointer" }
const lStyle: React.CSSProperties = { display: "block", fontSize: 10, color: "var(--dim)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 700 }
const iStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, color: "var(--bright)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" as const }
