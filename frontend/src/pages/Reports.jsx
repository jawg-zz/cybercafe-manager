import { useEffect, useState } from "react";
import { api, download } from "../api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { money } from "../utils/format";

export default function Reports() {
  const { error: errToast } = useToast();
  const [revenue, setRevenue] = useState(null);
  const [util, setUtil] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([api("/reports/revenue"), api("/reports/utilization")])
      .then(([r, u]) => {
        setRevenue(r);
        setUtil(u);
      })
      .catch((e) => errToast(e.message));
  }, []);

  async function exportCsv() {
    setExporting(true);
    try {
      const filename = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
      await download("/reports/export", filename);
    } catch (e) {
      errToast(e.message);
    } finally {
      setExporting(false);
    }
  }

  if (!revenue) {
    return (
      <div>
        <PageHeader title="Reports" subtitle="Revenue trends and station utilization over the last 7 days." />
        <div className="bar-chart">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div className="skeleton" key={i} style={{ height: `${30 + (i % 5) * 14}%`, flex: 1 }} />
          ))}
        </div>
        <div className="skeleton" style={{ width: "100%", height: 120, marginTop: 20 }} />
      </div>
    );
  }

  const max = Math.max(1, ...revenue.days.map((d) => d.revenue));

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Revenue trends and station utilization over the last 7 days."
      />

      <h2>Revenue (last 7 days)</h2>
      {revenue.days.length === 0 ? (
        <EmptyState icon="📈" title="No revenue data yet" hint="Once sessions are billed and payments recorded, trends appear here." />
      ) : (
        <div className="bar-chart">
          {revenue.days.map((d) => (
            <div className="bar-col" key={d.date}>
              <div
                className="bar"
                style={{ height: `${(d.revenue / max) * 100}%` }}
                title={`${d.date}: ${money(d.revenue)}`}
              />
              <span className="muted small">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      )}

      <h2>Station utilization (7 days)</h2>
      {util.length === 0 ? (
        <EmptyState icon="🖥️" title="No utilization data yet" hint="Station usage from ended sessions will show up here." />
      ) : (
        <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Station</th>
              <th scope="col">Minutes used</th>
              <th scope="col">Hours</th>
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
        </div>
      )}

      <button className="btn primary" onClick={exportCsv} disabled={exporting}>
        {exporting ? "Exporting…" : "⬇ Export payments CSV"}
      </button>
    </div>
  );
}
