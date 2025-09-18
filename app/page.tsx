"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@/components/Editor";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Home() {
  const [company, setCompany] = useState("");
  const [minutes, setMinutes] = useState<number>(45);
  const [timeLeft, setTimeLeft] = useState<number>(45 * 60);
  const [running, setRunning] = useState(false);

  const [question, setQuestion] = useState("");
  const [code, setCode] = useState("");
  const [evaluation, setEvaluation] = useState("");

  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [running]);

  useEffect(() => {
    if (timeLeft === 0) setRunning(false);
  }, [timeLeft]);

  const resetTimer = (mins: number) => {
    setRunning(false);
    setTimeLeft(Math.max(1, mins) * 60);
  };

  const handleGenerate = async () => {
    if (!company.trim()) return;
    setEvaluation("");
    setQuestion("");
    setLoadingQ(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setQuestion(data.question);
      resetTimer(minutes);
      setRunning(true);
    } catch (e: any) {
      setQuestion(`Error: ${e?.message ?? e}`);
    } finally {
      setLoadingQ(false);
    }
  };

  const handleEvaluate = async () => {
    if (!question.trim() || !code.trim()) return;
    setLoadingEval(true);
    setEvaluation("");
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate");
      setEvaluation(data.evaluation);
    } catch (e: any) {
      setEvaluation(`Error: ${e?.message ?? e}`);
    } finally {
      setLoadingEval(false);
    }
  };

  useEffect(() => {
    if (!running) setTimeLeft(Math.max(1, minutes) * 60);
  }, [minutes, running]);

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Assistant</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Editor value={code} onChange={setCode} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="font-semibold">Assistant</div>

          <div className="flex items-center gap-2">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Which company? e.g., Apple"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              type="number"
              min={5}
              max={180}
              className="w-28 border rounded px-2 py-1"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value || 45))}
              title="Duration (minutes)"
            />
            <button
              onClick={handleGenerate}
              disabled={loadingQ || !company.trim()}
              className="px-3 py-1 rounded bg-black text-white disabled:opacity-50"
            >
              {loadingQ ? "Asking…" : "Generate Question"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Time Left:</span>
            <span className="font-mono">{fmt(timeLeft)}</span>
            <button className="px-2 py-1 border rounded" onClick={() => setRunning(true)}>Start</button>
            <button className="px-2 py-1 border rounded" onClick={() => setRunning(false)}>Pause</button>
            <button className="px-2 py-1 border rounded" onClick={() => resetTimer(minutes)}>Reset</button>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">Question:</div>
            <div className="border rounded p-2 min-h-[120px] whitespace-pre-wrap">
              {question || <span className="text-gray-400">No question yet.</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEvaluate}
              disabled={loadingEval || !question.trim() || !code.trim()}
              className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50"
            >
              {loadingEval ? "Evaluating…" : "Evaluate Solution"}
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">Evaluation:</div>
            <div className="border rounded p-2 min-h-[160px] whitespace-pre-wrap">
              {evaluation || <span className="text-gray-400">No evaluation yet.</span>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
