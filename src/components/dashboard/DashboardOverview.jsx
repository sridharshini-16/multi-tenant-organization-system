"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

const actionColors = {
  created: "bg-green-500/20 text-green-400 border-green-500/30",
  updated: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  deleted: "bg-red-500/20 text-red-400 border-red-500/30",
  assigned: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  status_changed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const statCards = [
  { key: "tasks", label: "Total Tasks", icon: "✅", color: "from-indigo-500 to-purple-600" },
  { key: "events", label: "Events", icon: "📅", color: "from-sky-500 to-blue-600" },
  { key: "members", label: "Members", icon: "👥", color: "from-emerald-500 to-teal-600" },
  { key: "complaints", label: "Complaints", icon: "📬", color: "from-orange-500 to-red-600" },
];

export default function DashboardOverview({ user }) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setActivity(d.recentActivity || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const roleMessages = {
    organization: "Manage your entire organization from here.",
    admin: "Manage tasks and coordinate your team.",
    member: "View your assignments and stay updated.",
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Dashboard Overview
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{roleMessages[user.role]}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ key, label, icon, color }) => (
          <div key={key} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg`}
              >
                {icon}
              </div>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                {key}
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              ) : (
                stats?.[key] ?? 0
              )}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-900 dark:text-white font-bold text-lg">Recent Activity</h3>
          <span className="text-slate-500 text-xs">Last 10 actions</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">No activity yet</p>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
              Task actions will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors"
              >
                <span
                  className={`badge border ${actionColors[item.action] || "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30"} flex-shrink-0 mt-0.5`}
                >
                  {item.action.replace("_", " ")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 dark:text-slate-300 text-sm">
                    <span className="text-slate-900 dark:text-white font-medium">
                      {item.userName || "Unknown"}
                    </span>{" "}
                    {item.action === "status_changed" && item.fieldChanged
                      ? `changed ${item.fieldChanged} from "${item.oldValue}" to "${item.newValue}"`
                      : item.action === "created"
                        ? `created a new task`
                        : item.action === "assigned"
                          ? `assigned a task`
                          : `updated a task`}
                  </p>
                </div>
                <span className="text-slate-600 dark:text-slate-400 text-xs flex-shrink-0">
                  {format(new Date(item.createdAt), "MMM d, HH:mm")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Info Banner */}
      <div className="mt-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-start gap-4">
        <div className="text-2xl">
          {user.role === "organization" ? "🏢" : user.role === "admin" ? "🛡️" : "👤"}
        </div>
        <div>
          <p className="text-slate-900 dark:text-white font-semibold text-sm">
            You&apos;re signed in as{" "}
            <span className="text-indigo-400 capitalize">{user.role}</span>
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
            {user.role === "organization"
              ? "You have full access to manage tasks, events, members, and view complaints."
              : user.role === "admin"
                ? "You can manage tasks, organize events, and view team members."
                : "You can view your assigned tasks, upcoming events, and submit complaints."}
          </p>
        </div>
      </div>
    </div>
  );
}
