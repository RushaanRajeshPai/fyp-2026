"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "@/types";

export default function HomePage() {
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

      <section className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-20 right-0 w-96 h-96 opacity-10">
          <div className="w-full h-full relative">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-blue-600"
                style={{
                  width: "4px",
                  height: `${60 + i * 20}px`,
                  right: `${i * 16}px`,
                  top: `${i * 12}px`,
                  transform: "rotate(-30deg)",
                }}
              />
            ))}
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-60" />

        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-32 items-center">
            {/* Left Side — Text & CTA */}
            <div className="animate-fade-in-up">
              <p className="inline-block text-xs sm:text-sm font-semibold text-blue-600 border border-blue-600 rounded-full px-4 py-1.5 tracking-wide uppercase mb-4">
                AI-Powered Job Search
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-5xl font-bold leading-tight text-slate-800 mb-4">
                Find jobs tailored to your <span className="text-blue-600">Resume</span>
              </h2>
              <p className="text-base sm:text-lg text-slate-500 max-w-lg mb-4 leading-relaxed">
                Upload your resume and let our AI match you with the perfect
                opportunities across LinkedIn and top job platforms.
              </p>

              <button
                onClick={() => router.push("/find-jobs")}
                className="btn-cta px-10 py-4 text-base animate-pulse-glow mb-4"
              >
                Find Jobs
              </button>

              <div className="flex items-center gap-6 text-sm text-slate-400 mt-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  AI Resume Scanner
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Multi-Platform Search
                </div>
              </div>
            </div>

            {/* Right Side — Image */}
            <div className="hidden lg:flex justify-center items-center animate-fade-in">
              <div className="relative w-full max-w-xl">
                <Image
                  src="/landing.jpeg"
                  alt="Find your dream job with Ascend AI"
                  width={600}
                  height={500}
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
