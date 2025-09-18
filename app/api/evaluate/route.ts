import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { question, code } = await req.json();
    if (!question || !code) {
      return NextResponse.json({ error: "question and code required" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are a strict but helpful interview evaluator.
Evaluate the candidate's solution for correctness, complexity, edge cases, and code quality.
If it's a design question, evaluate architecture, tradeoffs, and scalability.
Give actionable feedback and a brief summary score (0-10) at the end.`;

    const resp = await client.responses.create({
      model: "gpt-5",
      input: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "input_text", text: `Question:\n${question}\n\nCandidate code/answer:\n${code}` },
          ],
        },
      ],
    });

    const evaluation = resp.output_text ?? "No evaluation returned.";
    return NextResponse.json({ evaluation });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
