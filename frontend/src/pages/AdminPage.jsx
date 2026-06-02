import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadAnalysisHistoryCSV, fetchAnalysisHistory, fetchUsers, loginAdmin } from "../services/api";
import api from "../services/api";

// ── Offer Timer helpers ────────────────────────────────────────────────────
async function fetchOffer() {
  const res = await api.get("/settings/offer");
  return res.data;
}

async function setOffer(token, payload) {
  const res = await api.post("/admin/settings/offer", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

const QUICK_PRESETS = [
  { label: "2 hrs",  hours: 2    },
  { label: "6 hrs",  hours: 6    },
  { label: "12 hrs", hours: 12   },
  { label: "1 day",  hours: 24   },
  { label: "2 days", hours: 48   },
  { label: "3 days", hours: 72   },
  { label: "7 days", hours: 168  },
];

const LABEL_PRESETS = [
  "🔥 ₹1 Offer Ends In:",
  "⚡ Flash Sale Ends In:",
  "🎁 Free Bonus Ends In:",
  "⏰ Limited Time Offer:",
  "🚀 Early Bird Ends In:",
];

function fmtRemaining(seconds) {
  if (!seconds || seconds <= 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function OfferTimerPanel({ token }) {
  const [offer, setOffer_]          = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customDate, setCustomDate]   = useState("");
  const [customTime, setCustomTime]   = useState("");
  const [msg, setMsg]               = useState("");

  const reload = useCallback(async () => {
    try {
      const data = await fetchOffer();
      setOffer_(data);
      setCustomLabel(data.label || LABEL_PRESETS[0]);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Live countdown tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = useMemo(() => {
    if (!offer?.end_time || offer.status !== "active") return 0;
    return Math.max(0, Math.round((new Date(offer.end_time).getTime() - Date.now()) / 1000));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer, tick]);

  const apply = async (payload) => {
    setSaving(true);
    setMsg("");
    try {
      const data = await setOffer(token, { ...payload, label: customLabel });
      setOffer_(data);
      setMsg("✅ Offer timer updated successfully.");
    } catch (err) {
      setMsg("❌ " + (err?.response?.data?.detail || "Failed to update."));
    } finally {
      setSaving(false);
    }
  };

  const handleCustomSet = () => {
    if (!customDate || !customTime) { setMsg("❌ Pick a date and time first."); return; }
    const iso = new Date(`${customDate}T${customTime}:00`).toISOString();
    apply({ end_time: iso });
  };

  const handleClear = async () => {
    if (!window.confirm("Remove the offer timer from the landing page?")) return;
    apply({ clear: true });
  };

  const statusColor = offer?.status === "active"
    ? "bg-green-100 text-green-700 border-green-200"
    : offer?.status === "expired"
    ? "bg-rose-100 text-rose-700 border-rose-200"
    : "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <div className="mt-4 space-y-4">
      {/* Current status card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Current Offer Status</p>
            <div className="mt-3 flex items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-sm font-bold ${statusColor}`}>
                {offer?.status === "active" ? "🟢 Active" : offer?.status === "expired" ? "🔴 Expired" : "⚪ Not Set"}
              </span>
              {offer?.status === "active" && (
                <span className="font-display text-2xl font-bold text-amber-600">{fmtRemaining(remaining)} left</span>
              )}
            </div>
            {offer?.end_time && (
              <p className="mt-2 text-xs text-muted">
                Ends: {new Date(offer.end_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            )}
            {offer?.label && (
              <p className="mt-1 text-xs text-muted">Banner text: <span className="text-ink font-medium">{offer.label}</span></p>
            )}
          </div>
          {offer?.status === "active" && (
            <button onClick={handleClear} disabled={saving}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50">
              Remove Timer
            </button>
          )}
        </div>
      </div>

      {/* Quick presets */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-sm font-bold text-ink mb-1">Quick Set</p>
        <p className="text-xs text-muted mb-4">Sets the countdown from right now. All users on the landing page will see the same timer instantly.</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((p) => (
            <button key={p.hours} onClick={() => apply({ hours: p.hours })} disabled={saving}
              className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition disabled:opacity-50">
              + {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date + time */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-sm font-bold text-ink mb-4">Custom End Date & Time</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1.5 text-xs font-semibold text-muted">
            Date
            <input type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)}
              className="input-premium text-sm font-normal w-44" />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold text-muted">
            Time
            <input type="time" value={customTime} onChange={(e) => setCustomTime(e.target.value)}
              className="input-premium text-sm font-normal w-36" />
          </label>
          <button onClick={handleCustomSet} disabled={saving}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition disabled:opacity-50">
            Set Deadline
          </button>
        </div>
      </div>

      {/* Banner label */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-sm font-bold text-ink mb-3">Banner Label</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {LABEL_PRESETS.map((l) => (
            <button key={l} onClick={() => setCustomLabel(l)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${customLabel === l ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 text-slate hover:border-slate-400"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="Custom label text…"
            className="input-premium flex-1 text-sm font-normal" />
          <button onClick={() => apply({ hours: 0.001 })} disabled={saving || !offer?.end_time}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate hover:border-slate-400 transition disabled:opacity-40">
            Update Label
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">This is the text shown above the timer on the landing page.</p>
      </div>

      {msg && (
        <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.startsWith("✅") ? "bg-success-50 text-success-700" : "bg-danger-50 text-danger-700"}`}>
          {msg}
        </p>
      )}

      {loading && <p className="text-sm text-muted">Loading…</p>}
    </div>
  );
}

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  new:            { label: "New",            bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500",   border: "border-blue-200"   },
  contacted:      { label: "Contacted",      bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", border: "border-yellow-200" },
  converted:      { label: "Converted",      bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500",  border: "border-green-200"  },
  not_interested: { label: "Not Interested", bg: "bg-slate-100",  text: "text-slate-500",  dot: "bg-slate-400",  border: "border-slate-200"  },
  closed:         { label: "Closed",         bg: "bg-rose-100",   text: "text-rose-700",   dot: "bg-rose-500",   border: "border-rose-200"   },
};
const STATUSES = Object.keys(STATUS_CONFIG);

// ── Helpers ────────────────────────────────────────────────────────────────
function parseServicePrice(name = "") {
  const m = name.match(/₹([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : 0;
}

function formatWANumber(phone = "") {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function isToday(dateStr = "") {
  return dateStr?.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

async function patchLead(token, userId, body) {
  const res = await api.patch(`/admin/users/${userId}`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

async function deleteLead(token, userId) {
  const res = await api.delete(`/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ── Small components ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-lg">{icon}</span>
        {sub && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-muted">{sub}</span>}
      </div>
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function CopyButton({ value, display }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button onClick={copy} title="Click to copy"
      className="group flex items-center gap-1 text-left transition hover:text-brand-700">
      <span className="text-ink group-hover:text-brand-700">{display}</span>
      <span className="text-[10px] text-muted opacity-0 group-hover:opacity-100 transition">
        {copied ? "✓" : "copy"}
      </span>
    </button>
  );
}

function ServiceBreakdown({ users }) {
  const counts = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      (u.services_interested || []).forEach((s) => {
        const clean = s.trim();
        if (clean) map[clean] = (map[clean] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [users]);

  if (!counts.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wide text-muted mb-3">Top Services Requested</p>
      <div className="flex flex-wrap gap-2">
        {counts.map(([name, count]) => (
          <span key={name} className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
            {name}
            <span className="rounded-full bg-brand-200 px-1.5 py-0.5 text-[10px] font-bold text-brand-800">{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
function AdminPage() {
  const [token, setToken]             = useState("");
  const [isAuth, setIsAuth]           = useState(false);
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [loginError, setLoginError]   = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [users, setUsers]             = useState([]);
  const [history, setHistory]         = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");

  const [editingId, setEditingId]     = useState(null);
  const [editStatus, setEditStatus]   = useState("");
  const [editNotes, setEditNotes]     = useState("");
  const [saving, setSaving]           = useState(false);

  const [expandedId, setExpandedId]   = useState(null);
  const [deletingId, setDeletingId]   = useState(null);

  const [activeTab, setActiveTab]       = useState("leads");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch]             = useState("");
  const [sortDesc, setSortDesc]         = useState(true);
  const [todayOnly, setTodayOnly]       = useState(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const data = await loginAdmin({ username, password });
      setToken(data.token);
      setIsAuth(true);
    } catch (err) {
      setLoginError(err?.response?.data?.detail || "Login failed. Check credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ── Data ──────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      const [u, h] = await Promise.all([fetchUsers(token), fetchAnalysisHistory(token)]);
      setUsers(u);
      setHistory(h);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { if (isAuth) loadAll(); }, [isAuth, loadAll]);

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (user) => {
    setExpandedId(null);
    setEditingId(user.id);
    setEditStatus(user.status || "new");
    setEditNotes(user.notes || "");
  };

  const saveEdit = async (userId) => {
    setSaving(true);
    try {
      await patchLead(token, userId, { status: editStatus, notes: editNotes });
      setUsers((prev) => prev.map((u) =>
        u.id === userId ? { ...u, status: editStatus, notes: editNotes } : u
      ));
      setEditingId(null);
    } catch (err) {
      alert(err?.response?.data?.detail || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = async (userId) => {
    setDeletingId(userId);
    try {
      await deleteLead(token, userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setExpandedId(null);
      setEditingId(null);
    } catch (err) {
      alert(err?.response?.data?.detail || "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Computed ──────────────────────────────────────────────────────────────
  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = users.filter((u) => (u.status || "new") === s).length;
    return acc;
  }, {});

  const totalRevenuePotential = useMemo(() =>
    users.reduce((sum, u) => sum + (u.services_interested || []).reduce((s, svc) => s + parseServicePrice(svc), 0), 0)
  , [users]);

  const conversionRate = users.length > 0
    ? Math.round((statusCounts.converted / users.length) * 100)
    : 0;

  const todayCount = users.filter((u) => isToday(u.created_at)).length;

  const avgATS = useMemo(() => {
    if (!history.length) return 0;
    return Math.round(history.reduce((s, h) => s + (h.ats_score || 0), 0) / history.length);
  }, [history]);

  // ── Filtered + sorted leads ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = users.filter((u) => {
      const matchStatus = statusFilter === "all" || (u.status || "new") === statusFilter;
      const matchToday  = !todayOnly || isToday(u.created_at);
      const q = search.toLowerCase();
      const matchSearch = !q || u.name?.toLowerCase().includes(q)
        || u.email?.toLowerCase().includes(q)
        || u.phone?.includes(q)
        || u.role?.toLowerCase().includes(q);
      return matchStatus && matchToday && matchSearch;
    });
    return sortDesc ? [...list].reverse() : list;
  }, [users, statusFilter, search, sortDesc, todayOnly]);

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink">Sign in</h1>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <label className="grid gap-1.5 text-sm font-semibold text-ink">
              Username
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                className="input-premium font-normal" autoComplete="username" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-ink">
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-premium font-normal" autoComplete="current-password" />
            </label>
            {loginError && <p className="rounded-xl bg-danger-50 px-3 py-2 text-sm text-danger-700">{loginError}</p>}
            <button type="submit" disabled={isLoggingIn}
              className="w-full rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50">
              {isLoggingIn ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Admin Dashboard</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">Lead Pipeline</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-ink hover:border-slate-400">
            ↻ Refresh
          </button>
          <button onClick={() => downloadAnalysisHistoryCSV(token)}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            ↓ Export CSV
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</p>}

      {/* Business stats row */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon="📅" label="Leads Today"         value={todayCount}                          color="text-blue-600"   />
        <StatCard icon="💰" label="Revenue Potential"   value={`₹${totalRevenuePotential.toLocaleString("en-IN")}`} color="text-green-600" />
        <StatCard icon="🎯" label="Conversion Rate"     value={`${conversionRate}%`}                color="text-brand-600" sub={`${statusCounts.converted} converted`} />
        <StatCard icon="📊" label="Avg ATS Score"       value={`${avgATS}/100`}                     color="text-amber-600" sub={`${history.length} checks`} />
      </div>

      {/* Pipeline status row */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`rounded-2xl border p-3 text-center transition ${statusFilter === s ? `${cfg.bg} ${cfg.border}` : "border-slate-200 bg-white hover:bg-slate-50"} shadow-card`}>
              <p className={`font-display text-2xl font-bold ${cfg.text}`}>{statusCounts[s] ?? 0}</p>
              <p className="mt-0.5 text-xs font-semibold text-muted">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Service breakdown */}
      <div className="mt-3">
        <ServiceBreakdown users={users} />
      </div>

      {/* Tabs */}
      <div className="mt-5 flex flex-wrap gap-1 w-fit rounded-xl border border-slate-200 bg-soft p-1">
        {[
          { id: "leads",   label: `Leads (${users.length})`        },
          { id: "history", label: `ATS History (${history.length})` },
          { id: "offer",   label: "⏱ Offer Timer"                  },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${activeTab === id ? "bg-white shadow text-ink" : "text-muted hover:text-ink"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── LEADS ─────────────────────────────────────────────────────────── */}
      {activeTab === "leads" && (
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          {/* Filters bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
            <input type="search" placeholder="Search name / email / phone / role…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-60 rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-brand-400" />

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400">
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>

            <button onClick={() => setTodayOnly((v) => !v)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${todayOnly ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-300 text-slate hover:border-slate-400"}`}>
              📅 Today {todayOnly && `(${todayCount})`}
            </button>

            <button onClick={() => setSortDesc((v) => !v)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate hover:border-slate-400 transition">
              {sortDesc ? "↓ Newest" : "↑ Oldest"}
            </button>

            <span className="ml-auto text-xs text-muted">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</span>
          </div>

          {isLoading && <p className="px-5 py-8 text-sm text-slate">Loading leads…</p>}

          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-soft text-xs font-bold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Notes</th>
                    <th className="px-4 py-3 cursor-pointer select-none" onClick={() => setSortDesc((v) => !v)}>
                      Date {sortDesc ? "↓" : "↑"}
                    </th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-10 text-center text-slate">No leads found.</td></tr>
                  )}
                  {filtered.map((user) => {
                    const isEditing  = editingId  === user.id;
                    const isExpanded = expandedId === user.id;
                    const isDeleting = deletingId === user.id;
                    const waNumber   = formatWANumber(user.phone);
                    const price      = (user.services_interested || []).reduce((s, svc) => s + parseServicePrice(svc), 0);

                    return [
                      /* Main row */
                      <tr key={`row-${user.id}`}
                        className={`border-b border-slate-100 transition ${isExpanded ? "bg-brand-50/40" : "hover:bg-soft/60"}`}>
                        <td className="px-4 py-3 text-muted text-xs">
                          #{user.id}
                          {isToday(user.created_at) && (
                            <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">NEW</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink">{user.name}</p>
                          {price > 0 && (
                            <p className="text-[10px] font-semibold text-green-600">₹{price.toLocaleString("en-IN")}</p>
                          )}
                        </td>

                        <td className="px-4 py-3 space-y-0.5">
                          <CopyButton value={user.phone} display={user.phone} />
                          <CopyButton value={user.email} display={<span className="text-xs text-muted">{user.email}</span>} />
                        </td>

                        <td className="px-4 py-3 text-slate text-xs">{user.role}</td>

                        <td className="max-w-[150px] px-4 py-3 text-xs text-slate truncate">
                          {user.services_interested?.join(", ") || "—"}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-brand-400">
                              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                            </select>
                          ) : (
                            <StatusBadge status={user.status || "new"} />
                          )}
                        </td>

                        {/* Notes */}
                        <td className="max-w-[180px] px-4 py-3">
                          {isEditing ? (
                            <input type="text" value={editNotes} placeholder="Add note…"
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-brand-400" />
                          ) : (
                            <span className="block max-w-[170px] truncate text-xs text-slate">
                              {user.notes || <span className="text-muted">—</span>}
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">
                          {user.created_at?.slice(0, 10)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex gap-1.5">
                              <button onClick={() => saveEdit(user.id)} disabled={saving}
                                className="rounded-lg bg-success-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-success-700 disabled:opacity-50">
                                {saving ? "…" : "Save"}
                              </button>
                              <button onClick={() => setEditingId(null)}
                                className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate hover:border-slate-400">
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {/* WhatsApp */}
                              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                                title="Open WhatsApp"
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition text-sm">
                                💬
                              </a>
                              {/* Email */}
                              <a href={`mailto:${user.email}?subject=Your%20GetHired4U%20Plan%20-%20${encodeURIComponent(user.name)}`}
                                title="Send Email"
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-sm">
                                ✉️
                              </a>
                              {/* Expand */}
                              <button onClick={() => setExpandedId(isExpanded ? null : user.id)}
                                title="View Details"
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition text-sm ${isExpanded ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate hover:bg-slate-200"}`}>
                                {isExpanded ? "▲" : "▼"}
                              </button>
                              {/* Edit */}
                              <button onClick={() => openEdit(user)}
                                title="Edit"
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition text-sm">
                                ✏️
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete lead #${user.id} (${user.name})? This cannot be undone.`)) {
                                    confirmDelete(user.id);
                                  }
                                }}
                                disabled={isDeleting}
                                title="Delete"
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition text-sm disabled:opacity-40">
                                {isDeleting ? "…" : "🗑"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>,

                      /* Expanded detail row */
                      isExpanded && (
                        <tr key={`expand-${user.id}`} className="border-b border-slate-100 bg-brand-50/30">
                          <td colSpan={9} className="px-6 py-5">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-muted mb-2">Experience</p>
                                <p className="text-sm text-ink">{user.experience || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-muted mb-2">Lead Source</p>
                                <p className="text-sm text-ink capitalize">{user.lead_source || "web"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-muted mb-2">Recommended Plan</p>
                                <p className="text-sm text-ink">{user.recommended_plan || "—"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-muted mb-2">Timeline</p>
                                <p className="text-xs text-slate">Registered: {user.created_at?.slice(0, 10)}</p>
                                {user.contacted_at && <p className="text-xs text-yellow-600">Contacted: {user.contacted_at?.slice(0, 10)}</p>}
                                {user.converted_at && <p className="text-xs text-green-600">Converted: {user.converted_at?.slice(0, 10)}</p>}
                              </div>
                              {Object.keys(user.quiz_answers || {}).length > 0 && (
                                <div className="sm:col-span-2 lg:col-span-4">
                                  <p className="text-xs font-bold uppercase tracking-wide text-muted mb-2">Quiz Answers</p>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(user.quiz_answers).map(([k, v]) => (
                                      <span key={k} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs">
                                        <span className="font-semibold text-muted capitalize">{k.replace(/_/g, " ")}: </span>
                                        <span className="text-ink">{v}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {user.notes && (
                                <div className="sm:col-span-2 lg:col-span-4">
                                  <p className="text-xs font-bold uppercase tracking-wide text-muted mb-1">Notes</p>
                                  <p className="text-sm text-ink rounded-xl bg-white border border-slate-200 px-4 py-2">{user.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ),
                    ];
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ───────────────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
          {isLoading && <p className="px-5 py-8 text-sm text-slate">Loading history…</p>}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-soft text-xs font-bold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Keywords</th>
                    <th className="px-4 py-3">Experience</th>
                    <th className="px-4 py-3">Formatting</th>
                    <th className="px-4 py-3">Job Description</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-slate">No analysis history yet.</td></tr>
                  )}
                  {history.map((entry) => {
                    const score = entry.ats_score ?? 0;
                    const scoreColor = score >= 75 ? "text-success-600" : score >= 55 ? "text-warning-600" : "text-danger-600";
                    const scores = entry.component_scores || {};
                    const bar = (val) => {
                      const v = Math.round(val || 0);
                      const c = v >= 75 ? "bg-success-500" : v >= 50 ? "bg-warning-500" : "bg-danger-500";
                      return (
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                            <div className={`h-full rounded-full ${c}`} style={{ width: `${v}%` }} />
                          </div>
                          <span className="text-[10px] text-muted">{v}</span>
                        </div>
                      );
                    };
                    return (
                      <tr key={entry.id} className="border-b border-slate-100 transition hover:bg-soft/60">
                        <td className="px-4 py-3 text-xs text-muted">#{entry.id}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{entry.created_at?.slice(0, 10)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-display text-xl font-bold ${scoreColor}`}>{score}</span>
                          <span className="text-xs text-muted">/100</span>
                        </td>
                        <td className="px-4 py-3">{bar(scores.contact)}</td>
                        <td className="px-4 py-3">{bar(scores.keywords)}</td>
                        <td className="px-4 py-3">{bar(scores.experience)}</td>
                        <td className="px-4 py-3">{bar(scores.formatting)}</td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-xs text-slate">
                          {entry.job_description || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── OFFER TIMER ───────────────────────────────────────────────────── */}
      {activeTab === "offer" && <OfferTimerPanel token={token} />}

    </div>
  );
}

export default AdminPage;
