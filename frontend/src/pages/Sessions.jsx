import { useEffect, useState } from "react";
import { api } from "../api";

export default function Sessions() {
  const [stations, setStations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [form, setForm] = useState({ station_id: "", prepaid_minutes: 0 });
  const [error, setError] = useState("");

  async function load() {
    try {
      const [st, ss] = await Promise.all([
        api("/stations"),
        api(`/sessions?active_only=${activeOnly}`),
      ]);
      setStations(st);
      setSessions(ss);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, [activeOnly]);

  async function start(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/sessions", { method: "POST", body: form });
      setForm({ station_id: "", prepaid_minutes: 0 });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function end(id) {
    setError("");
    try {
      await api(`/sessions/${id}/end`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const available = stations.filter((s) => s.status === "available");

  return (
    <div>
      <h1>Sessions</h1>
      {error && <div className="alert error">{error}</div>}

      <form className="row-form" onSubmit={start}>
        <select
          value={form.station_id}
          onChange={(e) => setForm({ ...form, station_id: Number(e.target.value) })}
          required
        >
          <option value="">Select station…</option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — KES {s.hourly_rate}/hr
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          placeholder="Prepaid minutes (0 = pay later)"
          value={form.prepaid_minutes}
          onChange={(e) => setForm({ ...form, prepaid_minutes: Number(e.target.value) })}
        />
        <button className="btn primary">Start session</button>
      </form>

      <label className="toggle">
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={(e) => setActiveOnly(e.target.checked)}
        />
        Active only
      </label>

      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Station</th>
            <th>Started</th>
            <th>Status</th>
            <th>Rate</th>
            <th>Due</th>
            <th>Paid</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{stations.find((st) => st.id === s.station_id)?.name || s.station_id}</td>
              <td>{new Date(s.started_at).toLocaleString()}</td>
              <td>
                <span className={`badge ${s.status}`}>{s.status}</span>
              </td>
              <td>{s.hourly_rate}</td>
              <td>{s.amount_due}</td>
              <td>{s.amount_paid}</td>
              <td>
                {s.status === "active" && (
                  <button className="btn small danger" onClick={() => end(s.id)}>
                    End & bill
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sessions.length === 0 && <p className="muted">No sessions.</p>}
    </div>
  );
}
