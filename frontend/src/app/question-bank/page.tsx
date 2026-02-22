"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ApiResponse, QuestionsResponse } from "@/types";
import Navbar from "@/components/Navbar";

const JOB_ROLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "DevOps Engineer",
    "Mobile Developer",
    "Flutter Developer",
    "React Developer",
    "Node.js Developer",
    "Python Developer",
    "Java Developer",
];

const EXPERIENCE_LEVELS = ["Fresher", "5+ Years", "10+ Years"];

export default function QuestionBankPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<"resume" | "role">("resume");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobRole, setJobRole] = useState("");
    const [experience, setExperience] = useState("");
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<string[]>([]);
    const [error, setError] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleGenerateFromResume = async () => {
        if (!resumeFile) {
            setError("Please upload your resume.");
            return;
        }

        setLoading(true);
        setError("");
        setQuestions([]);

        const formData = new FormData();
        formData.append("resume", resumeFile);

        try {
            const res = await fetch("http://localhost:5000/api/question-bank/generate-from-resume", {
                method: "POST",
                body: formData,
            });

            const data: ApiResponse<QuestionsResponse> = await res.json();

            if (data.success && data.data) {
                setQuestions(data.data.questions);
            } else {
                setError(data.message || "Failed to generate questions.");
            }
        } catch {
            setError("An error occurred while generating questions.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateFromRole = async () => {
        if (!jobRole) {
            setError("Please select a job role.");
            return;
        }
        if (!experience) {
            setError("Please select experience level.");
            return;
        }

        setLoading(true);
        setError("");
        setQuestions([]);

        try {
            const res = await fetch("http://localhost:5000/api/question-bank/generate-from-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobRole, experience }),
            });

            const data: ApiResponse<QuestionsResponse> = await res.json();

            if (data.success && data.data) {
                setQuestions(data.data.questions);
            } else {
                setError(data.message || "Failed to generate questions.");
            }
        } catch {
            setError("An error occurred while generating questions.");
        } finally {
            setLoading(false);
        }
    };

    const handlePractice = (question: string) => {
        const encoded = encodeURIComponent(question);
        router.push(`/question-bank/practice?q=${encoded}`);
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar activePage="question-bank" />

            {/* ─── Main Content ─── */}
            <main className="pt-32 pb-24 px-6 sm:px-12 lg:px-16 max-w-5xl mx-auto">
                <div className="text-center mb-10 animate-fade-in-up">
                    <h2 className="text-4xl font-bold text-slate-800 mb-3">
                        Practice Interview <span className="text-blue-600">Questions</span>
                    </h2>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Generate personalized interview questions based on your resume or target role and practice answering them.
                    </p>
                </div>

                {/* ─── Tab Selector ─── */}
                {questions.length === 0 && (
                    <div className="max-w-3xl mx-auto animate-fade-in-up">
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                            {/* Tabs */}
                            <div className="flex border-b border-slate-100">
                                <button
                                    onClick={() => { setActiveTab("resume"); setError(""); }}
                                    className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors relative ${activeTab === "resume"
                                        ? "text-blue-600 bg-blue-50/50"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    Resume Based
                                    {activeTab === "resume" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => { setActiveTab("role"); setError(""); }}
                                    className={`flex-1 py-4 px-6 text-sm font-semibold transition-colors relative ${activeTab === "role"
                                        ? "text-blue-600 bg-blue-50/50"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    Role Based
                                    {activeTab === "role" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                    )}
                                </button>
                            </div>

                            <div className="p-8">
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                        {error}
                                    </div>
                                )}

                                {/* Resume Based Tab */}
                                {activeTab === "resume" && (
                                    <div className="space-y-6">
                                        <div
                                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${resumeFile
                                                ? "border-green-400 bg-green-50"
                                                : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
                                                }`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="application/pdf"
                                                className="hidden"
                                            />
                                            {resumeFile ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-sm font-semibold text-green-700">{resumeFile.name}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                                                        className="text-xs text-slate-400 hover:text-red-500 ml-2"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-slate-500">Upload resume</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-orange-400">
                                            Attach file. File size should not exceed 10MB.
                                        </p>
                                        <button
                                            onClick={handleGenerateFromResume}
                                            disabled={loading}
                                            className="btn-cta inline-flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    Generate questions
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {/* Role Based Tab */}
                                {activeTab === "role" && (
                                    <div className="flex items-end gap-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <select
                                                    value={jobRole}
                                                    onChange={(e) => setJobRole(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm appearance-none cursor-pointer"
                                                >
                                                    <option value="">Any Job Role</option>
                                                    {JOB_ROLES.map((role) => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <select
                                                    value={experience}
                                                    onChange={(e) => setExperience(e.target.value)}
                                                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm appearance-none cursor-pointer"
                                                >
                                                    <option value="">Any Experience</option>
                                                    {EXPERIENCE_LEVELS.map((level) => (
                                                        <option key={level} value={level}>{level}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleGenerateFromRole}
                                            disabled={loading}
                                            className="btn-cta inline-flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    Generate questions
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Loading State ─── */}
                {loading && (
                    <div className="mt-12 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-500">AI is generating your personalized questions...</p>
                    </div>
                )}

                {/* ─── Questions List ─── */}
                {questions.length > 0 && !loading && (
                    <div className="mt-12 max-w-3xl mx-auto animate-fade-in-up">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-800">Your Questions</h3>
                                <p className="text-sm text-slate-400 mt-1">Click &quot;Practice&quot; to answer a question and get AI feedback</p>
                            </div>
                            <button
                                onClick={() => setQuestions([])}
                                className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Generate New
                            </button>
                        </div>

                        <div className="space-y-4 stagger-children">
                            {questions.map((question, index) => (
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-700 font-medium leading-relaxed">{question}</p>
                                        </div>
                                        <button
                                            onClick={() => handlePractice(question)}
                                            className="flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            Practice
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
