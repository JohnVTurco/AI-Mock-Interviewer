import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const FALLBACK_RESUME_TIPS = [
  "✓ Quantify your achievements with specific metrics and numbers",
  "✓ Use strong action verbs (e.g., 'Led', 'Developed', 'Implemented', 'Optimized')",
  "✓ Tailor your resume to the specific job you're applying for",
  "✓ Keep your resume concise - aim for 1-2 pages maximum",
  "✓ Include relevant technical skills and tools you've used",
  "✓ Highlight projects that demonstrate problem-solving abilities",
  "✓ Remove outdated or irrelevant experience",
  "✓ Use a clean, professional format with consistent styling",
  "✓ Include education, certifications, and relevant coursework",
  "✓ Proofread carefully for grammar and spelling errors",
  "✓ Focus on impact rather than responsibilities",
  "✓ Add links to your GitHub, LinkedIn, or portfolio if applicable",
  "✓ Use industry-specific keywords that ATS systems look for",
  "✓ Show progression and growth in your career path",
  "✓ Include leadership experience and teamwork examples"
];

function generateFallbackReview(resumeText: string): string {
  const wordCount = resumeText.split(/\s+/).length;
  const hasNumbers = /\d+/.test(resumeText);
  const hasEmail = /@/.test(resumeText);
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);

  // Select random tips
  const shuffled = [...FALLBACK_RESUME_TIPS].sort(() => 0.5 - Math.random());
  const selectedTips = shuffled.slice(0, 8);

  let review = `## Resume Review\n\n`;
  review += `**Note:** AI review unavailable (API not configured). Here's a general analysis:\n\n`;

  review += `### Quick Stats\n`;
  review += `- Word Count: ${wordCount} words\n`;
  review += `- Contains Contact Info: ${hasEmail && hasPhone ? '✓ Yes' : '✗ Missing email or phone'}\n`;
  review += `- Contains Metrics: ${hasNumbers ? '✓ Yes' : '○ Consider adding numbers'}\n\n`;

  review += `### General Resume Tips\n\n`;
  selectedTips.forEach(tip => {
    review += `${tip}\n`;
  });

  review += `\n### Key Areas to Focus On\n\n`;
  review += `**1. Content Quality**\n`;
  review += `- Use specific examples and quantifiable achievements\n`;
  review += `- Focus on results and impact, not just duties\n`;
  review += `- Tailor content to your target role\n\n`;

  review += `**2. Formatting**\n`;
  review += `- Ensure consistent formatting throughout\n`;
  review += `- Use clear section headers\n`;
  review += `- Keep layout clean and ATS-friendly\n\n`;

  review += `**3. Technical Details**\n`;
  review += `- List relevant technical skills prominently\n`;
  review += `- Include tools, languages, and frameworks\n`;
  review += `- Mention any certifications or special training\n\n`;

  review += `**Overall Score:** 7/10 (Based on general best practices)\n\n`;
  review += `💡 **Tip:** Configure OpenAI API key for detailed, personalized AI-powered resume feedback.`;

  return review;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText } = body;

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "resumeText required" }, { status: 400 });
    }

    let review = "";

    // Try OpenAI API if key is configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const system = `You are an expert resume reviewer and career coach with experience in tech recruiting.
Review the provided resume and give constructive feedback on:

1. **Content Quality** - Are achievements quantified? Are action verbs used effectively?
2. **Structure & Format** - Is it well-organized and easy to scan?
3. **Technical Skills** - Are relevant skills highlighted appropriately?
4. **Impact & Results** - Does it show measurable impact?
5. **ATS Compatibility** - Will it pass applicant tracking systems?
6. **Areas for Improvement** - What specific changes would make this stronger?

Provide actionable suggestions and a summary score (0-10) at the end.
Be constructive but honest. Format your response with clear sections.`;

        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `Please review this resume:\n\n${resumeText}`
            },
          ],
          max_tokens: 1500,
          temperature: 0.5,
        });

        review = response.choices[0]?.message?.content ?? "";
      } catch (apiError) {
        console.error("OpenAI API failed, using fallback:", apiError);
      }
    } else {
      console.log("OpenAI API key not configured, using fallback review");
    }

    // Use fallback if OpenAI didn't return a review
    if (!review) {
      review = generateFallbackReview(resumeText);
    }

    return NextResponse.json({ review });
  } catch (e: any) {
    console.error("Resume review error:", e);
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
