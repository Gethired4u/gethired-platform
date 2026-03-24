import { useCallback, useEffect, useState } from "react";

import { fetchUsers } from "../services/api";

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loadUsers = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const data = await fetchUsers(token);
      setUsers(data);
    } catch (apiError) {
      setError(apiError?.response?.data?.detail || "Unable to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Admin Dashboard</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink">Registered users</h1>
          </div>
          <button
            type="button"
            onClick={loadUsers}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-ink hover:border-slate-400"
          >
            Refresh
          </button>
        </div>

        {isLoading && <p className="mt-6 text-sm text-slate">Loading users...</p>}
        {error && <p className="mt-6 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p>}

        {!isLoading && !error && (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate">
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Experience</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Services</th>
                  <th className="px-3 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td className="px-3 py-4 text-slate" colSpan={8}>
                      No registrations yet.
                    </td>
                  </tr>
                )}
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="px-3 py-3">{user.id}</td>
                    <td className="px-3 py-3 font-semibold">{user.name}</td>
                    <td className="px-3 py-3">{user.email}</td>
                    <td className="px-3 py-3">{user.phone}</td>
                    <td className="px-3 py-3">{user.experience}</td>
                    <td className="px-3 py-3">{user.role}</td>
                    <td className="px-3 py-3">{user.services_interested.join(", ") || "-"}</td>
                    <td className="px-3 py-3">{user.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
