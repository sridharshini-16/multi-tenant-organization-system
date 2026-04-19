"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";

const statusConfig = {
  upcoming: { label: "Upcoming", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  ongoing: { label: "Ongoing", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  completed: { label: "Completed", color: "bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-300 border-red-500/30" },
};

export default function EventsPage({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    maxAttendees: "",
    status: "upcoming",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canManage = user.role !== "member";

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openCreate = () => {
    setEditEvent(null);
    setForm({ title: "", description: "", location: "", startDate: "", endDate: "", maxAttendees: "", status: "upcoming" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (event) => {
    setEditEvent(event);
    setForm({
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
      maxAttendees: event.maxAttendees?.toString() || "",
      status: event.status,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate) {
      setError("Title and start date are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : null,
        status: form.status,
      };

      const res = editEvent
        ? await fetch(`/api/events/${editEvent.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save event");
      } else {
        setShowModal(false);
        fetchEvents();
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setDeleteId(null);
    } catch {}
  };

  const filtered = events.filter((e) => filter === "all" || e.status === filter);

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Events</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            {canManage ? "Create and manage organization events" : "View upcoming and past events"}
          </p>
        </div>
        {canManage && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Event
          </button>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6">
        {["all", "upcoming", "ongoing", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
              filter === s
                ? "bg-indigo-500/20 border border-indigo-500/50 text-slate-900 dark:text-white"
                : "bg-slate-100 dark:bg-slate-800/50 border border-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl p-6 h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold">No events found</p>
          <p className="text-slate-500 text-sm mt-1">
            {canManage ? "Create your first event" : "No events scheduled"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <div key={event.id} className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className={`badge border ${statusConfig[event.status].color}`}>
                  {statusConfig[event.status].label}
                </span>
                {canManage && (
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(event)}
                      className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white hover:bg-indigo-500/20 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {(user.role === "organization" || event.createdById === user.userId) && (
                      <button
                        onClick={() => setDeleteId(event.id)}
                        className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <h3 className="text-slate-900 dark:text-white font-bold text-base mb-2">{event.title}</h3>
              {event.description && (
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">{event.description}</p>
              )}

              <div className="space-y-1.5 mt-3">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                  <span>📅</span>
                  <span>{format(new Date(event.startDate), "MMM d, yyyy HH:mm")}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                    <span>📍</span>
                    <span>{event.location}</span>
                  </div>
                )}
                {event.maxAttendees && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                    <span>👥</span>
                    <span>Max {event.maxAttendees} attendees</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <span>👤</span>
                  <span>By {event.createdByName || "Unknown"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editEvent ? "Edit Event" : "New Event"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Event Title *</label>
                <input type="text" className="input-field" placeholder="Annual Meetup" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input-field" rows={3} placeholder="Event details..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Location</label>
                <input type="text" className="input-field" placeholder="Conference Room A / Online" value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date *</label>
                  <input type="datetime-local" className="input-field" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input type="datetime-local" className="input-field" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Max Attendees</label>
                  <input type="number" className="input-field" placeholder="Unlimited" value={form.maxAttendees}
                    onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} min="1" />
                </div>
                {editEvent && (
                  <div>
                    <label className="label">Status</label>
                    <select className="input-field" value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 disabled:opacity-50">
                  {saving ? "Saving..." : editEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Delete Event?</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 py-2.5">Cancel</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg font-semibold transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
