"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { PageLoader, SkeletonGrid } from "@/components/ui/Loader"

type BillingTab = "bundles" | "credits"
type BundleType = "database" | "jobposting" | "both"
type BundleDuration = "1month" | "3months" | "6months"
type CreditType = "profile_unlocks" | "job_posts"

interface Credits {
  job_post_credits: number
  profile_unlock_credits: number
}

const BUNDLES: Record<BundleType, Record<BundleDuration, { price: number; credits: string; description: string }>> = {
  database: {
    "1month": { price: 2499, credits: "100 profile unlocks", description: "Full profile = phone + email + resume + structured details" },
    "3months": { price: 5999, credits: "300 profile unlocks", description: "Full profile = phone + email + resume + structured details" },
    "6months": { price: 10999, credits: "700 profile unlocks", description: "Full profile = phone + email + resume + structured details" },
  },
  jobposting: {
    "1month": { price: 1999, credits: "2 job credits", description: "Each job live 21 days, applicant management included" },
    "3months": { price: 4999, credits: "6 job credits", description: "Each job live 21 days, applicant management included" },
    "6months": { price: 9999, credits: "15 job credits", description: "Each job live 21 days, applicant management included" },
  },
  both: {
    "1month": { price: 3499, credits: "2 jobs + 80 unlocks", description: "Combined database access + job posting" },
    "3months": { price: 7999, credits: "6 jobs + 250 unlocks", description: "Combined database access + job posting" },
    "6months": { price: 14999, credits: "15 jobs + 600 unlocks", description: "Combined database access + job posting" },
  },
}

const BUNDLE_LABELS: Record<BundleType, string> = {
  database: "Database Only",
  jobposting: "Job Posting Only",
  both: "Database + Job Posting",
}

const DURATION_LABELS: Record<BundleDuration, string> = {
  "1month": "1 Month",
  "3months": "3 Months",
  "6months": "6 Months",
}

