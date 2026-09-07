import { useEffect, useState } from "react";
import { api } from "../api";

const empty = { name: "", specs: "", hourly_rate: 50 };

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function load() {
    try {
      setStations(await api("/stations"));
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
    try {
      await api("/stations", { method: "POST", body: form });
      setForm(empty);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function setStatus(id, status) {
    try {
      await api(`/stations/${id}`, { method: "PATCH", body: { status } });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Stations</h1>
      {error && <div className="alert error">{error}</div>}

      <form className="row-form" onSubmit={create}>
        <input
          placeholder="Name (e.g. PC-01)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Specs (e.g. i5 / 8GB)"
          value={form.specs}
          onChange={(e) => setForm({ ...form, specs: e.target.value })}
        />
        <input
          type="number"
          step="0.5"
          placeholder="Hourly rate"
          value={form.hourly_rate}
          onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
        />
        <button className="btn primary">Add station</button>
      </form>

      <div className="station-grid">
        {stations.map((s) => (
          <div className={`station-card ${s.status}`} key={s.id}>
            <div className="station-head">
              <strong>{s.name}</strong>
              <span className={`badge ${s.status}`}>{s.status.replace("_", " ")}</span>
            </div>
            <p className="muted small">{s.specs || "No specs"}</p>
            <p className="rate">KES {s.hourly_rate}/hr</p>
            <div className="station-actions">
              {s.status === "available" && (
                <button className="btn small" onClick={() => setStatus(s.id, "maintenance")}>
                  Maintenance
                </button>
              )}
              {s.status === "maintenance" && (
                <button className="btn small" onClick={() => setStatus(s.id, "available")}>
                  Mark available
                </button>
              )}
              {s.status === "offline" && (
                <button className="btn small" onClick={() => setStatus(s.id, "available")}>
                  Bring online
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {stations.length === 0 && <p className="muted">No stations yet — add your first PC above.</p>}
    </div>
  );
}
