"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { ApiResponse, User } from "@/types";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.post<ApiResponse<User>>(
                `${API_URL}/auth/login`,
                formData
            );

            if (res.data.success && res.data.data) {
                localStorage.setItem(
                    "jobfinder_user",
                    JSON.stringify(res.data.data)
                );
                toast.success("Logged in successfully!");
                router.push("/");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white flex items-center justify-center px-4 py-12">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-rose-100 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in-up">
                {/* Logo */}
                <div
                    className="flex items-center gap-3 justify-center mb-8 cursor-pointer"
                    onClick={() => router.push("/")}
                >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <span className="text-2xl font-bold text-slate-800">Job Finder</span>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
                        <p className="text-slate-400 mt-2 text-sm">
                            Login to continue your job search
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="input-field"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-cta py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Logging in...
                                </div>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400">
                            Don&apos;t have an account?{" "}
                            <button
                                onClick={() => router.push("/signup")}
                                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
