import { create } from "zustand";
import { DEFAULT_DEALS, parseDealsCsv, type Deal } from "../data/promos";

// Editable content pools live in /public so they can be tweaked without a
// rebuild: greetings.txt (home greetings) and deals.csv (the Special Deal
// rotation). Both are fetched once at startup; the hardcoded defaults below
// are used until they load (and as a fallback if a file is missing/broken).

export type GreetingPool = Record<string, string[]>;

/** Fallback greetings, keyed by time-of-day bucket. Mirrors greetings.txt. */
export const DEFAULT_GREETINGS: GreetingPool = {
  morning: ["Good morning", "Rise and shine", "Morning"],
  afternoon: ["Good afternoon", "Hope you're peckish", "Afternoon"],
  evening: ["Good evening", "Winding down", "Evening"],
  night: ["Late-night cravings", "Still up", "Hungry already"],
};

/** Parse greetings.txt: `bucket: greeting` per line; # comments and blanks ignored. */
export function parseGreetingsTxt(text: string): GreetingPool {
  const pool: GreetingPool = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const bucket = line.slice(0, idx).trim().toLowerCase();
    const greeting = line.slice(idx + 1).trim();
    if (!bucket || !greeting) continue;
    (pool[bucket] ??= []).push(greeting);
  }
  return pool;
}

type ContentState = {
  greetings: GreetingPool;
  deals: Deal[];
  loaded: boolean;
  /** Fetch the editable pools from /public. Safe to call once at startup. */
  load: () => Promise<void>;
};

export const useContent = create<ContentState>((set) => ({
  greetings: DEFAULT_GREETINGS,
  deals: DEFAULT_DEALS,
  loaded: false,

  load: async () => {
    const base = import.meta.env.BASE_URL ?? "/";
    const [greetings, deals] = await Promise.all([
      fetch(`${base}greetings.txt`)
        .then((r) => (r.ok ? r.text() : ""))
        .then((t) => {
          const p = parseGreetingsTxt(t);
          return Object.keys(p).length > 0 ? p : DEFAULT_GREETINGS;
        })
        .catch(() => DEFAULT_GREETINGS),
      fetch(`${base}deals.csv`)
        .then((r) => (r.ok ? r.text() : ""))
        .then((t) => {
          const d = parseDealsCsv(t);
          return d.length > 0 ? d : DEFAULT_DEALS;
        })
        .catch(() => DEFAULT_DEALS),
    ]);
    set({ greetings, deals, loaded: true });
  },
}));
