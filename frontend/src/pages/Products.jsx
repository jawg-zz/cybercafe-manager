import { useEffect, useState } from "react";
import { api } from "../api";

const empty = { name: "", category: "snacks", price: "", stock: 0 };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function load() {
    try {
      setProducts(await api("/products"));
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    setOk("");
    try {
      await api("/products", {
        method: "POST",
        body: { ...form, price: Number(form.price), stock: Number(form.stock) },
      });
      setForm(empty);
      setOk("Product added");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function adjustStock(id, delta) {
    setError("");
    try {
      await api(`/products/${id}/stock?delta=${delta}`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updatePrice(id, price) {
    setError("");
    try {
      await api(`/products/${id}`, { method: "PATCH", body: { price } });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div>
      <h1>Products & Stock</h1>
      {error && <div className="alert error">{error}</div>}
      {ok && <div className="alert success">{ok}</div>}

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
        />
        <button className="btn primary">Add product</button>
      </form>

      {categories.map((cat) => (
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
                      />
                    </td>
                    <td>
                      <span className={p.stock === 0 ? "badge offline" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <div className="station-actions">
                        <button className="btn small" onClick={() => adjustStock(p.id, 1)}>
                          +1
                        </button>
                        <button className="btn small" onClick={() => adjustStock(p.id, -1)}>
                          −1
                        </button>
                        <button className="btn small" onClick={() => adjustStock(p.id, 10)}>
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
      {products.length === 0 && <p className="muted">No products yet — add your first item above.</p>}
    </div>
  );
}
