import { useEffect, useState } from "react";
import { api } from "../api";

export default function Settings() {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    api("/settings")
      .then(setForm)
      .catch((e) => setError(e.message));
  }, []);

  async function save(e) {
    e.preventDefault();
    setError("");
    setOk("");
    try {
      const updated = await api("/settings", { method: "PATCH", body: form });
      setForm(updated);
      setOk("Settings saved");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!form) return <p className="muted">Loading…</p>;

  const field = (key, label, type = "text") => (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        step={type === "number" ? "0.5" : undefined}
        value={form[key]}
        onChange={(e) =>
          setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })
        }
      />
    </label>
  );

  return (
    <div>
      <h1>Settings</h1>
      {error && <div className="alert error">{error}</div>}
      {ok && <div className="alert success">{ok}</div>}
      <form className="settings-form" onSubmit={save}>
        {field("cafe_name", "Cafe name")}
        {field("currency", "Currency")}
        {field("tax_rate", "Tax rate (%)", "number")}
        {field("default_hourly_rate", "Default hourly rate", "number")}
        {field("opening_time", "Opening time")}
        {field("closing_time", "Closing time")}
        <button className="btn primary">Save settings</button>
      </form>
    </div>
  );
}
