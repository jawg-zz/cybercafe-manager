import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { dt } from "../utils/format";

const empty = { name: "", phone: "", notes: "" };

export default function Customers() {
  const { toast, error: errToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setCustomers(await api(`/customers?q=${encodeURIComponent(q)}`));
    } catch (e) {
      errToast(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [q]);

  async function create(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/customers", { method: "POST", body: form });
      setForm(empty);
      toast(`Added customer ${form.name}`);
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
        title="Customers"
        subtitle="Walk-ins and regulars — look people up by name or phone."
      />

      <div className="toolbar" style={{ marginBottom: 6 }}>
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
          <button className="btn primary" disabled={busy || !form.name.trim()}>
            Add customer
          </button>
        </form>
      </div>

      <input
        className="search"
        placeholder="Search by name or phone…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {customers.length === 0 ? (
        <EmptyState
          icon="👥"
          title={q ? "No matches" : "No customers yet"}
          hint={q ? "Try a different search." : "Add your first customer using the form above."}
        />
      ) : (
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
                <td className="muted small">{c.notes || "—"}</td>
                <td>{dt(c.created_at, false)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
