import { NextRequest, NextResponse } from "next/server"
import { getClientContext } from "@/lib/clientAuth"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  const token = (request.headers.get("authorization") || "").replace("Bearer ", "")
  const ctx = await getClientContext(request)
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { customInputs } = body

    if (!customInputs?.jobTitle?.trim()) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `You are an expert HR copywriter specializing in Indian logistics, transport, warehousing, and supply chain industries.
Write a highly professional, detailed, and engaging job description tailored for the Indian job market based on these inputs:

Job Title: ${customInputs.jobTitle}
Industry: ${customInputs.industry || "Not specified"}
Sub Category: ${customInputs.subCategory || "Not specified"}
Location: ${customInputs.location || "Not specified"}
City: ${customInputs.city || "Not specified"}
Employment Type: ${customInputs.employmentType || "Full-time"}
Shift Type: ${customInputs.shiftType || "Day shift"}
Salary Type: ${customInputs.salaryType || "Monthly"}
Min Experience: ${customInputs.experienceMin || "Not specified"} years
Max Experience: ${customInputs.experienceMax || "Not specified"} years
Min Education: ${customInputs.educationMin || "Not specified"}
English Level: ${customInputs.englishLevel || "Not specified"}
License Type: ${customInputs.licenseType || "Not specified"}
Role Category: ${customInputs.roleCategory || "Not specified"}
Department Category: ${customInputs.departmentCategory || "Not specified"}
Urgency: ${customInputs.urgency || "Not specified"}
Openings: ${customInputs.openings || 1}
Required Skills: ${(customInputs.skillsRequired || []).join(", ")}
Additional Requirements/Constraints: ${customInputs.additionalRequirements || "None"}

Please output valid JSON only, without markdown wrapping or code blocks. The JSON must have these keys:
{
  "description": "A compelling 2-3 paragraph summary of the role, what the company does (contextual to logistics), the impact of the role, and why it's a great opportunity for candidates in India.",
  "responsibilities": ["Specific, actionable list item 1", "Specific, actionable list item 2", "At least 5-7 detailed responsibilities"],
  "requirements": ["Specific requirement 1", "Specific requirement 2", "At least 5-7 detailed requirements including experience, education, certifications if applicable"],
  "benefits": ["Benefit 1", "Benefit 2", "Common logistics industry benefits like PF, ESI, insurance, incentives, etc."],
  "suggestedSkills": ["Must-have skill 1", "Must-have skill 2", "Good-to-have skill 1", "8-12 relevant skills specific to this role in Indian logistics industry"]
}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?|\n?```/g, "").trim()
    
    const parsed = JSON.parse(text)

    return NextResponse.json({ 
      jobDescription: parsed, 
      suggestedSkills: parsed.suggestedSkills || []
    })
  } catch (error) {
    console.error("JD generation failed:", error)
    return NextResponse.json(
      { error: "Failed to generate job description" },
      { status: 500 }
    )
  }
}
