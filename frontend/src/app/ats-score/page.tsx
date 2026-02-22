"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import {
    User,
    ApiResponse,
    ATSScoreResponse,
} from "@/types";
import {
    FileText,
    CheckCircle2,
    AlertTriangle,
    TrendingUp,
    Award,
    Sparkles,
    Tag,
    LayoutList,
    XCircle,
} from "lucide-react";

export default function ATSScorePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<User | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ATSScoreResponse | null>(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("jobfinder_user");
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    const handleUploadClick = () => {
        if (!user) {
            toast.error("Please login first to upload your resume");
            router.push("/login");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== "application/pdf") {
                toast.error("Only PDF files are allowed");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (!user) {
            toast.error("Please login first to upload your resume");
            router.push("/login");
            return;
        }

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type !== "application/pdf") {
                toast.error("Only PDF files are allowed");
                return;
            }
            setFile(droppedFile);
        }
    };

    const handleAnalyze = async () => {
        if (!user) {
            toast.error("Please login first to upload your resume");
            router.push("/login");
            return;
        }

        if (!file) {
            toast.error("Please select a resume file");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const formData = new FormData();
            formData.append("resume", file);

            const res = await axios.post<ApiResponse<ATSScoreResponse>>(
                `${API_URL}/ats-score/analyze`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (res.data.success && res.data.data) {
                setResult(res.data.data);
                toast.success("ATS analysis complete!");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to analyze resume. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-blue-600";
        if (score >= 40) return "text-amber-500";
        return "text-rose-500";
    };

    const getScoreGradient = (score: number) => {
        if (score >= 80) return "from-green-500 to-emerald-400";
        if (score >= 60) return "from-blue-500 to-cyan-400";
        if (score >= 40) return "from-amber-500 to-yellow-400";
        return "from-rose-500 to-pink-400";
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Needs Work";
        return "Poor";
    };

    const getScoreRingColor = (score: number) => {
        if (score >= 80) return "#22c55e";
        if (score >= 60) return "#3b82f6";
        if (score >= 40) return "#f59e0b";
        return "#f43f5e";
    };

    const sectionLabels: Record<string, string> = {
        contentSections: "Content Sections",
        grammarLanguage: "Grammar & Language",
        formattingStructure: "Formatting & Structure",
        atsOptimization: "ATS Optimization",
        pageLength: "Page Length",
        linksContactInfo: "Links & Contact",
    };

    const sectionMaxScores: Record<string, number> = {
        contentSections: 30,
        grammarLanguage: 15,
        formattingStructure: 25,
        atsOptimization: 15,
        pageLength: 5,
        linksContactInfo: 10,
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar activePage="ats-score" />

            {/* ─── Upload Section ─── */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10 animate-fade-in-up">
                        <h1 className="text-4xl font-bold text-slate-800 mb-3">
                            Check Your <span className="text-blue-600">ATS Score</span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Upload your resume and get an instant ATS compatibility analysis with actionable feedback
                        </p>
                    </div>

                    <div
                        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 animate-fade-in-up ${dragActive
                            ? "border-blue-500 bg-blue-50"
                            : file
                                ? "border-green-400 bg-green-50"
                                : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf"
                            className="hidden"
                        />

                        {file ? (
                            <div className="animate-fade-in">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 flex items-center justify-center">
                                    <svg
                                        className="w-8 h-8 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-slate-700 mb-1">
                                    {file.name}
                                </p>
                                <p className="text-sm text-slate-400 mb-6">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <div className="flex items-center justify-center gap-4">
                                    <button
                                        onClick={handleUploadClick}
                                        className="btn-outline text-sm px-5 py-2.5"
                                    >
                                        Change File
                                    </button>
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={loading}
                                        className="btn-cta px-8 py-3 text-sm disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Analyzing Resume...
                                            </div>
                                        ) : (
                                            "Analyze ATS Score"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-blue-100 flex items-center justify-center">
                                    <FileText className="w-10 h-10 text-blue-500" />
                                </div>
                                <p className="text-lg font-semibold text-slate-700 mb-1">
                                    Drag & drop your resume here
                                </p>
                                <p className="text-sm text-slate-400 mb-6">
                                    or click below to browse — PDF format only
                                </p>
                                <button
                                    onClick={handleUploadClick}
                                    className="btn-cta px-8 py-3 text-sm"
                                >
                                    Browse Files
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── Loading State ─── */}
            {loading && (
                <section className="py-12 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-2xl">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-medium text-blue-700">
                                    AI is analyzing your resume for ATS compatibility...
                                </span>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="rounded-2xl border border-slate-100 p-6">
                                    <div className="h-4 w-1/3 rounded shimmer mb-4" />
                                    <div className="h-3 w-full rounded shimmer mb-2" />
                                    <div className="h-3 w-2/3 rounded shimmer mb-4" />
                                    <div className="h-8 w-1/4 rounded shimmer" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ─── Results Section ─── */}
            {result && !loading && (
                <section className="py-10 px-6 animate-fade-in-up">
                    <div className="max-w-5xl mx-auto">

                        {/* ─── Score Hero ─── */}
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 mb-10 overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-rose-500/10 to-amber-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                {/* Score Ring */}
                                <div className="relative flex-shrink-0">
                                    <svg className="w-44 h-44" viewBox="0 0 120 120">
                                        {/* Background circle */}
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="52"
                                            fill="none"
                                            stroke="rgba(255,255,255,0.1)"
                                            strokeWidth="8"
                                        />
                                        {/* Score arc */}
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="52"
                                            fill="none"
                                            stroke={getScoreRingColor(result.overallScore)}
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(result.overallScore / 100) * 326.7} 326.7`}
                                            transform="rotate(-90 60 60)"
                                            style={{
                                                transition: "stroke-dasharray 1.5s ease-out",
                                                filter: `drop-shadow(0 0 8px ${getScoreRingColor(result.overallScore)}40)`,
                                            }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className={`text-4xl font-bold ${getScoreColor(result.overallScore).replace('text-', 'text-')}`} style={{ color: getScoreRingColor(result.overallScore) }}>
                                            {result.overallScore}
                                        </span>
                                        <span className="text-slate-400 text-sm font-medium">out of 100</span>
                                    </div>
                                </div>

                                {/* Score Details */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getScoreGradient(result.overallScore)} text-white`}>
                                            <Award className="w-3.5 h-3.5" />
                                            {getScoreLabel(result.overallScore)}
                                        </span>
                                        {result.pageCount > 1 && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
                                                <FileText className="w-3 h-3" />
                                                {result.pageCount} pages
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-3">ATS Compatibility Score</h2>
                                    <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                                        {result.summary}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ─── Section Scores ─── */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Score Breakdown
                            </h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(result.sectionScores).map(([key, score]) => {
                                    const max = sectionMaxScores[key] || 10;
                                    const pct = Math.round((score / max) * 100);
                                    return (
                                        <div
                                            key={key}
                                            className="group bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {sectionLabels[key] || key}
                                                </span>
                                                <span className={`text-sm font-bold ${getScoreColor(pct)}`}>
                                                    {score}/{max}
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(pct)} transition-all duration-1000`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ─── Done Right & Improvements ─── */}
                        <div className="grid md:grid-cols-2 gap-6 mb-10">
                            {/* What You've Done Right */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 sm:p-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    What You&apos;ve Done Right
                                </h3>
                                <div className="space-y-3">
                                    {result.doneRight.map((item, index) => (
                                        <div key={index} className="flex items-start gap-3 bg-white/70 rounded-xl p-3.5">
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Improvements Needed */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 sm:p-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    Improvements Needed
                                </h3>
                                <div className="space-y-3">
                                    {result.improvements.map((item, index) => (
                                        <div key={index} className="flex items-start gap-3 bg-white/70 rounded-xl p-3.5">
                                            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ─── Detected Sections & Missing Sections ─── */}
                        <div className="grid md:grid-cols-2 gap-6 mb-10">
                            {/* Detected Sections */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                    <LayoutList className="w-5 h-5 text-blue-600" />
                                    Detected Sections
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.detectedSections.map((section, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                            {section}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Missing Sections */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                    <XCircle className="w-5 h-5 text-rose-500" />
                                    Missing Sections
                                </h3>
                                {result.missingSections.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {result.missingSections.map((section, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-medium border border-rose-100"
                                            >
                                                <XCircle className="w-3 h-3" />
                                                {section}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="flex items-center gap-2 text-sm text-green-600">
                                        <CheckCircle2 className="w-4 h-4" />
                                        All important sections are present!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ─── Keywords Found ─── */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 mb-10">
                            <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-violet-600" />
                                Keywords Detected
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {result.keywordsFound.map((keyword, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-xs font-medium border border-violet-100 hover:bg-violet-100 transition-colors"
                                    >
                                        {keyword}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ─── Retry Button ─── */}
                        <div className="text-center">
                            <button
                                onClick={() => {
                                    setResult(null);
                                    setFile(null);
                                }}
                                className="btn-cta px-10 py-3.5 text-sm inline-flex items-center gap-2"
                            >
                                Analyze Another Resume
                            </button>
                        </div>

                    </div>
                </section>
            )}
        </div>
    );
}
