import { useEffect, useState } from "react";
import { api } from "../api";

const empty = { session_id: "", amount: "", method: "cash", phone: "" };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    try {
      const [p, s] = await Promise.all([
        api("/payments"),
        api("/sessions?active_only=true"),
      ]);
      setPayments(p);
      setSessions(s);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function record(e) {
    e.preventDefault();
    setError("");
    setOk("");
    try {
      await api("/payments", {
        method: "POST",
        body: {
          session_id: form.session_id ? Number(form.session_id) : null,
          amount: Number(form.amount),
          method: form.method,
          phone: form.method === "mpesa" ? form.phone : null,
        },
      });
      setForm(empty);
      setOk("Payment recorded");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Payments</h1>
      {error && <div className="alert error">{error}</div>}
      {ok && <div className="alert success">{ok}</div>}

      <form className="row-form" onSubmit={record}>
        <select
          value={form.session_id}
          onChange={(e) => setForm({ ...form, session_id: e.target.value })}
        >
          <option value="">No session (walk-in)</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              Session #{s.id} (station {s.station_id})
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.5"
          min="0"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <select
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value })}
        >
          <option value="cash">Cash</option>
          <option value="mpesa">M-Pesa</option>
        </select>
        {form.method === "mpesa" && (
          <input
            placeholder="Phone (07XXXXXXXX)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        )}
        <button className="btn primary">Record payment</button>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Session</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Reference</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.session_id ?? "—"}</td>
              <td>{p.amount}</td>
              <td>{p.method}</td>
              <td>
                <span className={`badge ${p.status}`}>{p.status}</span>
              </td>
              <td className="muted small">{p.reference}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {payments.length === 0 && <p className="muted">No payments yet.</p>}
    </div>
  );
}
