"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"></div>;
  }

  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-white/5 dark:border-white/10 shadow-sm relative z-50">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
          theme === "light" 
            ? "bg-white dark:bg-slate-900 text-indigo-500 shadow-sm" 
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white dark:text-white dark:text-slate-400 dark:hover:text-white"
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
          theme === "dark" 
            ? "bg-slate-700 text-indigo-400 shadow-sm" 
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white dark:text-white dark:text-slate-400 dark:hover:text-white"
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
          theme === "system" 
            ? "bg-white dark:bg-slate-900 dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 shadow-sm" 
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white dark:text-white dark:text-slate-400 dark:hover:text-white"
        }`}
        title="System Preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
