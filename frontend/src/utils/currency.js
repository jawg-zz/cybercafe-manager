/** In-memory app currency, seeded from /settings by the Layout. */
let currency = "KES";

export function setCurrency(code) {
  currency = code || "KES";
}

export function getCurrency() {
  return currency;
}