const INDIVIDUAL_PRICES = {
  profile_unlocks: { perCredit: 35, minCredits: 5, maxCredits: 100 },
  job_posts: { perCredit: 1200, minCredits: 1, maxCredits: 20 },
}

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>("bundles")
  const [credits, setCredits] = useState<Credits | null>(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])

  // Bundle state
  const [selectedBundle, setSelectedBundle] = useState<BundleType>("both")
  const [selectedDuration, setSelectedDuration] = useState<BundleDuration>("1month")

  // Individual credit state
  const [creditType, setCreditType] = useState<CreditType>("profile_unlocks")
  const [creditAmount, setCreditAmount] = useState(10)
  const [reqMsg, setReqMsg] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    try {
      const res = await fetch("/api/client/credits", { headers: { Authorization: `Bearer ${token}` } })
      const d = await res.json()
      setCredits(d.credits || { job_post_credits: 0, profile_unlock_credits: 0 })
      setTransactions(d.transactions || [])
      setRequests(d.requests || [])
    } catch (e) {
      console.error("Failed to load credits:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequesting(true)
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return

    const bundleInfo = activeTab === "bundles"
      ? {
          type: "bundle",
          bundle: selectedBundle,
          duration: selectedDuration,
          price: BUNDLES[selectedBundle][selectedDuration].price,
          credits: BUNDLES[selectedBundle][selectedDuration].credits,
        }
      : {
          type: "individual",
          creditType,
          amount: creditAmount,
          estimatedCost: creditAmount * INDIVIDUAL_PRICES[creditType].perCredit,
        }

    await fetch("/api/client/credits", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        request_type: activeTab === "bundles" ? "profile_unlocks" : creditType,
        requested_amount: activeTab === "bundles" ? 1 : creditAmount,
        message: `${reqMsg}\n---ORDER_DETAILS---\n${JSON.stringify(bundleInfo)}`,
      }),
    })
    setRequesting(false)
    setSubmitted(true)
    load()
  }

  const resetForm = () => {
    setSubmitted(false)
    setReqMsg("")
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price)
  }

  const currentBundle = BUNDLES[selectedBundle][selectedDuration]
  const individualPrice = INDIVIDUAL_PRICES[creditType]
  const individualTotal = creditAmount * individualPrice.perCredit

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="page-enter">
      {/* Balance Cards */}
      <div className="intel-grid" style={{ marginBottom: "24px", gridTemplateColumns: "1fr 1fr" }}>
        <div className="metric-card gold card-hover">
          <div className="metric-eyebrow">Profile Unlocks</div>
          <div className="metric-value">{credits?.profile_unlock_credits ?? 0}</div>
          <div className="metric-sub">credits available</div>
        </div>
        <div className="metric-card blue card-hover">
          <div className="metric-eyebrow">Job Posts</div>
          <div className="metric-value">{credits?.job_post_credits ?? 0}</div>
          <div className="metric-sub">credits available</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--ink2)", padding: "4px", borderRadius: "var(--r2)", width: "fit-content" }}>
        <button
          onClick={() => setActiveTab("bundles")}
          className={`tab-btn ${activeTab === "bundles" ? "active" : ""}`}
          style={{
            padding: "10px 24px",
            borderRadius: "var(--r)",
            border: "none",
            background: activeTab === "bundles" ? "#ffffff" : "transparent",
            color: activeTab === "bundles" ? "var(--gold)" : "var(--secondary)",
            fontWeight: activeTab === "bundles" ? 600 : 500,
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: activeTab === "bundles" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          }}
        >
          Subscription Bundles
        </button>
        <button
          onClick={() => setActiveTab("credits")}
          className={`tab-btn ${activeTab === "credits" ? "active" : ""}`}
          style={{
            padding: "10px 24px",
            borderRadius: "var(--r)",
            border: "none",
            background: activeTab === "credits" ? "#ffffff" : "transparent",
            color: activeTab === "credits" ? "var(--gold)" : "var(--secondary)",
            fontWeight: activeTab === "credits" ? 600 : 500,
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: activeTab === "credits" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          }}
        >
          Buy Credits
        </button>
      </div>

      {submitted ? (
        <div className="section-card slide-up">
          <div className="section-body" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <div style={{ fontSize: "18px", color: "var(--bright)", fontWeight: 600, marginBottom: "8px" }}>Request Submitted!</div>
            <div style={{ fontSize: "13px", color: "var(--secondary)", marginBottom: "20px" }}>
              Our team will process your request within 24 hours and notify you.
            </div>
            <button
              onClick={resetForm}
              style={{
                padding: "10px 24px",
                background: "var(--gold)",
                border: "none",
                borderRadius: "var(--r)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Make Another Request
            </button>
          </div>
        </div>
      ) : activeTab === "bundles" ? (
        <div className="slide-up">
          {/* Bundle Type Selector */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            {(Object.keys(BUNDLES) as BundleType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedBundle(type)}
                style={{
                  flex: 1,
                  padding: "16px",
                  background: selectedBundle === type ? "var(--gold-bg)" : "#ffffff",
                  border: `2px solid ${selectedBundle === type ? "var(--gold)" : "var(--line)"}`,
                  borderRadius: "var(--r2)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: 600, color: selectedBundle === type ? "var(--gold)" : "var(--bright)", marginBottom: "4px" }}>
                  {BUNDLE_LABELS[type]}
                </div>
                <div style={{ fontSize: "11px", color: "var(--dim)" }}>
                  {type === "database" && "Access candidate database"}
                  {type === "jobposting" && "Post jobs on platform"}
                  {type === "both" && "Best value - Both features"}
                </div>
              </button>
            ))}
          </div>

          {/* Duration Selector */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", justifyContent: "center" }}>
            {(Object.keys(BUNDLES.database) as BundleDuration[]).map((duration) => {
              const bundle = BUNDLES[selectedBundle][duration]
              const perMonth = duration === "1month" ? bundle.price : duration === "3months" ? Math.round(bundle.price / 3) : Math.round(bundle.price / 6)
              return (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  style={{
                    padding: "12px 20px",
                    background: selectedDuration === duration ? "var(--gold)" : "#ffffff",
                    border: `1px solid ${selectedDuration === duration ? "var(--gold)" : "var(--line)"}`,
                    borderRadius: "var(--r)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "center",
                    minWidth: "140px",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600, color: selectedDuration === duration ? "#ffffff" : "var(--bright)", marginBottom: "2px" }}>
                    {DURATION_LABELS[duration]}
                  </div>
                  <div style={{ fontSize: "11px", color: selectedDuration === duration ? "rgba(255,255,255,0.8)" : "var(--dim)" }}>
                    {formatPrice(perMonth)}/month
                  </div>
                  {duration !== "1month" && (
                    <div style={{ fontSize: "9px", color: selectedDuration === duration ? "rgba(255,255,255,0.9)" : "var(--green)", marginTop: "2px", fontWeight: 600 }}>
                      Save {duration === "3months" ? "20%" : "30%"}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected Bundle Details */}
          <div className="section-card gradient-border" style={{ marginBottom: "24px" }}>
            <div className="section-header">
              <div>
                <div className="section-title">{BUNDLE_LABELS[selectedBundle]} — {DURATION_LABELS[selectedDuration]}</div>
                <div className="section-sub">{currentBundle.description}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--gold)" }}>{formatPrice(currentBundle.price)}</div>
                <div style={{ fontSize: "11px", color: "var(--dim)" }}>total for {DURATION_LABELS[selectedDuration]}</div>
              </div>
            </div>
            <div className="section-body">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "var(--ink2)", borderRadius: "var(--r)", marginBottom: "16px" }}>
                <div style={{ fontSize: "24px" }}>🎁</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--bright)" }}>You get: {currentBundle.credits}</div>
                  <div style={{ fontSize: "12px", color: "var(--secondary)" }}>{currentBundle.description}</div>
                </div>
              </div>
              <button
                onClick={submitRequest}
                disabled={requesting}
                className="shimmer-btn"
                style={{ width: "100%" }}
              >
                {requesting ? "Submitting..." : `Request Bundle — ${formatPrice(currentBundle.price)}`}
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">All Plans Comparison</div>
              <div className="section-sub">Choose what works best for your hiring needs</div>
            </div>
            <div className="section-body" style={{ padding: 0 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--ink2)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>Service</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>1 Month</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>3 Months</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "10px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono)" }}>6 Months</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(BUNDLES) as BundleType[]).map((type) => (
                    <tr
                      key={type}
                      style={{
                        borderBottom: "1px solid var(--line)",
                        background: selectedBundle === type ? "var(--gold-bg)" : "transparent",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedBundle(type)}
                    >
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500, color: "var(--bright)" }}>
                        {BUNDLE_LABELS[type]}
                      </td>
                      {(["1month", "3months", "6months"] as BundleDuration[]).map((duration) => (
                        <td key={duration} style={{ padding: "14px 16px", textAlign: "center", fontSize: "13px", color: "var(--secondary)" }}>
                          {formatPrice(BUNDLES[type][duration].price)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="slide-up">
          {/* Price Comparison Banner */}
          <div className="section-card" style={{ marginBottom: "24px", background: "linear-gradient(135deg, var(--gold-bg), var(--blue-bg))", border: "1px solid var(--gold-border)" }}>
            <div className="section-body">
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--bright)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>💡</span>
                Per-Credit Cost Comparison
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ padding: "16px", background: "#ffffff", borderRadius: "var(--r)", border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: "11px", color: "var(--dim)", marginBottom: "4px" }}>Subscription (6 months)</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--green)" }}>
                    ₹{Math.round(10999 / 700)}/unlock
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--secondary)", marginTop: "2px" }}>Best value for regular hiring</div>
                </div>
                <div style={{ padding: "16px", background: "#ffffff", borderRadius: "var(--r)", border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: "11px", color: "var(--dim)", marginBottom: "4px" }}>Individual Purchase</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--gold)" }}>
                    ₹{individualPrice.perCredit}/unlock
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--secondary)", marginTop: "2px" }}>Flexible, pay as you go</div>
                </div>
              </div>
              <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(22, 163, 74, 0.08)", borderRadius: "var(--r)", border: "1px solid var(--green-border)" }}>
                <div style={{ fontSize: "12px", color: "var(--green)", fontWeight: 500 }}>
                  ✨ Save up to {Math.round((1 - (10999 / 700) / individualPrice.perCredit) * 100)}% with subscription bundles!
                </div>
              </div>
            </div>
          </div>

          {/* Credit Type Selector */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <button
              onClick={() => setCreditType("profile_unlocks")}
              style={{
                flex: 1,
                padding: "16px",
                background: creditType === "profile_unlocks" ? "var(--gold-bg)" : "#ffffff",
                border: `2px solid ${creditType === "profile_unlocks" ? "var(--gold)" : "var(--line)"}`,
                borderRadius: "var(--r2)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 600, color: creditType === "profile_unlocks" ? "var(--gold)" : "var(--bright)", marginBottom: "4px" }}>
                Profile Unlocks
              </div>
              <div style={{ fontSize: "12px", color: "var(--secondary)" }}>₹{individualPrice.perCredit} per credit</div>
              <div style={{ fontSize: "10px", color: "var(--dim)", marginTop: "2px" }}>Reveal phone, email, resume & details</div>
            </button>
            <button
              onClick={() => setCreditType("job_posts")}
              style={{
                flex: 1,
                padding: "16px",
                background: creditType === "job_posts" ? "var(--blue-bg)" : "#ffffff",
                border: `2px solid ${creditType === "job_posts" ? "var(--blue)" : "var(--line)"}`,
                borderRadius: "var(--r2)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 600, color: creditType === "job_posts" ? "var(--blue)" : "var(--bright)", marginBottom: "4px" }}>
                Job Posts
              </div>
              <div style={{ fontSize: "12px", color: "var(--secondary)" }}>₹{individualPrice.perCredit.toLocaleString("en-IN")} per credit</div>
              <div style={{ fontSize: "10px", color: "var(--dim)", marginTop: "2px" }}>Post a job for 21 days</div>
            </button>
          </div>

          {/* Amount Selector */}
          <div className="section-card" style={{ marginBottom: "24px" }}>
            <div className="section-header">
              <div className="section-title">Select Amount</div>
            </div>
            <div className="section-body">
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <button
                  onClick={() => setCreditAmount(Math.max(individualPrice.minCredits, creditAmount - 5))}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid var(--line)",
                    background: "#ffffff",
                    cursor: "pointer",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--secondary)",
                  }}
                >
                  −
                </button>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--bright)" }}>{creditAmount}</div>
                  <div style={{ fontSize: "12px", color: "var(--dim)" }}>credits</div>
                </div>
                <button
                  onClick={() => setCreditAmount(Math.min(individualPrice.maxCredits, creditAmount + 5))}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid var(--line)",
                    background: "#ffffff",
                    cursor: "pointer",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--secondary)",
                  }}
                >
                  +
                </button>
              </div>

              <input
                type="range"
                min={individualPrice.minCredits}
                max={individualPrice.maxCredits}
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--gold)", marginBottom: "8px" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--dim)", fontFamily: "var(--font-mono)" }}>
                <span>{individualPrice.minCredits}</span>
                <span>{individualPrice.maxCredits}</span>
              </div>

              <div style={{ marginTop: "20px", padding: "16px", background: "var(--ink2)", borderRadius: "var(--r)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--dim)", marginBottom: "2px" }}>Total Cost</div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--gold)" }}>
                    ₹{individualTotal.toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "var(--secondary)" }}>
                    {creditAmount} × ₹{individualPrice.perCredit}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--dim)" }}>
                    {creditType === "profile_unlocks" ? "profile unlocks" : "job posts"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">Request Credits</div>
              <div className="section-sub">Our team will process within 24 hours</div>
            </div>
            <div className="section-body">
              <form onSubmit={submitRequest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={lStyle}>Message (optional)</label>
                  <textarea
                    value={reqMsg}
                    onChange={(e) => setReqMsg(e.target.value)}
                    rows={3}
                    placeholder="Tell us what you're hiring for or any special requirements…"
                    style={{ ...iStyle, resize: "vertical", height: "auto" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={requesting}
                  className="shimmer-btn"
                  style={{ width: "100%" }}
                >
                  {requesting ? "Submitting..." : `Request ${creditAmount} Credits — ₹${individualTotal.toLocaleString("en-IN")}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div className="section-card" style={{ marginTop: "24px" }}>
          <div className="section-header">
            <div className="section-title">Transaction History</div>
          </div>
          <div className="section-body" style={{ padding: 0 }}>
            {transactions.slice(0, 10).map((t: any) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "var(--secondary)" }}>{t.note || t.type}</div>
                  <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
                    {new Date(t.created_at).toLocaleDateString()}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: t.amount > 0 ? "var(--green)" : "var(--rose)",
                  }}
                >
                  {t.amount > 0 ? `+${t.amount}` : t.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const lStyle: React.CSSProperties = {
  display: "block",
  fontSize: "10px",
  color: "var(--secondary)",
  fontFamily: "var(--font-mono)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: "6px",
}

const iStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "var(--ink3)",
  border: "1px solid var(--line2)",
  borderRadius: "var(--r)",
  color: "var(--bright)",
  fontSize: "13px",
  fontFamily: "var(--font-body)",
  outline: "none",
  boxSizing: "border-box",
}
