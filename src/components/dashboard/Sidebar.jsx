"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = {
  organization: [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/tasks", label: "Tasks", icon: "✅" },
    { href: "/dashboard/events", label: "Events", icon: "📅" },
    { href: "/dashboard/members", label: "Members", icon: "👥" },
  ],
  admin: [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/tasks", label: "Tasks", icon: "✅" },
    { href: "/dashboard/events", label: "Events", icon: "📅" },
    { href: "/dashboard/members", label: "Members", icon: "👥" },
  ],
  member: [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/tasks", label: "My Tasks", icon: "✅" },
    { href: "/dashboard/events", label: "Events", icon: "📅" },
  ],
};

const roleBadge = {
  organization: { label: "Organization", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  admin: { label: "Admin", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  member: { label: "Member", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
};

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const items = navItems[role];
  const badge = roleBadge[role];

  return (
    <aside className="w-64 bg-white/80 dark:bg-slate-900/80 border-r border-slate-200 dark:border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-900 shadow-md">
            <img src="/logo.png" alt="Permify Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-slate-900 dark:text-white font-bold text-base leading-tight">Permify</div>
            <div className={`text-xs px-2 py-0.5 rounded-full border inline-flex mt-0.5 ${badge.color}`}>
              {badge.label}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-white/5">
        <div className="text-xs text-slate-600 dark:text-slate-400 text-center">
          Permify v1.0 • Secure & Isolated
        </div>
      </div>
    </aside>
  );
}
