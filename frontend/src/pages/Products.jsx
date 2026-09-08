import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

const empty = { name: "", category: "snacks", price: "", stock: 0 };

export default function Products() {
  const { toast, error: errToast } = useToast();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setProducts(await api("/products"));
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
      await api("/products", {
        method: "POST",
        body: { ...form, price: Number(form.price), stock: Number(form.stock) },
      });
      setForm(empty);
      toast(`Added product ${form.name}`);
      await load();
    } catch (err) {
      errToast(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function adjustStock(id, delta) {
    try {
      await api(`/products/${id}/stock?delta=${delta}`, { method: "POST" });
      await load();
    } catch (err) {
      errToast(err.message);
    }
  }

  async function updatePrice(id, price) {
    try {
      await api(`/products/${id}`, { method: "PATCH", body: { price } });
      toast("Price updated");
      await load();
    } catch (err) {
      errToast(err.message);
    }
  }

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div>
      <PageHeader
        title="Products & Stock"
        subtitle="Snacks, drinks and services — set prices and manage inventory levels."
      />

      <div className="toolbar" style={{ marginBottom: 6 }}>
        <form className="row-form" onSubmit={create}>
          <input
            placeholder="Name (e.g. Coke 500ml)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {["snacks", "drinks", "printing", "photocopy", "other"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.5"
            min="0"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <input
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            style={{ width: 90 }}
          />
          <button className="btn primary" disabled={busy || !form.name.trim() || form.price === ""}>
            Add product
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="📦" title="No products yet" hint="Add your first item using the form above." />
      ) : (
        categories.map((cat) => (
          <div key={cat}>
            <h2 className="capitalize">{cat}</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Adjust</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) => p.category === cat)
                  .map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          defaultValue={p.price}
                          onBlur={(e) => {
                            const v = Number(e.target.value);
                            if (v !== p.price) updatePrice(p.id, v);
                          }}
                          style={{ width: 90 }}
                          aria-label={`Price for ${p.name}`}
                        />
                      </td>
                      <td>
                        <span className={`badge ${p.stock === 0 ? "offline" : p.stock < 5 ? "low" : "available"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <div className="station-actions">
                          <button className="btn small" onClick={() => adjustStock(p.id, 1)} title="+1">
                            +1
                          </button>
                          <button className="btn small" onClick={() => adjustStock(p.id, -1)} title="−1">
                            −1
                          </button>
                          <button className="btn small" onClick={() => adjustStock(p.id, 10)} title="+10">
                            +10
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
