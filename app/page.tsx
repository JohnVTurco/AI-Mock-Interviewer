"use client";

import { useEffect, useRef, useState } from "react";

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const COMPANIES = [
  "Google", "Meta", "Amazon", "Apple", "Microsoft",
  "Netflix", "Tesla", "Uber", "Airbnb", "Stripe"
];

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

export default function Home() {
  const [company, setCompany] = useState("");
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [minutes, setMinutes] = useState(45);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [running, setRunning] = useState(false);

  const [question, setQuestion] = useState("");
  const [code, setCode] = useState("// Write your solution here...");
  const [evaluation, setEvaluation] = useState("");

  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);

  const timerRef = useRef(null);
  const menuRef = useRef(null);
  const editorRef = useRef(null);
  const aceEditorRef = useRef(null);

  // Load Ace Editor
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.23.4/ace.js";
    script.async = true;
    script.onload = () => {
      if (editorRef.current && window.ace) {
        const editor = window.ace.edit(editorRef.current);
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode(`ace/mode/${language}`);
        editor.setOptions({
          fontSize: "14px",
          showPrintMargin: false,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
        });
        editor.setValue(code, -1);
        editor.on("change", () => {
          setCode(editor.getValue());
        });
        aceEditorRef.current = editor;
      }
    };
    document.body.appendChild(script);

    return () => {
      if (aceEditorRef.current) {
        aceEditorRef.current.destroy();
      }
    };
  }, []);

  // Update language mode
  useEffect(() => {
    if (aceEditorRef.current) {
      aceEditorRef.current.session.setMode(`ace/mode/${language}`);
    }
  }, [language]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (timeLeft === 0) setRunning(false);
  }, [timeLeft]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowCompanyMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetTimer = (mins) => {
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
    } catch (e) {
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
    } catch (e) {
      setEvaluation(`Error: ${e?.message ?? e}`);
    } finally {
      setLoadingEval(false);
    }
  };

  useEffect(() => {
    if (!running && timeLeft === Math.max(1, minutes) * 60) {
      setTimeLeft(Math.max(1, minutes) * 60);
    }
  }, [minutes]);

  const timePercentage = (timeLeft / (minutes * 60)) * 100;
  const isLowTime = timeLeft < 300 && timeLeft > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to KevinLiu.AI
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Company Selector */}
            <div className="relative flex-1 min-w-[200px]" ref={menuRef}>
              <button
                onClick={() => setShowCompanyMenu(!showCompanyMenu)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-indigo-400 transition-colors flex items-center justify-between"
              >
                <span className={company ? "text-gray-900" : "text-gray-400"}>
                  {company || "Select Company"}
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCompanyMenu && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-20">
                  {COMPANIES.map((comp) => (
                    <button
                      key={comp}
                      onClick={() => {
                        setCompany(comp);
                        setShowCompanyMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <input
                type="number"
                min={5}
                max={180}
                className="w-20 px-3 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-400 focus:outline-none"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value || 45))}
                title="Duration (minutes)"
              />
              <span className="text-sm text-gray-600">min</span>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loadingQ || !company.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {loadingQ ? "Generating..." : "Generate Question"}
            </button>
          </div>
        </div>

        {/* Editor and Right Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h2 className="font-semibold text-gray-900">Code Editor</h2>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:border-indigo-400 focus:outline-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div
              ref={editorRef}
              className="w-full h-[550px] border border-gray-300 rounded-lg overflow-hidden"
            />
          </div>

          {/* Right Column: Question, Evaluation, and Timer */}
          <div className="space-y-4">
            {/* Interview Question */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Interview Question
              </h2>
              <div className="h-[120px] overflow-y-auto p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                {question ? (
                  <div className="text-gray-800 whitespace-pre-wrap">{question}</div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-center text-sm">
                      Generate a question to get started
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Evaluation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                AI Evaluation
              </h2>
              <div className="h-[125px] overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg border border-gray-200">
                {evaluation ? (
                  <div className="text-gray-800 whitespace-pre-wrap text-sm">{evaluation}</div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 text-center text-sm">
                      Your evaluation will appear here after you submit your solution
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timer and Evaluate Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
              {/* Timer Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Time Remaining</span>
                  <span className={`text-2xl font-bold font-mono ${isLowTime ? 'text-orange-600' : 'text-indigo-600'}`}>
                    {fmt(timeLeft)}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      isLowTime ? 'bg-orange-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${timePercentage}%` }}
                  />
                </div>

                {/* Timer Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setRunning(true)}
                    disabled={running}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Start
                  </button>
                  <button
                    onClick={() => setRunning(false)}
                    disabled={!running}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                    Pause
                  </button>
                  <button
                    onClick={() => resetTimer(minutes)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>

              {/* Evaluate Button */}
              <button
                onClick={handleEvaluate}
                disabled={loadingEval || !question.trim() || !code.trim()}
                className="w-full px-6 py-4 bg-purple-600  text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg text-lg"
              >
                {loadingEval ? "Evaluating..." : "✨ Evaluate Solution"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}