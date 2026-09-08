import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { money } from "../utils/format";

const STATUS_META = {
  available: { label: "Available", icon: "🟢" },
  in_use: { label: "In use", icon: "🔵" },
  maintenance: { label: "Maintenance", icon: "🟠" },
  offline: { label: "Offline", icon: "🔴" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/reports/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const statuses = data?.stations_by_status || {};

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>{greeting}, {user?.full_name?.split(" ")[0] || "there"} 👋</h1>
          <p className="muted page-subtitle">Here's what's happening at your cafe today.</p>
        </div>
      </header>

      {!data ? (
        <div className="cards">
          {[1, 2, 3, 4].map((i) => (
            <div className="card" key={i}>
              <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: "70%" }} />
                <div className="skeleton" style={{ width: "45%", marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cards">
          <div className="card" style={{ borderLeft: "4px solid var(--primary)" }}>
            <span className="card-icon">🖥️</span>
            <div>
              <div className="card-value">{data.stations_total}</div>
              <div className="card-label">Stations</div>
            </div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid #2563eb" }}>
            <span className="card-icon">⏱️</span>
            <div>
              <div className="card-value">{data.active_sessions}</div>
              <div className="card-label">Active sessions</div>
            </div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid #16a34a" }}>
            <span className="card-icon">💰</span>
            <div>
              <div className="card-value">{money(data.today_revenue)}</div>
              <div className="card-label">Today's revenue</div>
            </div>
          </div>
          <div className="card" style={{ borderLeft: "4px solid #9333ea" }}>
            <span className="card-icon">🧾</span>
            <div>
              <div className="card-value">{data.stations_total - data.active_sessions}</div>
              <div className="card-label">Free stations</div>
            </div>
          </div>
        </div>
      )}

      <h2>
        Station status
        <span className="count">{data?.stations_total || 0}</span>
      </h2>
      {data ? (
        <div className="status-strip">
          {Object.entries(STATUS_META).map(([key, meta]) => (
            <div className={`status-pill ${key}`} key={key}>
              <span className="dot" />
              {meta.label}
              <strong>{statuses[key] || 0}</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="skeleton" style={{ width: 320 }} />
      )}

      <h2>Quick actions</h2>
      <div className="cards">
        <Link className="card" to="/stations" style={{ textDecoration: "none" }}>
          <span className="card-icon">➕</span>
          <div>
            <div className="card-label" style={{ fontSize: 14, fontWeight: 650 }}>
              Manage stations
            </div>
            <div className="card-label">Add PCs, set rates, change status</div>
          </div>
        </Link>
        <Link className="card" to="/sessions" style={{ textDecoration: "none" }}>
          <span className="card-icon">▶️</span>
          <div>
            <div className="card-label" style={{ fontSize: 14, fontWeight: 650 }}>
              Start a session
            </div>
            <div className="card-label">Open a billing session for a PC</div>
          </div>
        </Link>
        <Link className="card" to="/pos" style={{ textDecoration: "none" }}>
          <span className="card-icon">🧃</span>
          <div>
            <div className="card-label" style={{ fontSize: 14, fontWeight: 650 }}>
              POS & Extras
            </div>
            <div className="card-label">Sell snacks, printing & more</div>
          </div>
        </Link>
        <Link className="card" to="/payments" style={{ textDecoration: "none" }}>
          <span className="card-icon">💳</span>
          <div>
            <div className="card-label" style={{ fontSize: 14, fontWeight: 650 }}>
              Record payment
            </div>
            <div className="card-label">Cash or M-Pesa</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
