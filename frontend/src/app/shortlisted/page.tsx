"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { User, ShortlistedJob, ApiResponse } from "@/types";

export default function ShortlistedPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [jobs, setJobs] = useState<ShortlistedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("jobfinder_user");
        if (!stored) {
            toast.error("Please login to view shortlisted jobs");
            router.push("/login");
            return;
        }

        const userData: User = JSON.parse(stored);
        setUser(userData);
        fetchShortlistedJobs(userData._id);
    }, [router]);

    const fetchShortlistedJobs = async (userId: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.get<ApiResponse<ShortlistedJob[]>>(
                `${API_URL}/jobs/shortlisted/${userId}`
            );

            if (res.data.success && res.data.data) {
                setJobs(res.data.data);
            }
        } catch {
            toast.error("Failed to fetch shortlisted jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (jobId: string) => {
        if (!user) return;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.delete<ApiResponse>(
                `${API_URL}/jobs/shortlisted/${jobId}`,
                { data: { userId: user._id } }
            );

            if (res.data.success) {
                setJobs(jobs.filter((j) => j._id !== jobId));
                toast.success("Job removed from shortlist");
            }
        } catch {
            toast.error("Failed to remove job");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("jobfinder_user");
        setUser(null);
        setShowDropdown(false);
        router.push("/");
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
                            <p className="text-[10px] text-slate-400 -mt-0.5">
                                Get your dream job
                            </p>
                        </div>
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

            {/* ─── Content ─── */}
            <section className="pt-28 pb-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 animate-fade-in-up">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            Shortlisted Jobs
                        </h1>
                        <p className="text-slate-400">
                            Jobs you&apos;ve saved for later — apply when you&apos;re ready
                        </p>
                    </div>

                    {loading ? (
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
                                    <div className="flex gap-3 mt-6">
                                        <div className="h-9 flex-1 rounded-xl shimmer" />
                                        <div className="h-9 flex-1 rounded-xl shimmer" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20 animate-fade-in">
                            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-50 flex items-center justify-center">
                                <svg
                                    className="w-12 h-12 text-slate-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-slate-700 mb-2">
                                No shortlisted jobs yet
                            </h2>
                            <p className="text-slate-400 mb-6">
                                Start finding and shortlisting jobs that interest you
                            </p>
                            <button
                                onClick={() => router.push("/find-jobs")}
                                className="btn-cta px-8 py-3"
                            >
                                Find Jobs
                            </button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                            {jobs.map((job) => (
                                <div
                                    key={job._id}
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

                                        <button
                                            onClick={() => handleRemove(job._id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500"
                                            title="Remove from shortlist"
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
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="text-xs text-slate-300 mb-4">
                                        Saved on{" "}
                                        {new Date(job.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </div>

                                    <a
                                        href={job.applicationUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full btn-cta py-2.5 text-xs text-center rounded-xl"
                                    >
                                        Apply Now
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
