"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterModal({ initialRole, onClose, onSwitchToLogin }) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState(1);
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    organizationId: "",
    phone: "",
    address: "",
    department: "",
    position: "",
    bio: "",
  });

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    if (role !== "organization") {
      fetch("/api/organizations")
        .then((r) => r.json())
        .then((d) => setOrganizations(d.organizations || []))
        .catch(() => {});
    }
  }, [role]);

  const roleConfig = {
    organization: {
      label: "Organization",
      color: "indigo",
      icon: "🏢",
      description: "Create and manage your organization",
    },
    admin: {
      label: "Admin",
      color: "sky",
      icon: "🛡️",
      description: "Manage tasks and team members",
    },
    member: {
      label: "Member",
      color: "purple",
      icon: "👤",
      description: "View tasks and submit feedback",
    },
  };

  const currentConfig = roleConfig[role];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      };

      if (role === "organization") {
        payload.organizationName = form.organizationName;
      } else {
        if (form.organizationId) payload.organizationId = form.organizationId;
        else if (form.organizationName)
          payload.organizationName = form.organizationName;
      }

      if (role === "member") {
        if (form.phone) payload.phone = form.phone;
        if (form.address) payload.address = form.address;
        if (form.department) payload.department = form.department;
        if (form.position) payload.position = form.position;
        if (form.bio) payload.bio = form.bio;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = role === "member" ? 3 : 2;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{currentConfig.icon}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Register as {currentConfig.label}
              </h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{currentConfig.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white hover:bg-slate-200 dark:bg-slate-700 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {["organization", "admin", "member"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setStep(1);
                setError("");
              }}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                role === r
                  ? "bg-indigo-500/20 border border-indigo-500/50 text-slate-900 dark:text-white"
                  : "bg-slate-100 dark:bg-slate-800/50 border border-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white hover:border-slate-600"
              }`}
            >
              {roleConfig[r].icon} {roleConfig[r].label}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i < step ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider">
                Basic Information
              </h3>
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!form.name || !form.email || !form.password) {
                    setError("Please fill all required fields");
                    return;
                  }
                  if (form.password !== form.confirmPassword) {
                    setError("Passwords do not match");
                    return;
                  }
                  if (form.password.length < 6) {
                    setError("Password must be at least 6 characters");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="btn-primary w-full py-3"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Organization */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider">
                {role === "organization"
                  ? "Organization Details"
                  : "Organization (Optional)"}
              </h3>

              {role === "organization" ? (
                <div>
                  <label className="label">Organization Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g., Acme Corp"
                    value={form.organizationName}
                    onChange={(e) =>
                      setForm({ ...form, organizationName: e.target.value })
                    }
                    required
                  />
                  <p className="text-slate-500 text-xs mt-1">
                    This will create a new organization that you manage.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="label">Select Existing Organization</label>
                    <select
                      className="input-field"
                      value={form.organizationId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          organizationId: e.target.value,
                          organizationName: "",
                        })
                      }
                    >
                      <option value="">— Choose organization —</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-center text-slate-500 text-xs">or</div>
                  <div>
                    <label className="label">Organization Name (optional)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Type organization name"
                      value={form.organizationName}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          organizationName: e.target.value,
                          organizationId: "",
                        })
                      }
                    />
                    <p className="text-slate-500 text-xs mt-1">
                      Leave blank to join without an organization.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 py-3"
                >
                  ← Back
                </button>
                {role === "member" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep(3);
                    }}
                    className="btn-primary flex-1 py-3"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      (role === "organization" && !form.organizationName)
                    }
                    className="btn-primary flex-1 py-3 disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Personal Details (member only) */}
          {step === 3 && role === "member" && (
            <div className="space-y-4">
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider">
                Personal Details (optional)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+1 234 567 890"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Department</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Engineering"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="label">Position / Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Software Engineer"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="123 Main St, City"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="input-field"
                  placeholder="Tell us about yourself..."
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1 py-3"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-5 text-center text-slate-600 dark:text-slate-400 text-sm">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
