import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/reports/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!data) return <p className="muted">Loading…</p>;

  const statuses = data.stations_by_status || {};
  const cards = [
    { label: "Stations", value: data.stations_total, icon: "🖥️" },
    { label: "Active sessions", value: data.active_sessions, icon: "⏱️" },
    { label: "Today's revenue", value: data.today_revenue, icon: "💰", money: true },
  ];

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="cards">
        {cards.map((c) => (
          <div className="card" key={c.label}>
            <span className="card-icon">{c.icon}</span>
            <div>
              <div className="card-value">
                {c.money ? `${data.currency || "KES"} ${c.value.toLocaleString()}` : c.value}
              </div>
              <div className="card-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <h2>Station status</h2>
      <div className="status-strip">
        {Object.entries(statuses).map(([status, count]) => (
          <div className={`status-pill ${status}`} key={status}>
            {status.replace("_", " ")}: {count}
          </div>
        ))}
      </div>
    </div>
  );
}
