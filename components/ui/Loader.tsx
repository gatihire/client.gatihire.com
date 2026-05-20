"use client"

export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="loader-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <div className="loader-text">Loading...</div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-short"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line skeleton-medium"></div>
    </div>
  )
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function ShimmerButton({ children, loading = false }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button className={`shimmer-btn ${loading ? "loading" : ""}`} disabled={loading}>
      {loading && <span className="shimmer-spinner"></span>}
      {children}
    </button>
  )
}
