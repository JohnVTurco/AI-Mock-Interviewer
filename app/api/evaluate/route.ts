import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { question, code } = await req.json();
    if (!question || !code) {
      return NextResponse.json({ error: "question and code required" }, { status: 400 });
    }

    let evaluation = "";

    // Try OpenAI API if key is configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const system = `You are a strict but helpful interview evaluator for coding interviews.
Evaluate the candidate's solution for:
1. Correctness - Does the logic solve the problem?
2. Time/Space Complexity - Analyze Big O complexity
3. Edge Cases - Are edge cases handled properly?
4. Code Quality - Readability, naming, structure
5. Best Practices - Proper use of data structures and patterns

Give actionable feedback and a summary score (0-10) at the end.
Format your response with clear sections for each evaluation criteria.`;

        const response = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `Question:\n${question}\n\nCandidate code:\n${code}`
            },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        });

        evaluation = response.choices[0]?.message?.content ?? "";
      } catch (aiError) {
        console.error("OpenAI API failed:", aiError);
      }
    } else {
      console.log("OpenAI API key not configured, using fallback evaluation");
    }

    // Use fallback evaluation if OpenAI didn't provide one
    if (!evaluation) {
      evaluation = `## Code Evaluation

**Note:** AI evaluation unavailable (API key not configured or quota exceeded).

**Basic Analysis:**
- Code received and ready for manual review
- Please review for correctness, complexity, and edge cases
- Consider time/space complexity optimization
- Check for proper error handling

**Manual Review Checklist:**
1. Does the solution correctly solve the problem?
2. What is the time complexity? Can it be improved?
3. What is the space complexity? Can it be optimized?
4. Are all edge cases handled (empty input, null, single element, etc.)?
5. Is the code readable and well-structured?

**Recommendation:** Configure OpenAI API key in .env file for detailed AI-powered feedback.`;
    }

    return NextResponse.json({ evaluation });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
