import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import { money } from "../utils/format";

const empty = { name: "", specs: "", hourly_rate: 50 };

export default function Stations() {
  const { toast, error: errToast } = useToast();
  const [stations, setStations] = useState([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setStations(await api("/stations"));
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
      await api("/stations", { method: "POST", body: form });
      setForm(empty);
      toast(`Added station ${form.name}`);
      await load();
    } catch (err) {
      errToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id, status) {
    try {
      await api(`/stations/${id}`, { method: "PATCH", body: { status } });
      toast(`Station status → ${status.replace("_", " ")}`);
      await load();
    } catch (err) {
      errToast(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Stations"
        subtitle="Your PCs and workstations — add machines, set rates, and control availability."
      />

      <div className="toolbar" style={{ marginBottom: 6 }}>
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
            min="0"
            placeholder="Hourly rate"
            value={form.hourly_rate}
            onChange={(e) => setForm({ ...form, hourly_rate: Number(e.target.value) })}
            style={{ width: 110 }}
          />
          <button className="btn primary" disabled={busy || !form.name.trim()}>
            Add station
          </button>
        </form>
      </div>

      {stations.length === 0 ? (
        <EmptyState icon="🖥️" title="No stations yet" hint="Add your first PC using the form above." />
      ) : (
        <div className="station-grid">
          {stations.map((s) => (
            <div className={`station-card ${s.status}`} key={s.id}>
              <div className="station-head">
                <strong>{s.name}</strong>
                <span className={`badge ${s.status}`}>{s.status.replace("_", " ")}</span>
              </div>
              <p className="muted small">{s.specs || "Standard workstation"}</p>
              <p className="rate">{money(s.hourly_rate)}<span className="muted">/hr</span></p>
              <div className="station-actions">
                {s.status === "available" && (
                  <button className="btn small" onClick={() => setStatus(s.id, "maintenance")}>
                    🔧 Maintenance
                  </button>
                )}
                {s.status === "maintenance" && (
                  <button className="btn small" onClick={() => setStatus(s.id, "available")}>
                    ✓ Mark available
                  </button>
                )}
                {s.status === "offline" && (
                  <button className="btn small" onClick={() => setStatus(s.id, "available")}>
                    ✓ Bring online
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
