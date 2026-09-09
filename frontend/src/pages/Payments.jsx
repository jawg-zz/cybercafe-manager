import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { money, dt } from "../utils/format";

const empty = { session_id: "", amount: "", method: "cash", phone: "" };

export default function Payments() {
  const { toast, error: errToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [p, s] = await Promise.all([
        api("/payments"),
        api("/sessions?active_only=true"),
      ]);
      setPayments(p);
      setSessions(s);
    } catch (e) {
      errToast(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function record(e) {
    e.preventDefault();
    setBusy(true);
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
      toast(`Payment of ${money(form.amount)} recorded`);
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
        title="Payments"
        subtitle="Record cash and M-Pesa payments against sessions or walk-in sales."
      />

      <div className="toolbar" style={{ marginBottom: 6 }}>
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
          <button className="btn primary" disabled={busy || form.amount === ""}>
            Record payment
          </button>
        </form>
      </div>

      {payments.length === 0 ? (
        <EmptyState icon="💳" title="No payments yet" hint="Record your first payment using the form above." />
      ) : (
        <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Session</th>
              <th scope="col">Amount</th>
              <th scope="col">Method</th>
              <th scope="col">Status</th>
              <th scope="col">Reference</th>
              <th scope="col">Time</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.session_id ?? "—"}</td>
                <td>{money(p.amount)}</td>
                <td className="capitalize">{p.method}</td>
                <td>
                  <span className={`badge ${p.status}`}>{p.status}</span>
                </td>
                <td className="muted small">{p.reference}</td>
                <td>{dt(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
