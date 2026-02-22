"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

interface NavbarProps {
    activePage?: "home" | "find-jobs" | "roadmap" | "question-bank" | "ats-score";
}

const NAV_LINKS = [
    { label: "Job Finder", href: "/find-jobs", key: "find-jobs" },
    { label: "Career Roadmap", href: "/roadmap", key: "roadmap" },
    { label: "Question Bank", href: "/question-bank", key: "question-bank" },
    { label: "ATS Score", href: "/ats-score", key: "ats-score" },
] as const;

export default function Navbar({ activePage }: NavbarProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("jobfinder_user");
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

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
        <nav className="fixed top-4 left-6 right-6 z-50 bg-gray-50 rounded-2xl shadow-sm">
            <div className="px-8 py-3 flex items-center justify-between">
                {/* ─── Logo ─── */}
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
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.key}
                            onClick={() => router.push(link.href)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activePage === link.key
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                {/* ─── User Section ─── */}
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
    );
}
