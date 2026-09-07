import { useEffect, useState } from "react";
import { api } from "../api";

export default function Reports() {
  const [revenue, setRevenue] = useState(null);
  const [util, setUtil] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api("/reports/revenue"), api("/reports/utilization")])
      .then(([r, u]) => {
        setRevenue(r);
        setUtil(u);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert error">{error}</div>;
  if (!revenue) return <p className="muted">Loading…</p>;

  const max = Math.max(1, ...revenue.days.map((d) => d.revenue));

  return (
    <div>
      <h1>Reports</h1>

      <h2>Revenue (last 7 days)</h2>
      <div className="bar-chart">
        {revenue.days.map((d) => (
          <div className="bar-col" key={d.date}>
            <div className="bar" style={{ height: `${(d.revenue / max) * 100}%` }} title={`${d.revenue}`} />
            <span className="muted small">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>

      <h2>Station utilization (7 days)</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Station</th>
            <th>Minutes used</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {util.map((u) => (
            <tr key={u.station}>
              <td>{u.station}</td>
              <td>{u.minutes}</td>
              <td>{(u.minutes / 60).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <a className="btn" href="/api/reports/export" download>
        ⬇ Export payments CSV
      </a>
    </div>
  );
}
