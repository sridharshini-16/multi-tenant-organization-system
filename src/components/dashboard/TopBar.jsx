"use client";

import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

const roleColors = {
  organization: "from-indigo-500 to-purple-600",
  admin: "from-sky-500 to-blue-600",
  member: "from-purple-500 to-pink-600",
};

export default function TopBar({ user }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const gradient = roleColors[user.role] || "from-indigo-500 to-purple-600";

  return (
    <header className="h-16 bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5 px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-slate-900 dark:text-white font-semibold text-base">
          Welcome back,{" "}
          <span className="gradient-text">{user.name.split(" ")[0]}</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-slate-900 dark:text-white text-sm font-medium">{user.name}</p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">{user.email}</p>
        </div>

        <ThemeToggle />

        <div
          className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-slate-900 dark:text-white font-bold text-sm flex-shrink-0`}
        >
          {initials}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white hover:bg-slate-200 dark:bg-slate-700 transition-all text-sm font-medium"
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
    </header>
  );
}
