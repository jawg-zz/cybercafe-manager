import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { dt } from "../utils/format";

const empty = { username: "", password: "", full_name: "", role: "cashier" };

export default function Users() {
  const { toast, error: errToast } = useToast();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setUsers(await api("/auth/users"));
    } catch (e) {
      errToast(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/auth/users", { method: "POST", body: form });
      setForm(empty);
      toast(`Created user ${form.username}`);
      await load();
    } catch (err) {
      errToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle="Manage login accounts and role-based access for your team."
      />

      <div className="toolbar" style={{ marginBottom: 6 }}>
        <form className="row-form" onSubmit={create}>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            autoComplete="off"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            autoComplete="new-password"
          />
          <input
            placeholder="Full name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="cashier">Cashier</option>
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn primary" disabled={busy || !form.username.trim() || !form.password || !form.full_name.trim()}>
            Add staff
          </button>
        </form>
      </div>

      {users.length === 0 ? (
        <EmptyState icon="👤" title="No staff yet" hint="Add your first team member using the form above." />
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Full name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.full_name}</td>
                <td>
                  <span className="role-badge">{u.role}</span>
                </td>
                <td>
                  <span className={`badge ${u.is_active ? "available" : "offline"}`}>
                    {u.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>{dt(u.created_at, false)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
