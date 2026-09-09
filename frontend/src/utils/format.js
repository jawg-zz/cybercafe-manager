import { getCurrency } from "./currency";

export function money(amount, currency = getCurrency()) {
  const n = Number(amount) || 0;
  const frac = !Number.isInteger(n);
  return `${currency} ${n.toLocaleString(undefined, {
    minimumFractionDigits: frac ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

export function dt(iso, withTime = true) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (withTime)
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}