"use client";

import { useState } from "react";
import LoginModal from "./auth/LoginModal";
import RegisterModal from "./auth/RegisterModal";
import ThemeToggle from "./ThemeToggle";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerRole, setRegisterRole] = useState("member");

  const openRegister = (role) => {
    setRegisterRole(role);
    setShowRegister(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white dark:bg-slate-900 shadow-lg">
            <img src="/logo.png" alt="Permify Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-slate-900 dark:text-white font-bold text-xl tracking-tight">
            Permify
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-white transition-colors text-sm font-medium"
          >
            Sign In
          </button>
          <button
            onClick={() => openRegister("member")}
            className="btn-primary text-sm px-5 py-2.5"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Multi-Tenant Task Management Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6">
            Organize Your Team
            <br />
            <span className="gradient-text">Effortlessly</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            A powerful platform for organizations to manage tasks, events, and
            team members — with role-based access control built in.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-3.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl font-bold text-base hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all hover:scale-105 shadow-xl"
            >
              Sign In to Your Account
            </button>
          </div>

          <p className="text-slate-500 text-sm mb-8">
            New here? Join as one of:
          </p>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {/* Organization Card */}
            <button
              onClick={() => openRegister("organization")}
              className="group bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left hover:border-indigo-500/50 transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-slate-900 dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
                Join as Organization
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Create and manage your organization. Control tasks, events,
                members, and view complaints.
              </p>
              <div className="mt-4 flex items-center gap-1 text-indigo-400 text-sm font-medium group-hover:gap-2 transition-all">
                Create Organization
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            {/* Admin Card */}
            <button
              onClick={() => openRegister("admin")}
              className="group bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left hover:border-sky-500/50 transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-slate-900 dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
                Join as Admin
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Manage tasks, assign work, organize events, and oversee team
                members within your organization.
              </p>
              <div className="mt-4 flex items-center gap-1 text-sky-400 text-sm font-medium group-hover:gap-2 transition-all">
                Register as Admin
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            {/* Member Card */}
            <button
              onClick={() => openRegister("member")}
              className="group bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left hover:border-purple-500/50 transition-all hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-slate-900 dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
                Join as Member
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                View assigned tasks and events, submit complaints, and manage
                your personal profile.
              </p>
              <div className="mt-4 flex items-center gap-1 text-purple-400 text-sm font-medium group-hover:gap-2 transition-all">
                Register as Member
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
          {[
            { icon: "🔐", label: "JWT Auth", desc: "Secure token-based auth" },
            { icon: "🏢", label: "Multi-Tenant", desc: "Strict data isolation" },
            { icon: "👥", label: "RBAC", desc: "Role-based permissions" },
            { icon: "📊", label: "Audit Logs", desc: "Full activity history" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-center hover:border-indigo-500/30 transition-all"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="text-slate-900 dark:text-white font-semibold text-sm">{f.label}</div>
              <div className="text-slate-500 text-xs mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
      {showRegister && (
        <RegisterModal
          initialRole={registerRole}
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
}
