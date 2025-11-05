import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const FALLBACK_FEEDBACK = {
  overall: `## End of Interview Feedback

**Note:** AI feedback unavailable (API not configured). Here's a general assessment:

### Overall Performance
You completed the interview session! Here are some general observations to help you improve.

### Key Strengths
✓ Engaged with the problem and attempted a solution
✓ Worked through the coding challenge
✓ Demonstrated effort and persistence

### Areas for Improvement
○ Practice explaining your thought process out loud
○ Consider multiple approaches before coding
○ Break down complex problems into smaller steps
○ Test your solution with edge cases
○ Ask clarifying questions about requirements

### Interview Skills
- **Communication:** Practice articulating your approach clearly
- **Problem Solving:** Think through the problem before jumping to code
- **Code Quality:** Focus on clean, readable code with good variable names
- **Time Management:** Balance between thinking and coding efficiently`,

  recommendations: [
    "Practice more coding problems on platforms like LeetCode, HackerRank, or CodeSignal",
    "Do mock interviews with peers or using interview preparation platforms",
    "Study common data structures and algorithms patterns",
    "Review time and space complexity analysis",
    "Work on communicating your thought process clearly",
    "Practice coding under time pressure",
    "Learn to ask good clarifying questions",
    "Study system design fundamentals for higher-level roles"
  ]
};

function generateFallbackFeedback(
  company: string,
  question: string,
  code: string,
  evaluation: string,
  timeSpent: number
): string {
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  const timeStr = `${minutes}m ${seconds}s`;

  let feedback = `## End of Interview Feedback\n\n`;
  feedback += `**Company Target:** ${company || "N/A"}\n`;
  feedback += `**Time Spent:** ${timeStr}\n`;
  feedback += `**Note:** AI feedback unavailable. Here's a general assessment:\n\n`;

  feedback += `### Session Summary\n`;
  feedback += `You worked on a coding challenge `;
  feedback += `${company ? `for ${company} ` : ""}`;
  feedback += `and spent ${timeStr} on the problem.\n\n`;

  feedback += `### Your Solution\n`;
  if (code && code.length > 50) {
    feedback += `✓ You wrote a substantial solution (${code.split('\n').length} lines)\n`;
  } else {
    feedback += `○ Your solution appears incomplete - aim to write more comprehensive code\n`;
  }

  if (evaluation) {
    feedback += `✓ You received evaluation feedback on your solution\n`;
  }

  feedback += `\n### General Interview Performance Tips\n\n`;

  feedback += `**Communication:**\n`;
  feedback += `- Explain your thought process as you code\n`;
  feedback += `- Ask clarifying questions about requirements\n`;
  feedback += `- Discuss trade-offs between different approaches\n\n`;

  feedback += `**Problem Solving:**\n`;
  feedback += `- Start by understanding the problem fully\n`;
  feedback += `- Consider multiple approaches before coding\n`;
  feedback += `- Think about edge cases early\n`;
  feedback += `- Plan your solution structure before implementing\n\n`;

  feedback += `**Code Quality:**\n`;
  feedback += `- Use meaningful variable and function names\n`;
  feedback += `- Write clean, readable code\n`;
  feedback += `- Handle edge cases and errors\n`;
  feedback += `- Comment complex logic when necessary\n\n`;

  feedback += `**Technical Skills:**\n`;
  feedback += `- Know your data structures and when to use them\n`;
  feedback += `- Understand time and space complexity\n`;
  feedback += `- Practice common algorithm patterns\n`;
  feedback += `- Be comfortable with your chosen language\n\n`;

  feedback += `### Next Steps\n`;
  feedback += `1. Review your solution and identify areas for improvement\n`;
  feedback += `2. Practice similar problems to build pattern recognition\n`;
  feedback += `3. Study solutions from others to learn new approaches\n`;
  feedback += `4. Do more mock interviews to build confidence\n`;
  feedback += `5. Focus on explaining your thinking clearly\n\n`;

  feedback += `**Overall Assessment:** Keep practicing! The more interviews you do, the better you'll get.\n\n`;
  feedback += `💡 **Tip:** Configure OpenAI API key for detailed, personalized AI-powered interview feedback.`;

  return feedback;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, question, code, evaluation, timeSpent } = body;

    if (!question || !code) {
      return NextResponse.json({
        error: "question and code required for feedback"
      }, { status: 400 });
    }

    let feedback = "";

    // Try OpenAI API if key is configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;
        const timeStr = `${minutes} minutes and ${seconds} seconds`;

        const system = `You are an experienced technical interviewer providing end-of-interview feedback.
Review the candidate's entire interview performance and provide comprehensive feedback on:

1. **Overall Performance** - Summary of how they did (0-10 score)
2. **Problem Solving Approach** - How they approached the problem
3. **Code Quality** - Quality of their implementation
4. **Communication** - How well they explained their thinking
5. **Technical Skills** - Depth of technical knowledge demonstrated
6. **Time Management** - How they used their time
7. **Strengths** - What they did well
8. **Areas for Improvement** - Specific areas to work on
9. **Interview Skills** - Tips for better interview performance
10. **Next Steps** - Actionable recommendations for improvement

Be constructive, encouraging, and specific. Provide actionable advice.
Format your response with clear sections using markdown.`;

        const userPrompt = `Please provide comprehensive end-of-interview feedback for this coding interview:

**Company Target:** ${company || "Not specified"}
**Time Spent:** ${timeStr}

**Interview Question:**
${question}

**Candidate's Code:**
${code}

${evaluation ? `**Previous Evaluation:**\n${evaluation}` : ""}

Please provide detailed feedback on their overall interview performance, highlighting both strengths and areas for improvement.`;

        const response = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.6,
        });

        feedback = response.choices[0]?.message?.content ?? "";
      } catch (apiError) {
        console.error("OpenAI API failed, using fallback:", apiError);
      }
    } else {
      console.log("OpenAI API key not configured, using fallback feedback");
    }

    // Use fallback if OpenAI didn't return feedback
    if (!feedback) {
      feedback = generateFallbackFeedback(company, question, code, evaluation, timeSpent);
    }

    return NextResponse.json({ feedback });
  } catch (e: any) {
    console.error("Interview feedback error:", e);
    return NextResponse.json({
      error: e?.message ?? "server error"
    }, { status: 500 });
  }
}
