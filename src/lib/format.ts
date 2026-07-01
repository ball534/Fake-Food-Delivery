export function money(amount: number): string {
  return "$" + amount.toFixed(2);
}

export function etaRange([min, max]: [number, number]): string {
  return `${min}–${max} min`;
}

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

// Up to two uppercase initials from a name, e.g. "Jane Doe" -> "JD", "Sam" -> "S".
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const letters = parts.slice(0, 2).map((w) => w[0]!.toUpperCase());
  return letters.join("");
}
