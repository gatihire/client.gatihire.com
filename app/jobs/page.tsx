import { Suspense } from "react"
import { JobsBoardClient } from "@/components/jobs/JobsBoardClient"

export const runtime = "nodejs"
export const revalidate = 0

export default async function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <JobsBoardClient />
    </Suspense>
  )
}
