"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
    User,
    JobResult,
    ApiResponse,
    UploadResumeResponse,
    ParsedResume,
} from "@/types";

export default function FindJobsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<User | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState<JobResult[]>([]);
    const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
    const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
    const [dragActive, setDragActive] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

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
            setFile(e.target.files[0]);
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
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleUploadResume = async () => {
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
        setJobs([]);
        setParsedResume(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const formData = new FormData();
            formData.append("resume", file);
            formData.append("userId", user._id);

            const res = await axios.post<ApiResponse<UploadResumeResponse>>(
                `${API_URL}/jobs/uploadresume`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (res.data.success && res.data.data) {
                setJobs(res.data.data.jobs);
                setParsedResume(res.data.data.parsedResume);
                toast.success(
                    `Found ${res.data.data.jobs.length} jobs matching your profile!`
                );
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to process resume. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleShortlist = async (job: JobResult) => {
        if (!user) {
            toast.error("Please login first");
            return;
        }

        const jobKey = `${job.jobTitle}-${job.companyName}`;
        if (shortlistedIds.has(jobKey)) {
            toast("Job already shortlisted", { icon: "ℹ️" });
            return;
        }

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.post<ApiResponse>(`${API_URL}/jobs/shortlist`, {
                userId: user._id,
                jobTitle: job.jobTitle,
                companyName: job.companyName,
                companyImage: job.companyImage,
                applicationUrl: job.applicationUrl,
            });

            if (res.data.success) {
                setShortlistedIds(new Set(shortlistedIds).add(jobKey));
                toast.success("Job shortlisted successfully!");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to shortlist job");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("jobfinder_user");
        setUser(null);
        setShowDropdown(false);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
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
                            <h1 className="text-xl font-bold text-slate-800">
                                Ascend AI
                            </h1>
                        </div>
                    </div>

                    {/* ─── Center Nav Links ─── */}
                    <div className="hidden md:flex items-center gap-1">
                        <button
                            onClick={() => router.push("/find-jobs")}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg transition-colors"
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
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            Question Bank
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-sm font-bold">
                                        {getInitials(user.name)}
                                    </div>
                                    <span className="hidden sm:block text-sm font-semibold text-slate-700">
                                        {user.name}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-slide-down">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-sm font-semibold text-slate-800">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-slate-400">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                router.push("/shortlisted");
                                                setShowDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                            Shortlisted Jobs
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => router.push("/signup")}
                                    className="btn-cta text-sm px-5 py-2.5"
                                >
                                    Register
                                </button>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="btn-outline text-sm px-5 py-2.5"
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* ─── Upload Section ─── */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10 animate-fade-in-up">
                        <h1 className="text-4xl font-bold text-slate-800 mb-3">
                            Find Jobs That Match <span className="text-blue-600">Your Skills</span>
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Upload your resume and let AI discover the perfect opportunities
                            for you
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
                            accept=".pdf,.png,.jpg,.jpeg"
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
                                        onClick={handleUploadResume}
                                        disabled={loading}
                                        className="btn-cta px-8 py-3 text-sm disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Scanning Resume...
                                            </div>
                                        ) : (
                                            "Scan & Find Jobs"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-blue-100 flex items-center justify-center">
                                    <svg
                                        className="w-10 h-10 text-blue-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                </div>
                                <p className="text-lg font-semibold text-slate-700 mb-1">
                                    Drag & drop your resume here
                                </p>
                                <p className="text-sm text-slate-400 mb-6">
                                    or click below to browse — Supports PDF, PNG, JPG
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
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 rounded-2xl">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm font-medium text-blue-700">
                                    AI is scanning your resume and finding matching jobs...
                                </span>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-slate-100 p-6"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-xl shimmer" />
                                        <div className="flex-1">
                                            <div className="h-4 w-3/4 rounded shimmer mb-2" />
                                            <div className="h-3 w-1/2 rounded shimmer" />
                                        </div>
                                    </div>
                                    <div className="h-3 w-full rounded shimmer mb-2" />
                                    <div className="h-3 w-2/3 rounded shimmer mb-6" />
                                    <div className="flex gap-3">
                                        <div className="h-9 flex-1 rounded-xl shimmer" />
                                        <div className="h-9 flex-1 rounded-xl shimmer" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ─── Parsed Resume Summary ─── */}
            {/* {parsedResume && !loading && (
                <section className="py-6 px-6 animate-fade-in-up">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                                AI Analysis of Your Resume
                            </h3>
                            {parsedResume.summary && (
                                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                                    {parsedResume.summary}
                                </p>
                            )}
                            {parsedResume.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {parsedResume.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-white text-xs font-medium text-blue-700 rounded-full border border-blue-200"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )} */}

            {/* ─── Job Results ─── */}
            {jobs.length > 0 && !loading && (
                <section className="py-10 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col items-center justify-center mb-12 text-center">
                            <h2 className="text-3xl font-bold text-slate-800">
                                Matching Jobs
                            </h2>
                            <p className="text-slate-500 mt-2">
                                {jobs.length} jobs found based on your resume
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                            {jobs.map((job, index) => {
                                const jobKey = `${job.jobTitle}-${job.companyName}`;
                                const isShortlisted = shortlistedIds.has(jobKey);

                                return (
                                    <div
                                        key={index}
                                        className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                                                {job.companyImage &&
                                                    !job.companyImage.includes("placeholder") ? (
                                                    <img
                                                        src={job.companyImage}
                                                        alt={job.companyName}
                                                        className="w-full h-full object-contain p-1"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "";
                                                            (
                                                                e.target as HTMLImageElement
                                                            ).parentElement!.innerHTML = `<span class="text-xl font-bold text-slate-400">${job.companyName[0]}</span>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-xl font-bold text-slate-400">
                                                        {job.companyName[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-1 line-clamp-2">
                                                    {job.jobTitle}
                                                </h3>
                                                <p className="text-xs text-slate-400">
                                                    {job.companyName}
                                                </p>
                                            </div>
                                        </div>

                                        {job.location && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                                                <svg
                                                    className="w-3.5 h-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                                {job.location}
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleShortlist(job)}
                                                disabled={isShortlisted}
                                                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${isShortlisted
                                                    ? "bg-green-50 text-green-600 border border-green-200"
                                                    : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                                                    }`}
                                            >
                                                {isShortlisted ? (
                                                    <span className="flex items-center justify-center gap-1">
                                                        <svg
                                                            className="w-3.5 h-3.5"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Shortlisted
                                                    </span>
                                                ) : (
                                                    "Shortlist"
                                                )}
                                            </button>
                                            <a
                                                href={job.applicationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 btn-cta py-2.5 text-xs text-center rounded-xl"
                                            >
                                                Apply Now
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
