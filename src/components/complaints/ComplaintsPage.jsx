"use client";

import { useEffect, useState } from "react";
import ComplaintModal from "./ComplaintModal";
import { format } from "date-fns";

export default function ComplaintsPage({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
      const data = await res.json();
      if (res.ok) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getStatusBadge = (status) => {
    const colors = {
      open: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30",
      in_review: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30",
      resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30",
      dismissed: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status]}`}>
        {status.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Complaints & Feedback</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {user.role === "member" 
              ? "Share your feedback, report issues, or post complaints safely." 
              : "Review and respond to complaints submitted by members."}
          </p>
        </div>
        {user.role === "member" && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary whitespace-nowrap flex items-center gap-2"
          >
            Submit Complaint
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                <th className="px-6 py-4">Complaint</th>
                <th className="px-6 py-4">Status</th>
                {user.role !== "member" && <th className="px-6 py-4">Submitted By</th>}
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Target Audience</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading complaints...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{c.title}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md truncate">
                        {c.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(c.status)}
                    </td>
                    {user.role !== "member" && (
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                        {c.submitterName || "Anonymous"}
                        {c.isAnonymous && <span className="ml-2 text-xs text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md">Anonymous</span>}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {format(new Date(c.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-md font-medium border ${
                        c.targetRole === "organization" 
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" 
                          : "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20"
                      }`}>
                        {c.targetRole.toUpperCase() + " LEVEL"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ComplaintModal
          onClose={() => setShowModal(false)}
          onCreated={fetchComplaints}
        />
      )}
    </div>
  );
}
