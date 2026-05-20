import { NextRequest, NextResponse } from "next/server"
import { getClientContext } from "@/lib/clientAuth"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { candidates = [], requirement = "" } = body

  if (!candidates.length || !requirement) {
    return NextResponse.json({ error: "Candidates and requirement are required" }, { status: 400 })
  }

  // We should limit to 5 candidates per batch to avoid hitting token limits
  const batch = candidates.slice(0, 5)

  const prompt = `
You are an expert HR recruiter. Analyze the following candidate profiles against the job requirement.
Job Requirement: "${requirement}"

For each candidate, provide a 2-3 sentence summary explaining WHY they are a good fit for this specific requirement.
IMPORTANT: You MUST wrap the key requirement words (like the specific role, location, key skills, or years of experience mentioned in the Job Requirement) in **double asterisks** in your response so they can be highlighted. For example: "The candidate has 5 years of experience as a **fleet manager** in **Delhi**."

Candidates:
${batch.map((c: any, i: number) => `
[Candidate ${i}]
ID: ${c.id}
Role: ${c.current_role || 'N/A'}
Company: ${c.current_company || 'N/A'}
Location: ${c.location || 'N/A'}
Experience: ${c.total_experience || 'N/A'} years
Skills: ${(c.technical_skills || []).join(', ')}
Summary: ${c.summary || 'N/A'}
`).join('\n')}

Output your analysis as a strict JSON array of objects with 'id' and 'analysis' fields.
Example Output Format:
[
  { "id": "uuid-1", "analysis": "Strong match due to their 8 years of experience as a **fleet supervisor** located in **Gurgaon**." },
  { "id": "uuid-2", "analysis": "Good fit with solid background in **logistics** and **supply chain**, though currently based in Noida." }
]
`

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim()
    
    let analysisData = []
    try {
      analysisData = JSON.parse(text)
    } catch (e) {
      console.error("Failed to parse Gemini JSON output:", text)
      // Fallback if JSON parsing fails
      return NextResponse.json({ error: "Failed to parse analysis" }, { status: 500 })
    }

    return NextResponse.json({ analysis: analysisData })
  } catch (error: any) {
    console.error("AI Analysis Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
