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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", boxShadow: "0 4px 14px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "8px" }}>Profile Unlocks Available</div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em" }}>{credits?.profile_unlock_credits ?? 0}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", boxShadow: "0 4px 14px rgba(0,0,0,0.02)" }}>
          <div style={{ fontSize: "12px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "8px" }}>Job Posts Available</div>
          <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em" }}>{credits?.job_post_credits ?? 0}</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "32px", background: "#fff", border: "1px solid var(--line)", padding: "6px", borderRadius: "12px", width: "fit-content" }}>
        <button
          onClick={() => setActiveTab("bundles")}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "bundles" ? "var(--bright)" : "transparent",
            color: activeTab === "bundles" ? "#fff" : "var(--dim)",
            fontWeight: activeTab === "bundles" ? 700 : 600,
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: activeTab === "bundles" ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
          }}
        >
          Subscription Bundles
        </button>
        <button
          onClick={() => setActiveTab("credits")}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "credits" ? "var(--bright)" : "transparent",
            color: activeTab === "credits" ? "#fff" : "var(--dim)",
            fontWeight: activeTab === "credits" ? 700 : 600,
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: activeTab === "credits" ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
          }}
        >
          Buy Credits
        </button>
      </div>

      {submitted ? (
        <div className="slide-up">
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "16px", padding: "48px 32px", textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>✅</div>
            <div style={{ fontSize: "24px", color: "var(--bright)", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.01em" }}>Request Submitted!</div>
            <div style={{ fontSize: "14px", color: "var(--dim)", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px auto", lineHeight: 1.5 }}>
              Our team has received your request and will process it within 24 hours. We'll notify you once your account is recharged.
            </div>
            <button
              onClick={resetForm}
              style={{
                padding: "14px 28px",
                background: "var(--bright)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                transition: "background 0.2s"
              }}
            >
              Make Another Request
            </button>
          </div>
        </div>
      ) : activeTab === "bundles" ? (
        <div className="slide-up">
          {/* Bundle Type Selector */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            {(Object.keys(BUNDLES) as BundleType[]).map((type) => (
              <div
                key={type}
                onClick={() => setSelectedBundle(type)}
                style={{
                  padding: "24px 20px",
                  background: selectedBundle === type ? "#fff" : "var(--ink)",
                  border: `2px solid ${selectedBundle === type ? "var(--bright)" : "var(--line)"}`,
                  borderRadius: "16px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "center",
                  boxShadow: selectedBundle === type ? "0 8px 30px rgba(0,0,0,0.06)" : "none",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {type === "both" && selectedBundle !== "both" && (
                   <div style={{ position: "absolute", top: 0, right: 0, background: "var(--gold-bg)", color: "var(--gold)", padding: "4px 12px", fontSize: "10px", fontWeight: 800, borderBottomLeftRadius: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Value</div>
                )}
                {type === "both" && selectedBundle === "both" && (
                   <div style={{ position: "absolute", top: 0, right: 0, background: "var(--bright)", color: "#fff", padding: "4px 12px", fontSize: "10px", fontWeight: 800, borderBottomLeftRadius: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Value</div>
                )}
                <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--bright)", marginBottom: "8px" }}>
                  {BUNDLE_LABELS[type]}
                </div>
                <div style={{ fontSize: "13px", color: "var(--secondary)", lineHeight: 1.5 }}>
                  {type === "database" && "Full access to our candidate database with contact unlocks"}
                  {type === "jobposting" && "Post your jobs on our platform to attract active candidates"}
                  {type === "both" && "The complete hiring solution: source and attract candidates"}
                </div>
              </div>
            ))}
          </div>

          {/* Duration Selector */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "32px", justifyContent: "center" }}>
            {(Object.keys(BUNDLES.database) as BundleDuration[]).map((duration) => {
              const bundle = BUNDLES[selectedBundle][duration]
              const perMonth = duration === "1month" ? bundle.price : duration === "3months" ? Math.round(bundle.price / 3) : Math.round(bundle.price / 6)
              return (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  style={{
                    padding: "16px 24px",
                    background: selectedDuration === duration ? "var(--bright)" : "#fff",
                    border: `1px solid ${selectedDuration === duration ? "var(--bright)" : "var(--line)"}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "center",
                    minWidth: "160px",
                    boxShadow: selectedDuration === duration ? "0 4px 14px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 800, color: selectedDuration === duration ? "#fff" : "var(--bright)", marginBottom: "4px" }}>
                    {DURATION_LABELS[duration]}
                  </div>
                  <div style={{ fontSize: "13px", color: selectedDuration === duration ? "rgba(255,255,255,0.9)" : "var(--secondary)" }}>
                    {formatPrice(perMonth)}/mo
                  </div>
                  {duration !== "1month" && (
                    <div style={{ fontSize: "11px", color: selectedDuration === duration ? "var(--gold)" : "var(--green)", marginTop: "6px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Save {duration === "3months" ? "20%" : "30%"}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected Bundle Details */}
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "16px", padding: "32px", marginBottom: "32px", display: "flex", gap: "32px", alignItems: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--bright)", marginBottom: "8px", letterSpacing: "-0.01em" }}>{BUNDLE_LABELS[selectedBundle]} — {DURATION_LABELS[selectedDuration]}</div>
              <div style={{ fontSize: "14px", color: "var(--secondary)", marginBottom: "20px", lineHeight: 1.5 }}>{currentBundle.description}</div>
              
              <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "20px", background: "var(--ink)", borderRadius: "12px" }}>
                <div style={{ fontSize: "24px" }}>✨</div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "var(--bright)", marginBottom: "4px" }}>You receive: {currentBundle.credits}</div>
                  <div style={{ fontSize: "13px", color: "var(--dim)" }}>{currentBundle.description}</div>
                </div>
              </div>
            </div>
            
            <div style={{ flexShrink: 0, width: "300px", padding: "24px", background: "var(--ink)", borderRadius: "12px", border: "1px solid var(--line)", textAlign: "center", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "8px" }}>Total for {DURATION_LABELS[selectedDuration]}</div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em" }}>{formatPrice(currentBundle.price)}</div>
              </div>
              <button
                onClick={submitRequest}
                disabled={requesting}
                style={{
                  width: "100%", padding: "14px", background: "var(--gold)", color: "#fff", border: "none", borderRadius: "8px",
                  fontSize: "14px", fontWeight: 800, cursor: requesting ? "wait" : "pointer", transition: "opacity 0.2s"
                }}
              >
                {requesting ? "Submitting Request..." : "Request Bundle"}
              </button>
            </div>
          </div>

          {/* Comparison Table */}
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "16px", overflow: "hidden" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--line)" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--bright)", marginBottom: "4px" }}>All Plans Comparison</div>
              <div style={{ fontSize: "13px", color: "var(--dim)" }}>Choose what works best for your hiring needs</div>
            </div>
            <div style={{ padding: 0, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr style={{ background: "var(--ink)" }}>
                    <th style={{ padding: "16px 32px", textAlign: "left", fontSize: "11px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>Plan Type</th>
                    <th style={{ padding: "16px 20px", textAlign: "center", fontSize: "11px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>1 Month</th>
                    <th style={{ padding: "16px 20px", textAlign: "center", fontSize: "11px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>3 Months</th>
                    <th style={{ padding: "16px 32px", textAlign: "center", fontSize: "11px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>6 Months</th>
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
                        transition: "background 0.2s"
                      }}
                      onClick={() => setSelectedBundle(type)}
                      onMouseEnter={(e) => { if(selectedBundle !== type) e.currentTarget.style.background = "var(--ink)" }}
                      onMouseLeave={(e) => { if(selectedBundle !== type) e.currentTarget.style.background = "transparent" }}
                    >
                      <td style={{ padding: "20px 32px", fontSize: "14px", fontWeight: 700, color: "var(--bright)" }}>
                        {BUNDLE_LABELS[type]}
                      </td>
                      {(["1month", "3months", "6months"] as BundleDuration[]).map((duration, i) => (
                        <td key={duration} style={{ padding: `20px ${i === 2 ? '32px' : '20px'}`, textAlign: "center", fontSize: "14px", color: "var(--secondary)", fontWeight: 500 }}>
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
          <div style={{ marginBottom: "32px", padding: "24px", background: "linear-gradient(135deg, var(--ink), #fff)", border: "1px solid var(--line)", borderRadius: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--bright)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>💡</span>
              Per-Credit Cost Comparison
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              <div style={{ padding: "20px", background: "#fff", borderRadius: "12px", border: "1px solid var(--line)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "8px" }}>Subscription (6 months)</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--green)", letterSpacing: "-0.02em" }}>
                  ₹{Math.round(10999 / 700)}<span style={{ fontSize: "14px", color: "var(--dim)", fontWeight: 600 }}>/unlock</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "4px" }}>Best value for regular hiring</div>
              </div>
              <div style={{ padding: "20px", background: "#fff", borderRadius: "12px", border: "1px solid var(--line)", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div style={{ fontSize: "12px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "8px" }}>Individual Purchase</div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em" }}>
                  ₹{individualPrice.perCredit}<span style={{ fontSize: "14px", color: "var(--dim)", fontWeight: 600 }}>/unlock</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "4px" }}>Flexible, pay as you go</div>
              </div>
            </div>
            <div style={{ marginTop: "16px", padding: "12px 16px", background: "var(--green-bg)", borderRadius: "8px", border: "1px solid var(--green-border)" }}>
              <div style={{ fontSize: "13px", color: "var(--green)", fontWeight: 700 }}>
                ✨ Save up to {Math.round((1 - (10999 / 700) / individualPrice.perCredit) * 100)}% with subscription bundles!
              </div>
            </div>
          </div>

          {/* Credit Type Selector */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            <button
              onClick={() => setCreditType("profile_unlocks")}
              style={{
                padding: "24px 20px",
                background: creditType === "profile_unlocks" ? "#fff" : "var(--ink)",
                border: `2px solid ${creditType === "profile_unlocks" ? "var(--bright)" : "var(--line)"}`,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "center",
                boxShadow: creditType === "profile_unlocks" ? "0 8px 30px rgba(0,0,0,0.06)" : "none"
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--bright)", marginBottom: "8px" }}>
                Profile Unlocks
              </div>
              <div style={{ fontSize: "14px", color: "var(--secondary)", fontWeight: 600 }}>₹{individualPrice.perCredit} per credit</div>
              <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "4px" }}>Reveal phone, email, resume & details</div>
            </button>
            <button
              onClick={() => setCreditType("job_posts")}
              style={{
                padding: "24px 20px",
                background: creditType === "job_posts" ? "#fff" : "var(--ink)",
                border: `2px solid ${creditType === "job_posts" ? "var(--bright)" : "var(--line)"}`,
                borderRadius: "16px",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "center",
                boxShadow: creditType === "job_posts" ? "0 8px 30px rgba(0,0,0,0.06)" : "none"
              }}
            >
              <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--bright)", marginBottom: "8px" }}>
                Job Posts
              </div>
              <div style={{ fontSize: "14px", color: "var(--secondary)", fontWeight: 600 }}>₹{individualPrice.perCredit.toLocaleString("en-IN")} per credit</div>
              <div style={{ fontSize: "12px", color: "var(--dim)", marginTop: "4px" }}>Post a job for 21 days</div>
            </button>
          </div>

          {/* Amount Selector */}
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "16px", padding: "32px", marginBottom: "32px" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--bright)", marginBottom: "24px" }}>Select Amount</div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
              <button
                onClick={() => setCreditAmount(Math.max(individualPrice.minCredits, creditAmount - 5))}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "1px solid var(--line)",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--secondary)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--ink)"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                −
              </button>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: "48px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em" }}>{creditAmount}</div>
                <div style={{ fontSize: "14px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>credits</div>
              </div>
              <button
                onClick={() => setCreditAmount(Math.min(individualPrice.maxCredits, creditAmount + 5))}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  border: "1px solid var(--line)",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--secondary)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--ink)"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
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
              style={{ width: "100%", accentColor: "var(--bright)", marginBottom: "12px" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--dim)", fontWeight: 600 }}>
              <span>{individualPrice.minCredits}</span>
              <span>{individualPrice.maxCredits}</span>
            </div>
          </div>

          {/* Request Form */}
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "16px", padding: "32px", display: "flex", gap: "32px", alignItems: "flex-start", boxShadow: "0 8px 30px rgba(0,0,0,0.04)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--bright)", marginBottom: "8px", letterSpacing: "-0.01em" }}>Request Credits</div>
              <div style={{ fontSize: "14px", color: "var(--dim)", marginBottom: "24px" }}>Our team will process your request within 24 hours.</div>
              
              <form onSubmit={submitRequest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "8px" }}>Message (optional)</label>
                  <textarea
                    value={reqMsg}
                    onChange={(e) => setReqMsg(e.target.value)}
                    rows={4}
                    placeholder="Tell us what you're hiring for or any special requirements…"
                    style={{ width: "100%", padding: "14px", background: "var(--ink)", border: "1px solid var(--line)", borderRadius: "12px", color: "var(--bright)", fontSize: "14px", fontFamily: "inherit", resize: "vertical", outline: "none" }}
                    onFocus={e => e.currentTarget.style.borderColor = "var(--bright)"}
                    onBlur={e => e.currentTarget.style.borderColor = "var(--line)"}
                  />
                </div>
              </form>
            </div>
            
            <div style={{ flexShrink: 0, width: "320px", padding: "24px", background: "var(--ink)", borderRadius: "12px", border: "1px solid var(--line)", textAlign: "center", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "8px" }}>Total Cost</div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--bright)", letterSpacing: "-0.02em", marginBottom: "4px" }}>₹{individualTotal.toLocaleString("en-IN")}</div>
                <div style={{ fontSize: "13px", color: "var(--secondary)" }}>
                  {creditAmount} × ₹{individualPrice.perCredit} <span style={{ color: "var(--dim)" }}>({creditType === "profile_unlocks" ? "unlocks" : "posts"})</span>
                </div>
              </div>
              <button
                onClick={submitRequest}
                disabled={requesting}
                style={{
                  width: "100%", padding: "14px", background: "var(--gold)", color: "#fff", border: "none", borderRadius: "8px",
                  fontSize: "14px", fontWeight: 800, cursor: requesting ? "wait" : "pointer", transition: "opacity 0.2s"
                }}
              >
                {requesting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "16px", marginTop: "32px", overflow: "hidden" }}>
          <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--bright)" }}>Transaction History</div>
          </div>
          <div style={{ padding: 0 }}>
            {transactions.slice(0, 10).map((t: any) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 32px",
                  borderBottom: "1px solid var(--line)",
                  background: "#fff",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--ink)"}
                onMouseLeave={e => e.currentTarget.style.background = "#fff"}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--bright)", marginBottom: "4px" }}>{t.note || t.type}</div>
                  <div style={{ fontSize: "12px", color: "var(--dim)" }}>
                    {new Date(t.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: t.amount > 0 ? "var(--green)" : "var(--bright)",
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
