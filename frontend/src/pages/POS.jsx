import { useEffect, useState } from "react";
import { api } from "../api";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    try {
      const [p, s] = await Promise.all([
        api("/products"),
        api("/sessions?active_only=true"),
      ]);
      setProducts(p);
      setSessions(s);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function sell(productId) {
    setError("");
    setOk("");
    try {
      await api(`/products/sell?session_id=${sessionId}`, {
        method: "POST",
        body: { product_id: productId, quantity: qty },
      });
      setOk("Item added to bill");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div>
      <h1>POS & Extras</h1>
      {error && <div className="alert error">{error}</div>}
      {ok && <div className="alert success">{ok}</div>}

      <div className="row-form">
        <select value={sessionId} onChange={(e) => setSessionId(Number(e.target.value))}>
          <option value="">Select active session…</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              Session #{s.id} (station {s.station_id})
            </option>
          ))}
        </select>
        <label>
          Qty{" "}
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            style={{ width: 70 }}
          />
        </label>
      </div>

      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="capitalize">{cat}</h2>
          <div className="product-grid">
            {products
              .filter((p) => p.category === cat)
              .map((p) => (
                <button
                  key={p.id}
                  className="product-card"
                  disabled={!sessionId || p.stock < qty}
                  onClick={() => sell(p.id)}
                >
                  <strong>{p.name}</strong>
                  <span>KES {p.price}</span>
                  <span className="muted small">stock: {p.stock}</span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
