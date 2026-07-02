// Seeded, deterministic "social proof" numbers for the simulation. Everything
// is derived from a hash of (local day + ids) so the figures stay stable for a
// whole day, differ per item, and change overnight — like a real marketplace.

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededInt(seed: string, min: number, max: number): number {
  return min + (hash(seed) % (max - min + 1));
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// "X ordered today" — popular items skew higher.
export function ordersToday(
  storeId: string,
  itemId: string,
  popular = false,
): number {
  const base = seededInt(`${today()}:${storeId}:${itemId}:orders`, 8, 60);
  return popular ? base + 40 : base;
}

// "N people are eyeing this" — nudged by the hour so it drifts during the day.
export function viewersNow(storeId: string, itemId: string): number {
  const h = new Date().getHours();
  return seededInt(`${today()}:${h}:${storeId}:${itemId}:viewers`, 2, 9);
}

// Roughly a third of items are "selling fast" on any given day.
export function sellingFast(storeId: string, itemId: string): boolean {
  return hash(`${today()}:${storeId}:${itemId}:fast`) % 3 === 0;
}

// Store-level "K orders placed today" for menu headers.
export function storeOrdersToday(storeId: string): number {
  return seededInt(`${today()}:${storeId}:store-orders`, 120, 900);
}
