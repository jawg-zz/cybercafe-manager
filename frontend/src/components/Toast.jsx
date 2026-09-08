import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

const ICONS = { success: "✓", error: "✕", info: "ℹ" };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function push(type, message) {
    if (!message) return;
    const id = Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => dismiss(id), 4000);
  }

  function dismiss(id) {
    setToasts((t) => t.filter((x) => x.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast: (m) => push("info", m), success: (m) => push("success", m), error: (m) => push("error", m) }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`} role="status">
            <span className="toast-icon">{ICONS[t.type]}</span>
            <span>{t.message}</span>
            <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}