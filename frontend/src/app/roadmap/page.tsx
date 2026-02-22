"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoadmapResponse, ApiResponse } from "@/types";
import Navbar from "@/components/Navbar";
import jsPDF from "jspdf";

export default function RoadmapPage() {
    const router = useRouter();
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [timeframe, setTimeframe] = useState("1year");
    const [targetIndustry, setTargetIndustry] = useState("");
    const [additionalGoals, setAdditionalGoals] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!resumeFile) {
            setError("Please upload your resume.");
            return;
        }
        if (!targetIndustry.trim()) {
            setError("Please enter your target industry.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("resume", resumeFile);
        formData.append("timeframe", timeframe);
        formData.append("targetIndustry", targetIndustry);
        formData.append("additionalGoals", additionalGoals);

        try {
            const res = await fetch("http://localhost:5000/api/roadmap/generate", {
                method: "POST",
                body: formData,
            });

            const data: ApiResponse<RoadmapResponse> = await res.json();

            if (data.success && data.data) {
                setRoadmap(data.data);
            } else {
                setError(data.message || "Failed to generate roadmap. Please try again.");
            }
        } catch (err) {
            console.error("Error generating roadmap:", err);
            setError("An error occurred while communicating with the server.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!roadmap) return;

        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - margin * 2;
        let y = 20;

        const addPageIfNeeded = (requiredSpace: number) => {
            if (y + requiredSpace > pdf.internal.pageSize.getHeight() - 20) {
                pdf.addPage();
                y = 20;
            }
        };

        // Title
        pdf.setFontSize(22);
        pdf.setFont("helvetica", "bold");
        pdf.text("Career Roadmap", margin, y);
        y += 10;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100);
        pdf.text(`Timeline: ${timeframe}`, margin, y);
        y += 12;

        // Current & Target Position
        pdf.setTextColor(0);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text("Current Position", margin, y);
        y += 6;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const currentLines = pdf.splitTextToSize(roadmap.currentPosition, contentWidth);
        pdf.text(currentLines, margin, y);
        y += currentLines.length * 5 + 6;

        addPageIfNeeded(20);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(37, 99, 235);
        pdf.text("Target Goal", margin, y);
        y += 6;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(0);
        const targetLines = pdf.splitTextToSize(roadmap.targetPosition, contentWidth);
        pdf.text(targetLines, margin, y);
        y += targetLines.length * 5 + 10;

        // Strategy Overview
        addPageIfNeeded(30);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Strategy Overview", margin, y);
        y += 7;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const overviewLines = pdf.splitTextToSize(roadmap.strategyOverview, contentWidth);
        for (const line of overviewLines) {
            addPageIfNeeded(6);
            pdf.text(line, margin, y);
            y += 5;
        }
        y += 8;

        // 5-Step Action Plan
        addPageIfNeeded(20);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("The 5-Step Action Plan", margin, y);
        y += 8;

        roadmap.steps.forEach((step: string, index: number) => {
            const stepLines = pdf.splitTextToSize(`${index + 1}. ${step}`, contentWidth - 5);
            addPageIfNeeded(stepLines.length * 5 + 6);
            pdf.setFontSize(10);
            pdf.setFont("helvetica", "normal");
            pdf.text(stepLines, margin, y);
            y += stepLines.length * 5 + 4;
        });
        y += 6;

        // Skills to Develop
        addPageIfNeeded(20);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Skills to Develop", margin, y);
        y += 8;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const skillsText = roadmap.skillsToDevelop.join("  •  ");
        const skillLines = pdf.splitTextToSize(skillsText, contentWidth);
        for (const line of skillLines) {
            addPageIfNeeded(6);
            pdf.text(line, margin, y);
            y += 5;
        }
        y += 8;

        // Long Term Vision
        addPageIfNeeded(20);
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Long Term Vision", margin, y);
        y += 7;
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        const visionLines = pdf.splitTextToSize(roadmap.longTermVision, contentWidth);
        for (const line of visionLines) {
            addPageIfNeeded(6);
            pdf.text(line, margin, y);
            y += 5;
        }

        pdf.save("Career_Roadmap.pdf");
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar activePage="roadmap" />

            <main className="pt-32 pb-24 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto relative z-10">
                {!roadmap ? (
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10 animate-fade-in-up">
                            <h2 className="text-4xl font-bold text-slate-800 mb-3">Create Your Career <span className="text-blue-600">Roadmap</span></h2>
                            <p className="text-slate-500 text-lg">Provide your details to get a personalized AI-generated 5-step career plan.</p>
                        </div>

                        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 animate-fade-in-up">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">1. Upload Resume (PDF)</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:border-blue-500 transition-colors bg-slate-50">
                                        <div className="space-y-1 text-center">
                                            <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <div className="flex justify-center text-sm text-slate-600">
                                                <label className="relative cursor-pointer rounded-md bg-transparent font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-slate-500">PDF up to 10MB</p>
                                            {resumeFile && <p className="text-sm font-medium text-green-600 mt-2">Selected: {resumeFile.name}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">2. Timeline</label>
                                        <select
                                            value={timeframe}
                                            onChange={(e) => setTimeframe(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="1mo">1 Month</option>
                                            <option value="3mos">3 Months</option>
                                            <option value="6mos">6 Months</option>
                                            <option value="1year">1 Year</option>
                                            <option value="2yrs">2 Years</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">3. Target Industry / Role</label>
                                        <input
                                            type="text"
                                            value={targetIndustry}
                                            onChange={(e) => setTargetIndustry(e.target.value)}
                                            placeholder="e.g. Fintech Backend Engineer"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">4. Additional Goals & Context</label>
                                    <textarea
                                        value={additionalGoals}
                                        onChange={(e) => setAdditionalGoals(e.target.value)}
                                        placeholder="Any specific companies, skills you prefer, or salary expectations?"
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`btn-cta w-full py-4 text-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing Profile & Generating Roadmap...
                                        </span>
                                    ) : (
                                        "Generate Roadmap"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in-up space-y-8 max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-4xl font-bold text-slate-800 mb-2">Your Career Roadmap</h2>
                                <p className="text-lg text-slate-500">A personalized action plan configured for <span className="font-semibold text-blue-600">{timeframe}</span>.</p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleDownloadPDF}
                                    className="px-6 py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download PDF
                                </button>
                                <button
                                    onClick={() => setRoadmap(null)}
                                    className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors"
                                >
                                    Generate New
                                </button>
                            </div>
                        </div>

                        <div id="roadmap-content" className="space-y-8 bg-white pb-8">
                            {/* Current vs Target */}
                            <div className="grid md:grid-cols-2 gap-6 pt-4 px-4 sm:px-0">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Current Position</h3>
                                    <p className="text-xl font-medium text-slate-800">{roadmap.currentPosition}</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl relative overflow-hidden">
                                    <div className="absolute right-0 top-0 opacity-10">
                                        <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500 transform translate-x-4 -translate-y-4 shadow-lg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider mb-2 relative z-10">Target Goal</h3>
                                    <p className="text-xl font-medium text-blue-900 relative z-10">{roadmap.targetPosition}</p>
                                </div>
                            </div>

                            {/* Overview */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-800 mb-4">Strategy Overview</h3>
                                <p className="text-slate-600 leading-relaxed text-lg">{roadmap.strategyOverview}</p>
                            </div>

                            {/* Steps aligned vertically */}
                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-slate-800 mb-8 pl-4 border-l-4 border-blue-600">The 5-Step Action Plan</h3>
                                <div className="space-y-6">
                                    {roadmap.steps.map((step: string, index: number) => (
                                        <div key={index} className="flex bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                            <div className="flex-shrink-0 mr-6">
                                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <p className="text-lg text-slate-700 font-medium">{step}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Skills */}
                                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        Skills to Develop
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {roadmap.skillsToDevelop.map((skill: string, index: number) => (
                                            <span key={index} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Long Range */}
                                <div className="bg-slate-800 p-8 rounded-3xl shadow-sm text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700 blur-3xl rounded-full opacity-50 -mr-10 -mt-10" />
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10 text-blue-300">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Long Term Vision
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed relative z-10">
                                        {roadmap.longTermVision}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}
