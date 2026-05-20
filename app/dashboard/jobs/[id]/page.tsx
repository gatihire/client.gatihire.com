import { notFound } from "next/navigation"
import { JobDashboardClient } from "@/components/jobs/JobDashboardClient"

export const runtime = "nodejs"
export const revalidate = 0

export default async function DashboardJobPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <JobDashboardClient jobId={id} />
    </main>
  )
}

