// Small pure formatting helpers (platform-agnostic).

/** Fake credits, shown SGD-style. */
export function money(amount: number): string {
  return "$" + amount.toFixed(2);
}

export function etaRange([min, max]: [number, number]): string {
  return `${min}–${max} min`;
}

/** "in 2m 30s" / "in 45s" style countdown from a millisecond delta. */
export function formatCountdown(msRemaining: number): string {
  const s = Math.max(0, Math.round(msRemaining / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem.toString().padStart(2, "0")}s`;
}

export function formatClock(epochMs: number): string {
  const d = new Date(epochMs);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(epochMs: number): string {
  const d = new Date(epochMs);
  return d.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}
