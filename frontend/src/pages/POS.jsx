import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { money } from "../utils/format";

export default function POS() {
  const { toast, error: errToast } = useToast();
  const [products, setProducts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [qty, setQty] = useState(1);

  async function load() {
    try {
      const [p, s] = await Promise.all([
        api("/products"),
        api("/sessions?active_only=true"),
      ]);
      setProducts(p);
      setSessions(s);
    } catch (e) {
      errToast(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function sell(productId) {
    const product = products.find((p) => p.id === productId);
    try {
      await api(`/products/sell?session_id=${sessionId}`, {
        method: "POST",
        body: { product_id: productId, quantity: qty },
      });
      toast(`${product?.name || "Item"} added to bill`);
      await load();
    } catch (err) {
      errToast(err.message);
    }
  }

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div>
      <PageHeader
        title="POS & Extras"
        subtitle="Sell snacks, drinks, printing and services straight onto an active session's bill."
        actions={
          <label className="qty">
            Qty{" "}
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              style={{ width: 70 }}
            />
          </label>
        }
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon="🧃"
          title="No active sessions"
          hint="Start a session first — POS sales are added to a session's bill."
        />
      ) : (
        <>
          <select
            className="session-picker"
            value={sessionId}
            onChange={(e) => setSessionId(Number(e.target.value))}
          >
            <option value="">Select active session…</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                Session #{s.id} (station {s.station_id})
              </option>
            ))}
          </select>

          {products.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No products yet"
              hint="Add products on the Products page before selling."
            />
          ) : (
            categories.map((cat) => (
              <div key={cat}>
                <h2 className="capitalize">{cat}</h2>
                <div className="product-grid">
                  {products
                    .filter((p) => p.category === cat)
                    .map((p) => {
                      const stockClass =
                        p.stock === 0 ? "out" : p.stock < 5 ? "low" : "";
                      return (
                        <button
                          key={p.id}
                          className="product-card"
                          disabled={!sessionId || p.stock < qty}
                          onClick={() => sell(p.id)}
                        >
                          <strong>{p.name}</strong>
                          <span className="p-price">{money(p.price)}</span>
                          <span className={`p-stock ${stockClass}`}>
                            {p.stock === 0 ? "Out of stock" : `stock: ${p.stock}`}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
