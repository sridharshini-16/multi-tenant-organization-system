"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";

export default function MembersPage({ user }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      setMembers(data.members || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleToggleActive = async (member) => {
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      if (res.ok) fetchMembers();
    } catch {}
  };

  const filtered = members.filter((m) =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    (m.department?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const roleColors = {
    admin: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    member: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Members</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            View and manage organization members
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900 dark:text-white">{members.length}</div>
          <div className="text-slate-600 dark:text-slate-400 text-xs">Total Members</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          className="input-field max-w-sm text-sm"
          placeholder="🔍 Search by name, email, department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-slate-900 dark:text-white">{members.length}</div>
          <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">Total</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-sky-400">
            {members.filter((m) => m.role === "admin").length}
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">Admins</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-2xl font-black text-green-400">
            {members.filter((m) => m.isActive).length}
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-xs mt-1">Active</div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">No members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/5">
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Member</th>
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Department</th>
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Joined</th>
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                  {user.role === "organization" && (
                    <th className="text-right px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((member) => {
                  const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr key={member.id} className="table-row cursor-pointer" onClick={() => setSelected(member)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-slate-900 dark:text-white font-bold text-xs flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-slate-900 dark:text-white font-medium text-sm">{member.name}</div>
                            <div className="text-slate-500 text-xs">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge border ${roleColors[member.role] || "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30"}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <div className="text-slate-700 dark:text-slate-300 text-sm">{member.department || "—"}</div>
                          {member.position && <div className="text-slate-500 text-xs">{member.position}</div>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">
                          {format(new Date(member.createdAt), "MMM d, yyyy")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge border ${member.isActive
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "bg-red-500/20 text-red-300 border-red-500/30"
                        }`}>
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {user.role === "organization" && (
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleToggleActive(member)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                                member.isActive
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                  : "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                              }`}
                            >
                              {member.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Member Details</h2>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white">✕</button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-slate-900 dark:text-white font-bold text-lg">
                {selected.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white font-bold text-lg">{selected.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{selected.email}</p>
                <span className={`badge border mt-1 ${roleColors[selected.role] || "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30"}`}>
                  {selected.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Phone", value: selected.phone },
                { label: "Department", value: selected.department },
                { label: "Position", value: selected.position },
                { label: "Joined", value: format(new Date(selected.createdAt), "MMM d, yyyy") },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-100 dark:bg-slate-800/40 rounded-lg p-3">
                  <div className="text-slate-500 text-xs mb-1">{label}</div>
                  <div className="text-slate-900 dark:text-white text-sm font-medium">{value || "—"}</div>
                </div>
              ))}
            </div>

            {selected.bio && (
              <div className="mt-4 bg-slate-100 dark:bg-slate-800/40 rounded-lg p-3">
                <div className="text-slate-500 text-xs mb-1">Bio</div>
                <div className="text-slate-700 dark:text-slate-300 text-sm">{selected.bio}</div>
              </div>
            )}

            <div className="mt-4 bg-slate-100 dark:bg-slate-800/40 rounded-lg p-3">
              <div className="text-slate-500 text-xs mb-1">Status</div>
              <div className={`text-sm font-medium ${selected.isActive ? "text-green-400" : "text-red-400"}`}>
                {selected.isActive ? "✓ Active" : "✕ Inactive"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
