import { useEffect, useState } from "react";
import { api } from "../api";

const empty = { username: "", password: "", full_name: "", role: "cashier" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    try {
      setUsers(await api("/auth/users"));
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    setOk("");
    try {
      await api("/auth/users", { method: "POST", body: form });
      setForm(empty);
      setOk("User created");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Staff</h1>
      {error && <div className="alert error">{error}</div>}
      {ok && <div className="alert success">{ok}</div>}

      <form className="row-form" onSubmit={create}>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
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
        <button className="btn primary">Add staff</button>
      </form>

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
              <td>{u.is_active ? "Active" : "Disabled"}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
