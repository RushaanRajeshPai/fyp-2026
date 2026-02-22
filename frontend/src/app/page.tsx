"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Route, HelpCircle, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Navbar activePage="home" />

      <section className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-0 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
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
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 relative z-10 -top-12">
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

              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => router.push("/find-jobs")}
                  className="btn-cta px-10 py-4 text-base animate-pulse-glow"
                >
                  Find Jobs
                </button>
              </div>

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

        {/* ─── White Fade at bottom ─── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none hidden lg:block"
          style={{
            height: "200px",
            background: "linear-gradient(to bottom, rgba(241,245,249,0) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,1) 100%)",
          }}
        />
      </section>

      {/* ─── Features Section ─── */}
      <section className="relative w-full pb-24 bg-white">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          {/* Section Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <p className="inline-block text-xs sm:text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-full px-4 py-1.5 tracking-wide uppercase mb-4">
              Our Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Everything you need to <span className="text-blue-600">land your dream job</span>
            </h2>
            <p className="text-base text-slate-500 max-w-2xl mx-auto">
              From AI-powered job matching to personalized roadmaps and interview prep — we&apos;ve got you covered.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* Feature 1 — Find Jobs */}
            <div className="feature-card group relative bg-white border border-slate-200 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/50 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-5 mx-auto">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Job Finder</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Upload your resume and let AI find the perfect job matches across platforms.
                </p>
                <button
                  onClick={() => router.push("/find-jobs")}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Get Started →
                </button>
              </div>
            </div>

            {/* Feature 2 — Career Roadmap */}
            <div className="feature-card group relative bg-white border border-slate-200 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/50 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-5 mx-auto">
                  <Route className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Career Roadmap</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Get a personalized learning path powered by AI. Know exactly what skills to learn and in what order to grow your career.
                </p>
                <button
                  onClick={() => router.push("/roadmap")}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Get Started →
                </button>
              </div>
            </div>

            {/* Feature 3 — Question Bank */}
            <div className="feature-card group relative bg-white border border-slate-200 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/50 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-5 mx-auto">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Question Bank</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Practice interview questions generated from your resume or job role. Get AI feedback on clarity, structure, and depth.
                </p>
                <button
                  onClick={() => router.push("/question-bank")}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Get Started →
                </button>
              </div>
            </div>

            {/* Feature 4 — ATS Score */}
            <div className="feature-card group relative bg-white border border-slate-200 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/50 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center mb-5 mx-auto">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">ATS Score</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Upload your resume and get an instant ATS compatibility score with detailed feedback on formatting, content, and optimization.
                </p>
                <button
                  onClick={() => router.push("/ats-score")}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Get Started →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
