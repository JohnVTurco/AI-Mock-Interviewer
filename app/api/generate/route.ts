import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { company } = await req.json();
    if (!company || typeof company !== "string") {
      return NextResponse.json({ error: "company required" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are an AI interviewing assistant.
Generate a single interview question for ${company}.
Randomly choose either:
(1) a LeetCode-style algorithms/data structures problem, or
(2) a systems/design question (high-level design).
Keep it concise: a title and 2–6 lines of details. Do not include the answer.`;

    const resp = await client.responses.create({
      model: "gpt-5",
      input: [
        { role: "system", content: system },
        { role: "user", content: "Generate one question now." },
      ],
    });

    const question = resp.output_text ?? "Failed to generate question.";
    return NextResponse.json({ question });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "server error" }, { status: 500 });
  }
}
