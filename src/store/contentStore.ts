import { create } from "zustand";
import { DEFAULT_DEALS, parseDealsCsv, type Deal } from "../data/promos";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";

export type GreetingPool = Record<string, string[]>;

export const DEFAULT_GREETINGS: GreetingPool = {
  morning: ["Good morning", "Rise and shine", "Morning"],
  afternoon: ["Good afternoon", "Hope you're peckish", "Afternoon"],
  evening: ["Good evening", "Winding down", "Evening"],
  night: ["Late-night cravings", "Still up", "Hungry already"],
};

export function parseGreetingsJson(text: string): GreetingPool {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return {};
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const pool: GreetingPool = {};
  for (const [bucket, value] of Object.entries(data as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    const lines = value.filter((v): v is string => typeof v === "string" && v.trim() !== "");
    if (lines.length > 0) pool[bucket.toLowerCase()] = lines;
  }
  return pool;
}

export const GREETING_SEED: number = (() => {
  const prev = loadJSON<number>(STORAGE_KEYS.greetingRotation, 0);
  const seed = Number.isFinite(prev) ? prev : 0;
  saveJSON(STORAGE_KEYS.greetingRotation, seed + 1);
  return seed;
})();

type ContentState = {
  greetings: GreetingPool;
  deals: Deal[];
  loaded: boolean;
  load: () => Promise<void>;
};

export const useContent = create<ContentState>((set) => ({
  greetings: DEFAULT_GREETINGS,
  deals: DEFAULT_DEALS,
  loaded: false,

  load: async () => {
    const base = import.meta.env.BASE_URL ?? "/";
    const [greetings, deals] = await Promise.all([
      fetch(`${base}greetings.json`)
        .then((r) => (r.ok ? r.text() : ""))
        .then((t) => {
          const p = parseGreetingsJson(t);
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
