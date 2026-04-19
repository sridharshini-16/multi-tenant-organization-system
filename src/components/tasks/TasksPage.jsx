"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import TaskModal from "./TaskModal";

const statusConfig = {
  todo: { label: "To Do", color: "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30" },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  done: { label: "Done", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/20" },
  medium: { label: "Medium", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-400 border-orange-500/20" },
  urgent: { label: "Urgent", color: "bg-red-500/20 text-red-400 border-red-500/20" },
};

export default function TasksPage({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const canManage = user.role !== "member";

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setDeleteId(null);
    } catch {}
  };

  const filtered = tasks.filter((t) => {
    const matchesFilter = filter === "all" || t.status === filter;
    const matchesSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {user.role === "member" ? "My Tasks" : "Task Management"}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {user.role === "member"
              ? "View your assigned and created tasks"
              : "Create, assign, and manage organization tasks"}
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditTask(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-48">
          <input
            type="text"
            className="input-field text-sm"
            placeholder="🔍 Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "todo", "in_progress", "done", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === s
                  ? "bg-indigo-500/20 border border-indigo-500/50 text-slate-900 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-800/50 border border-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✅</div>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">No tasks found</p>
            <p className="text-slate-500 text-sm mt-1">
              {canManage ? "Create your first task to get started" : "No tasks assigned to you yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/5">
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Task</th>
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Priority</th>
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Created By</th>
                  <th className="text-left px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Due Date</th>
                  {canManage && (
                    <th className="text-right px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <tr key={task.id} className="table-row">
                    <td className="px-5 py-4">
                      <div className="text-slate-900 dark:text-white font-medium text-sm">{task.title}</div>
                      {task.description && (
                        <div className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge border ${statusConfig[task.status].color}`}>
                        {statusConfig[task.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge border ${priorityConfig[task.priority].color}`}>
                        {priorityConfig[task.priority].label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-700 dark:text-slate-300 text-sm">
                        {task.createdByName || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-600 dark:text-slate-400 text-sm">
                        {task.dueDate
                          ? format(new Date(task.dueDate), "MMM d, yyyy")
                          : "—"}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditTask(task);
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white hover:bg-indigo-500/20 transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {(user.role === "organization" || task.createdById === user.userId) && (
                            <button
                              onClick={() => setDeleteId(task.id)}
                              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchTasks();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Delete Task?</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              This action cannot be undone. The task and all its history will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-secondary flex-1 py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg font-semibold transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
