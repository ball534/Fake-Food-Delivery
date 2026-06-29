// The single seam between the app and persistence. Swap the body of these
// helpers for AsyncStorage (React Native) or a real API later — callers never
// change.

// Bumped to v2 when the data model changed (wallet → points/loyalty, new order
// stages, no delivery fee) so stale v1 data doesn't deserialise into the new shape.
const PREFIX = "fakeeats:v2:";

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full / unavailable (private mode). Fail silently — it's a toy.
  }
}

/** Wipe all app data (used by "Reset simulation" in Profile). */
export function clearAll(): void {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  cart: "cart",
  orders: "orders",
  profile: "profile",
  recentSearches: "recentSearches",
} as const;
