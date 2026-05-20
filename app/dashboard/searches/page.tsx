"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Target, Shield, Sparkles, FileText, Bot, Search, AlertCircle, Coins, ArrowRight, ArrowLeft, ChevronLeft, CheckCircle } from "lucide-react"
import {
  SearchMode, Candidate, SidebarFilters, EMPTY_FILTERS,
  FilterSidebar, CandidateCard, ProfileDrawer, CreditBanner, SearchBtn, SearchSkeletonGrid
} from "@/components/dashboard/search-helpers"
import { PageLoader } from "@/components/ui/Loader"

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
  const [showFilters, setShowFilters] = useState(true)
  const [filters, setFilters] = useState<SidebarFilters>(EMPTY_FILTERS)
  const [sortBy, setSortBy] = useState<"relevance" | "experience" | "name">("relevance")
  const [page, setPage] = useState(1)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditReqType, setCreditReqType] = useState("profile_unlock")
  const [creditReqAmount, setCreditReqAmount] = useState("10")
  const [creditReqMsg, setCreditReqMsg] = useState("")
  const [creditReqLoading, setCreditReqLoading] = useState(false)
  const [aiAnalysisMap, setAiAnalysisMap] = useState<Record<string, string>>({})
  const aiAnalysisFetchingRef = useRef<Set<string>>(new Set())

  // Fetch credits on mount
  useEffect(() => {
    ;(async () => {
      try {
        const token = await getToken()
        const res = await fetch("/api/client/credits", { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) { const d = await res.json(); setCredits(d.credits?.profile_unlock_credits ?? 0) }
      } catch {}
    })()
  }, [])

  const performFetch = async (currentOffset: number) => {
    const token = await getToken()
    let res: Response
    const payload: any = { offset: currentOffset, limit: 20, filters }
    if (mode === "simple") {
      payload.query = query
      res = await fetch("/api/client/search/simple", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    } else if (mode === "ai") {
      payload.query = query
      res = await fetch("/api/client/search/ai", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    } else {
      payload.jd = jdText
      res = await fetch("/api/client/search/jd", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    }
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Search failed")
    return data
  }

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
  }, [mode, query, location, jdText, filters])

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
    if (page * PAGE_SIZE > results.length && results.length < totalCount) {
      fetchMore()
    }
  }, [page, results.length, totalCount, fetchMore])

  // Refetch when filters change, but only if we've already searched once
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (searched) {
      doSearch()
    }
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
      alert("✅ Credit request submitted! Our team has been notified via email and will recharge your account after payment.")
    } catch (e: any) { alert(e.message) } finally { setCreditReqLoading(false) }
  }

  // Server-side filtering already handled in API
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

  useEffect(() => {
    if (paged.length === 0) return;

    const unanalyzed = paged.filter(c => !aiAnalysisMap[c.id] && !aiAnalysisFetchingRef.current.has(c.id));
    if (unanalyzed.length === 0) return;

    const batch = unanalyzed.slice(0, 5);
    batch.forEach(c => aiAnalysisFetchingRef.current.add(c.id));

    const fetchAnalysis = async () => {
      try {
        const token = await getToken()
        const reqText = mode === 'jd' ? jdText : (query || filters.mustHaveKeywords.join(" "));
        const res = await fetch("/api/client/search/analyze", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ candidates: batch, requirement: reqText })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.analysis && Array.isArray(data.analysis)) {
            setAiAnalysisMap(prev => {
              const next = { ...prev };
              data.analysis.forEach((item: any) => {
                if (item.id && item.analysis) {
                  next[item.id] = item.analysis;
                }
              });
              return next;
            });
          }
        }
      } catch (e) {
        console.error("Failed to fetch AI analysis", e);
      }
    };

    // Add a slight delay to prevent hammering the API instantly when scrolling rapidly
    const timer = setTimeout(() => fetchAnalysis(), 1000);
    return () => clearTimeout(timer);
  }, [paged, aiAnalysisMap, mode, query, jdText, filters.mustHaveKeywords]);

  const modeLabel = (id: SearchMode) => ({ 
    simple: "Search manually", 
    ai: "Use GatiHireAI", 
    jd: "Use Job Description" 
  })[id];

  const modeIcon = (id: SearchMode) => ({
    simple: <Shield size={16} />,
    ai: <Sparkles size={16} />,
    jd: <FileText size={16} />
  })[id];

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      {/* Left Sidebar — only visible after search returns results */}
      {searched && results.length > 0 && (
        <div style={{ width: 280, flexShrink: 0 }}>
          <FilterSidebar filters={filters} setFilters={setFilters} show={true} setShow={() => {}} />
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--bright)", marginBottom: 8 }}>Smart Resume Search</h1>
          <p style={{ fontSize: 14, color: "var(--secondary)" }}>AI-powered vector search to find the most relevant candidates for your requirements</p>
        </div>

        {/* Central Search Branding */}
        {!searched && !loading && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8, color: "var(--gold)" }}>
              <Target size={32} />
              <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--bright)" }}>GatiHire Smart Search</h2>
            </div>
            <p style={{ fontSize: 15, color: "var(--secondary)" }}>Find the perfect logistics and transportation candidates with AI-powered search.</p>
          </div>
        )}

        {/* Mode Tabs */}
        {!searched && !loading && (
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 32 }}>
            {(["ai", "jd", "simple"] as SearchMode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setResults([]); setSearched(false); setCriteria(null) }} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontSize: 13,
                fontWeight: 500, border: "1px solid",
                background: mode === m ? "var(--ink)" : "var(--ink2)",
                borderColor: mode === m ? "var(--line)" : "var(--line2)",
                color: mode === m ? "var(--bright)" : "var(--secondary)", 
                boxShadow: mode === m ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
                transition: "all 0.2s",
              }}>
                <span style={{ display: "flex", alignItems: "center" }}>{modeIcon(m)}</span>
                {modeLabel(m)}
              </button>
            ))}
          </div>
        )}

        {/* Search Panel */}
        {!searched && !loading ? (
          <div style={{ background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "var(--r2)", padding: "20px 24px", marginBottom: 24 }}>
          {mode === "simple" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--bright)", marginBottom: 4 }}>GatiHire Smart Search</h3>
                  <p style={{ fontSize: 13, color: "var(--secondary)" }}>Find the perfect logistics and transportation candidates with manual filters.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <label style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--font-mono)" }}>Role scope</label>
                  <select style={{ ...iStyle, width: "auto", fontSize: 11, padding: "5px 10px" }}>
                    <option>Current + Past Role</option>
                    <option>Current Role Only</option>
                  </select>
                </div>
              </div>

              {/* Searching for */}
              <div>
                <label style={{ ...lStyle, marginBottom: 12 }}>Searching for</label>
                <div style={{ display: "flex", gap: 30 }}>
                  {[
                    { id: "freshers", label: "Freshers only" },
                    { id: "experienced", label: "Experienced only" },
                    { id: "any", label: "Any" }
                  ].map(opt => (
                    <label key={opt.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--bright)" }}>
                      <input 
                        type="radio" 
                        name="expType" 
                        checked={(opt.id === "freshers" && filters.experience.max === "0") || (opt.id === "experienced" && filters.experience.min !== "" && filters.experience.min !== "0") || (opt.id === "any" && filters.experience.min === "" && filters.experience.max === "")}
                        onChange={() => {
                          if (opt.id === "freshers") setFilters({ ...filters, experience: { min: "0", max: "0" } })
                          else if (opt.id === "experienced") setFilters({ ...filters, experience: { min: "1", max: "15" } })
                          else setFilters({ ...filters, experience: { min: "", max: "" } })
                        }}
                        style={{ accentColor: "var(--gold)" }}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label style={{ ...lStyle }}>Keywords <span style={{ color: "var(--rose)" }}>*</span></label>
                <div style={{ background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 12, padding: "12px 16px", minHeight: 100, transition: "border-color 0.2s" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    {filters.mustHaveKeywords.map(kw => (
                      <span key={kw} style={{ background: "var(--gold-bg)", color: "var(--gold)", border: "1px solid var(--gold-border)", padding: "4px 12px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                        {kw}
                        <button onClick={() => setFilters({ ...filters, mustHaveKeywords: filters.mustHaveKeywords.filter(k => k !== kw) })} style={{ cursor: "pointer", background: "transparent", border: "none", color: "var(--gold)", padding: 0, fontSize: 16, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                    <input 
                      style={{ background: "transparent", border: "none", outline: "none", color: "var(--bright)", fontSize: 14, flex: 1, minWidth: 200 }} 
                      placeholder="Type to search keyword..." 
                      onKeyDown={e => {
                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                          const val = e.currentTarget.value.trim()
                          if (!filters.mustHaveKeywords.includes(val)) {
                            setFilters({ ...filters, mustHaveKeywords: [...filters.mustHaveKeywords, val] })
                          }
                          e.currentTarget.value = ""
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Current city/region */}
              <div>
                <label style={lStyle}>Current city/region</label>
                <input style={iStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder="Type to search city/region" onKeyDown={e => e.key === "Enter" && doSearch()} />
              </div>

              {/* Experience */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <label style={lStyle}>Experience</label>
                  <div style={{ display: "flex", gap: 12 }}>
                    <select 
                      value={filters.experience.min} 
                      onChange={e => setFilters({ ...filters, experience: { ...filters.experience, min: e.target.value } })} 
                      style={iStyle}
                    >
                      <option value="">Minimum experience</option>
                      {[0, 1, 2, 3, 5, 10].map(v => <option key={v} value={v}>{v} {v === 1 ? "year" : "years"}</option>)}
                    </select>
                    <select 
                      value={filters.experience.max} 
                      onChange={e => setFilters({ ...filters, experience: { ...filters.experience, max: e.target.value } })} 
                      style={iStyle}
                    >
                      <option value="">Maximum experience</option>
                      {[1, 2, 5, 10, 15].map(v => <option key={v} value={v}>{v} {v === 1 ? "year" : "years"}+</option>)}
                    </select>
                  </div>
                </div>

                {/* Minimum education */}
                <div>
                  <label style={lStyle}>Minimum education</label>
                  <select 
                    value={filters.education[0] || ""} 
                    onChange={e => setFilters({ ...filters, education: e.target.value ? [e.target.value] : [] })} 
                    style={iStyle}
                  >
                    <option value="">Select minimum education</option>
                    <option value="10th">10th Pass</option>
                    <option value="12th">12th Pass</option>
                    <option value="diploma">Diploma</option>
                    <option value="graduate">Graduate</option>
                    <option value="postgraduate">Post Graduate</option>
                  </select>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid var(--line)" }}>
                <button 
                  onClick={() => {
                    setFilters(EMPTY_FILTERS)
                    setLocation("")
                    setQuery("")
                  }} 
                  style={{ padding: "10px 24px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 8, color: "var(--secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                >
                  Reset
                </button>
                <SearchBtn onClick={doSearch} loading={loading} label="Search candidates" />
              </div>
            </div>
          )}
          {mode === "ai" && (
            <div>
              <div style={{ background: "linear-gradient(135deg, rgba(45,212,191,0.06), rgba(96,165,250,0.06))", border: "1px solid var(--blue-border)", borderRadius: "var(--r)", padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: "var(--blue)" }}><Bot size={24} /></span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--bright)", fontWeight: 500, marginBottom: 3 }}>Smart AI Search</div>
                  <div style={{ fontSize: 12, color: "var(--secondary)", lineHeight: 1.5 }}>Describe your ideal candidate in plain English. Our AI understands logistics terminology and extracts structured criteria.</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <input style={iStyle} value={query} onChange={e => setQuery(e.target.value)} placeholder="Senior logistics manager in Bangalore with SAP and cold chain experience, 8+ years" onKeyDown={e => e.key === "Enter" && doSearch()} />
                  <div style={{ marginTop: 5, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--blue)", display: "flex", alignItems: "center", gap: "4px" }}><Sparkles size={10} /> Powered by Gemini — understands natural language</div>
                </div>
                <SearchBtn onClick={doSearch} loading={loading} disabled={!query.trim()} label="Smart Search" icon={<Sparkles size={14} />} />
              </div>
            </div>
          )}
          {mode === "jd" && (
            <div>
              <div style={{ background: "linear-gradient(135deg, rgba(74,222,128,0.06), rgba(45,212,191,0.06))", border: "1px solid var(--green-border)", borderRadius: "var(--r)", padding: "14px 16px", marginBottom: 14, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: "var(--green)" }}><FileText size={24} /></span>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--bright)", fontWeight: 500, marginBottom: 3 }}>Job Description Analysis</div>
                  <div style={{ fontSize: 12, color: "var(--secondary)", lineHeight: 1.5 }}>Paste your full JD and our AI extracts requirements and finds matching candidates automatically.</div>
                </div>
              </div>
              <textarea value={jdText} onChange={e => setJdText(e.target.value)} rows={5} placeholder="Paste the full job description here — role, requirements, skills, location, experience…" style={{ ...iStyle, resize: "vertical", height: "auto" }} />
              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--dim)" }}>AI extracts required skills & matches candidates automatically</div>
                <SearchBtn onClick={doSearch} loading={loading} disabled={!jdText.trim()} label="Analyze & Search" icon={<FileText size={14} />} />
              </div>
            </div>
          )}
          {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--rose-bg)", border: "1px solid var(--rose-border)", borderRadius: 8, fontSize: 12, color: "var(--rose)" }}>{error}</div>}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "var(--r2)", padding: "16px 20px", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Search Query</div>
              <div style={{ fontSize: 14, color: "var(--bright)", fontWeight: 500 }}>
                {mode === "ai" ? query : mode === "simple" ? (query || filters.mustHaveKeywords.join(", ") || "Manual Search") : "Job Description Search"}
              </div>
            </div>
            <button onClick={() => setSearched(false)} style={{ padding: "8px 16px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: 6, color: "var(--secondary)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-mono)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              <ChevronLeft size={14} /> Refine Search
            </button>
          </div>
        )}

        {/* Criteria Chips */}
        {searched && (
          <div style={{ marginBottom: 16, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Matched on:</span>
            {(mode === "ai" || mode === "jd") && criteria ? (
              [criteria.role || criteria.title, ...(criteria.required_skills || criteria.skills || []).slice(0, 6)].filter(Boolean).map((s: string, i: number) => (
                <span key={`ai-${i}`} style={{ padding: "3px 9px", borderRadius: 4, fontSize: 10, background: "var(--blue-bg)", border: "1px solid var(--blue-border)", color: "var(--blue)", fontFamily: "var(--font-mono)" }}>{s}</span>
              ))
            ) : mode === "simple" ? (
              [query, ...filters.mustHaveKeywords].filter(Boolean).map((s: string, i: number) => (
                <span key={`s-${i}`} style={{ padding: "3px 9px", borderRadius: 4, fontSize: 10, background: "var(--gold-bg)", border: "1px solid var(--gold-border)", color: "var(--gold)", fontFamily: "var(--font-mono)" }}>{s}</span>
              ))
            ) : null}
          </div>
        )}

        {/* Results Area */}
        {loading && <SearchSkeletonGrid />}
        
        {searched && !loading && (
          <div>
            {/* Credit Banner */}
            <CreditBanner credits={credits} onRequest={() => setShowCreditModal(true)} />

            {/* Result count + sort */}
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "600", color: "var(--bright)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                  <Search size={20} /> {totalCount} profiles found
                  {(mode === "ai" || mode === "simple") && query && ` for "${query}"`}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--secondary)", marginTop: "4px", marginBottom: 0 }}>
                  Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} results
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <button onClick={() => { setSearched(false); setQuery(""); }} style={{ padding: "8px 16px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "6px", color: "var(--secondary)", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>
                  New Search
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "var(--secondary)" }}>Sort by:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} style={{ padding: "6px 12px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "6px", color: "var(--bright)", fontSize: "14px", outline: "none" }}>
                    <option value="relevance">Relevance</option>
                    <option value="experience">Experience</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {paged.length === 0 && !loadingMore && !isWaitingForData ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--dim)", fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Search size={40} /></div>
                No candidates match your filters. Try broadening your criteria.
              </div>
            ) : paged.length === 0 && (loadingMore || isWaitingForData) ? (
              <SearchSkeletonGrid />
            ) : (
              <>
                <div className="profile-grid" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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

                {(loadingMore || isWaitingForData) && <div style={{ marginTop: 20 }}><SearchSkeletonGrid /></div>}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loadingMore || isWaitingForData} style={{ ...pgBtn, opacity: page <= 1 ? 0.4 : 1, display: "flex", alignItems: "center", gap: "4px" }}><ArrowLeft size={14} /> Prev</button>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--secondary)" }}>
                      {(loadingMore || isWaitingForData) ? "Loading..." : `Page ${page} of ${totalPages}`}
                    </span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loadingMore || isWaitingForData} style={{ ...pgBtn, opacity: page >= totalPages ? 0.4 : 1, display: "flex", alignItems: "center", gap: "4px" }}>Next <ArrowRight size={14} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Profile Drawer */}
      {selectedCard && <ProfileDrawer c={selectedCard} unlocking={unlocking === selectedCard.id} onUnlock={() => unlock(selectedCard.id)} onClose={() => setSelectedCard(null)} aiAnalysis={aiAnalysisMap[selectedCard.id]} />}

      {/* Credit Request Modal */}
      {showCreditModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowCreditModal(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
          <div style={{ position: "relative", width: 440, background: "var(--ink2)", border: "1px solid var(--line)", borderRadius: "var(--r2)", padding: 28, zIndex: 1 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--bright)", fontWeight: 500, marginBottom: 6 }}>Request More Credits</div>
            <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 20 }}>Our team will contact you for payment and recharge your account.</div>
            <div style={{ marginBottom: 14 }}>
              <label style={lStyle}>Credit Type</label>
              <select value={creditReqType} onChange={e => setCreditReqType(e.target.value)} style={{ ...iStyle }}>
                <option value="profile_unlock">Profile Unlock Credits</option>
                <option value="job_post">Job Post Credits</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lStyle}>Amount</label>
              <input type="number" value={creditReqAmount} onChange={e => setCreditReqAmount(e.target.value)} min={1} style={iStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lStyle}>Message (optional)</label>
              <textarea value={creditReqMsg} onChange={e => setCreditReqMsg(e.target.value)} rows={3} placeholder="Any notes for our team…" style={{ ...iStyle, resize: "vertical", height: "auto" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCreditModal(false)} style={{ padding: "8px 16px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--secondary)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
              <button onClick={submitCreditRequest} disabled={creditReqLoading || Number(creditReqAmount) < 1} style={{ padding: "8px 20px", background: creditReqLoading ? "var(--ink4)" : "var(--gold)", border: "none", borderRadius: "var(--r)", color: "var(--ink)", fontWeight: 700, fontSize: 12, cursor: creditReqLoading ? "wait" : "pointer" }}>
                {creditReqLoading ? "Submitting…" : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const pgBtn: React.CSSProperties = { padding: "6px 14px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--secondary)", fontSize: 11, fontFamily: "var(--font-mono)", cursor: "pointer" }
const lStyle: React.CSSProperties = { display: "block", fontSize: 10, color: "var(--secondary)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }
const iStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", background: "var(--ink3)", border: "1px solid var(--line2)", borderRadius: "var(--r)", color: "var(--bright)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" }
