import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import ConfirmButton from "../components/ConfirmButton";
import { money, dt } from "../utils/format";

export default function Sessions() {
  const { toast, error: errToast } = useToast();
  const [stations, setStations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [form, setForm] = useState({ station_id: "", prepaid_minutes: 0 });
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [st, ss] = await Promise.all([
        api("/stations"),
        api(`/sessions?active_only=${activeOnly}`),
      ]);
      setStations(st);
      setSessions(ss);
    } catch (e) {
      errToast(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [activeOnly]);

  async function start(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/sessions", { method: "POST", body: form });
      setForm({ station_id: "", prepaid_minutes: 0 });
      toast("Session started");
      await load();
    } catch (err) {
      errToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function end(id) {
    try {
      await api(`/sessions/${id}/end`, { method: "POST" });
      toast("Session ended & billed");
      await load();
    } catch (err) {
      errToast(err.message);
    }
  }

  const available = stations.filter((s) => s.status === "available");
  const stationName = (id) => stations.find((st) => st.id === id)?.name || `#${id}`;

  return (
    <div>
      <PageHeader
        title="Sessions"
        subtitle="Track who's on which PC, how long they've been there, and what they owe."
      />

      <form className="row-form" onSubmit={start}>
        <select
          value={form.station_id}
          onChange={(e) => setForm({ ...form, station_id: Number(e.target.value) })}
          required
        >
          <option value="">Select station…</option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {money(s.hourly_rate)}/hr
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          placeholder="Prepaid minutes (0 = pay later)"
          value={form.prepaid_minutes}
          onChange={(e) => setForm({ ...form, prepaid_minutes: Number(e.target.value) })}
          style={{ width: 200 }}
        />
        <button className="btn primary" disabled={busy || !form.station_id}>
          ▶ Start session
        </button>
        <label className="toggle">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          Active only
        </label>
      </form>

      {sessions.length === 0 ? (
        <EmptyState
          icon="⏱️"
          title={activeOnly ? "No active sessions" : "No sessions yet"}
          hint="Start a session from the form above to begin billing."
        />
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Station</th>
                <th>Started</th>
                <th>Status</th>
                <th className="num">Due</th>
                <th className="num">Paid</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{stationName(s.station_id)}</td>
                  <td>{dt(s.started_at)}</td>
                  <td>
                    <span className={`badge ${s.status}`}>{s.status.replace("_", " ")}</span>
                  </td>
                  <td className="num">{money(s.amount_due)}</td>
                  <td className="num">{money(s.amount_paid)}</td>
                  <td>
                    {s.status === "active" && (
                      <ConfirmButton label="End & bill" confirmLabel="Confirm?" onConfirm={() => end(s.id)} />
                    )}
                    {s.status === "ended" && <span className="muted small">billed ✓</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
