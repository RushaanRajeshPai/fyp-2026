"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiResponse, AnalysisResponse } from "@/types";

function PracticeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const question = searchParams.get("q") || "";

    const [userResponse, setUserResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!userResponse.trim()) {
            setError("Please write your response before submitting.");
            return;
        }

        setLoading(true);
        setError("");
        setAnalysis(null);

        try {
            const res = await fetch("http://localhost:5000/api/question-bank/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, response: userResponse }),
            });

            const data: ApiResponse<AnalysisResponse> = await res.json();

            if (data.success && data.data) {
                setAnalysis(data.data);
            } else {
                setError(data.message || "Failed to analyze response.");
            }
        } catch {
            setError("An error occurred while analyzing your response.");
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500", border: "border-emerald-200" };
        if (score >= 5) return { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500", border: "border-amber-200" };
        return { bg: "bg-red-50", text: "text-red-600", bar: "bg-red-500", border: "border-red-200" };
    };

    const getScoreLabel = (score: number) => {
        if (score >= 9) return "Excellent";
        if (score >= 7) return "Good";
        if (score >= 5) return "Average";
        if (score >= 3) return "Below Average";
        return "Needs Improvement";
    };

    return (
        <div className="min-h-screen bg-white">
            {/* ─── Navbar ─── */}
            <nav className="fixed top-4 left-6 right-6 z-50 bg-gray-50 rounded-2xl shadow-sm">
                <div className="px-8 py-3 flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => router.push("/")}
                    >
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Ascend AI</h1>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        <button
                            onClick={() => router.push("/find-jobs")}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            Find Jobs
                        </button>
                        <button
                            onClick={() => router.push("/roadmap")}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            Career Roadmap
                        </button>
                        <button
                            onClick={() => router.push("/question-bank")}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg transition-colors"
                        >
                            Question Bank
                        </button>
                    </div>

                    <div className="w-[120px]"></div>
                </div>
            </nav>

            {/* ─── Main Content ─── */}
            <main className="pt-32 pb-24 px-6 sm:px-12 lg:px-16 max-w-4xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Questions
                </button>

                {/* Question Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 mb-8 animate-fade-in-up">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Interview Question</p>
                            <p className="text-lg font-medium text-slate-800 leading-relaxed">{decodeURIComponent(question)}</p>
                        </div>
                    </div>
                </div>

                {/* Response Input */}
                {!analysis && (
                    <div className="animate-fade-in-up">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">Your Response</label>
                            <textarea
                                value={userResponse}
                                onChange={(e) => setUserResponse(e.target.value)}
                                placeholder="Type your answer here... Be as detailed as you would be in a real interview."
                                rows={8}
                                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-700 text-sm leading-relaxed bg-slate-50 hover:bg-white transition-colors"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                {userResponse.length} characters
                            </p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-blue-500"
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Analyzing Your Response...
                                </span>
                            ) : (
                                "Submit Response"
                            )}
                        </button>
                    </div>
                )}

                {/* ─── Analysis Results ─── */}
                {analysis && (
                    <div className="animate-fade-in-up space-y-6">
                        {/* Scores */}
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Performance Scores
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Clarity */}
                                {[
                                    { label: "Clarity", score: analysis.clarity, icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
                                    { label: "Structure", score: analysis.structure, icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
                                    { label: "Depth", score: analysis.depth, icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
                                ].map((metric) => {
                                    const colors = getScoreColor(metric.score);
                                    return (
                                        <div key={metric.label} className={`${colors.bg} rounded-2xl p-5 border ${colors.border}`}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <svg className={`w-5 h-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
                                                    </svg>
                                                    <span className="text-sm font-semibold text-slate-700">{metric.label}</span>
                                                </div>
                                                <span className={`text-2xl font-bold ${colors.text}`}>{metric.score}/10</span>
                                            </div>
                                            <div className="w-full bg-white rounded-full h-2.5">
                                                <div
                                                    className={`${colors.bar} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                                                    style={{ width: `${metric.score * 10}%` }}
                                                />
                                            </div>
                                            <p className={`text-xs font-medium mt-2 ${colors.text}`}>{getScoreLabel(metric.score)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Response Summary */}
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Your Response Summary
                            </h3>
                            <p className="text-slate-600 leading-relaxed">{analysis.responseSummary}</p>
                        </div>

                        {/* Expected Answer */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-8">
                            <h3 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Expected Answer
                            </h3>
                            <p className="text-emerald-800 leading-relaxed">{analysis.expectedAnswer}</p>
                        </div>

                        {/* Try Again / Back buttons */}
                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={() => {
                                    setAnalysis(null);
                                    setUserResponse("");
                                }}
                                className="flex-1 py-3.5 rounded-xl font-semibold text-sm text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => router.push("/question-bank")}
                                className="flex-1 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                Back to Question Bank
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function PracticePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        }>
            <PracticeContent />
        </Suspense>
    );
}
