import { useEffect, useState } from "react";
import { api } from "../api";

const empty = { name: "", phone: "", notes: "" };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setCustomers(await api(`/customers?q=${encodeURIComponent(q)}`));
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [q]);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/customers", { method: "POST", body: form });
      setForm(empty);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Customers</h1>
      {error && <div className="alert error">{error}</div>}

      <form className="row-form" onSubmit={create}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Phone (07XXXXXXXX)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button className="btn primary">Add customer</button>
      </form>

      <input
        className="search"
        placeholder="Search by name or phone…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Notes</th>
            <th>Registered</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.phone || "—"}</td>
              <td>{c.notes}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && <p className="muted">No customers found.</p>}
    </div>
  );
}
