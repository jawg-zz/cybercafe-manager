import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  const { toast, error: errToast } = useToast();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/settings")
      .then(setForm)
      .catch((e) => errToast(e.message));
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const updated = await api("/settings", { method: "PATCH", body: form });
      setForm(updated);
      toast("Settings saved");
    } catch (err) {
      errToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!form) {
    return (
      <div>
        <PageHeader title="Settings" subtitle="Cafe name, currency, tax and business hours." />
        <div className="settings-form">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="field" key={i}>
              <div className="skeleton" style={{ width: "60%" }} />
              <div className="skeleton" style={{ width: "100%", height: 38 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
      <PageHeader
        title="Settings"
        subtitle="Cafe name, currency, tax and business hours."
      />
      <form className="settings-form" onSubmit={save}>
        {field("cafe_name", "Cafe name")}
        {field("currency", "Currency")}
        {field("tax_rate", "Tax rate (%)", "number")}
        {field("default_hourly_rate", "Default hourly rate", "number")}
        {field("opening_time", "Opening time")}
        {field("closing_time", "Closing time")}
        <button className="btn primary" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
