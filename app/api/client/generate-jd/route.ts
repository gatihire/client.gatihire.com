import { NextRequest, NextResponse } from "next/server"
import { getClientContext } from "@/lib/clientAuth"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { customInputs } = body

    if (!customInputs?.jobTitle?.trim()) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `You are an expert HR copywriter specializing in Indian logistics, transport, and supply chain industries.
Write a professional, engaging, and clear job description based on these inputs:

Job Title: ${customInputs.jobTitle}
Industry: ${customInputs.industry || "Not specified"}
Sub Category: ${customInputs.subCategory || "Not specified"}
Location: ${customInputs.location || "Not specified"}
Employment Type: ${customInputs.type || "Full-time"}
Required Skills: ${(customInputs.skillsRequired || []).join(", ")}
Additional Requirements/Constraints: ${customInputs.additionalRequirements || "None"}

Please output valid JSON only, without markdown wrapping or code blocks. The JSON must have these keys:
{
  "description": "A compelling 2-3 paragraph summary of the role, the company, and why it's a great opportunity.",
  "responsibilities": ["List item 1", "List item 2", "etc"],
  "requirements": ["List item 1", "List item 2", "etc"],
  "skills": ["Skill 1", "Skill 2"]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim()
    
    const parsed = JSON.parse(text)

    return NextResponse.json({ jobDescription: parsed })
  } catch (error) {
    console.error("JD generation failed:", error)
    return NextResponse.json(
      { error: "Failed to generate job description" },
      { status: 500 }
    )
  }
}
