import { useMemo } from "react";
import { create } from "zustand";
import { DEFAULT_DEALS, parseDealsJson, type Deal } from "../data/promos";
import {
  DEFAULT_DRIVER_CHAT,
  parseDriverChat,
  type DriverChatConfig,
} from "../lib/driverChat";
import { DEFAULT_DRIVER_NAMES } from "../lib/simulation";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { useStores } from "./storesStore";

export type GreetingPool = Record<string, string[]>;

export const DEFAULT_GREETINGS: GreetingPool = {
  morning: ["Good morning", "Rise and shine", "Morning"],
  afternoon: ["Good afternoon", "Hope you're peckish", "Afternoon"],
  evening: ["Good evening", "Winding down", "Evening"],
  night: ["Late-night cravings", "Still up", "Hungry already"],
};

function normalizeGreetings(value: unknown): GreetingPool {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const pool: GreetingPool = {};
  for (const [bucket, v] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(v)) continue;
    const lines = v.filter(
      (x): x is string => typeof x === "string" && x.trim() !== "",
    );
    if (lines.length > 0) pool[bucket.toLowerCase()] = lines;
  }
  return pool;
}

function normalizeDrivers(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (x): x is string => typeof x === "string" && x.trim() !== "",
  );
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
  drivers: string[];
  driverChat: DriverChatConfig;
  loaded: boolean;
  load: () => Promise<void>;
};

export const useContent = create<ContentState>((set) => ({
  greetings: DEFAULT_GREETINGS,
  deals: DEFAULT_DEALS,
  drivers: DEFAULT_DRIVER_NAMES,
  driverChat: DEFAULT_DRIVER_CHAT,
  loaded: false,

  load: async () => {
    const base = import.meta.env.BASE_URL ?? "/";
    try {
      const res = await fetch(`${base}content.json`);
      const data: unknown = res.ok ? await res.json() : {};
      const obj =
        data && typeof data === "object"
          ? (data as Record<string, unknown>)
          : {};
      const greetings = normalizeGreetings(obj.greetings);
      const deals = parseDealsJson(obj.deals);
      const drivers = normalizeDrivers(obj.drivers);
      set({
        greetings:
          Object.keys(greetings).length > 0 ? greetings : DEFAULT_GREETINGS,
        deals: deals.length > 0 ? deals : DEFAULT_DEALS,
        drivers: drivers.length > 0 ? drivers : DEFAULT_DRIVER_NAMES,
        driverChat: parseDriverChat(obj.driverChat),
        loaded: true,
      });
    } catch {
      set({
        greetings: DEFAULT_GREETINGS,
        deals: DEFAULT_DEALS,
        drivers: DEFAULT_DRIVER_NAMES,
        driverChat: DEFAULT_DRIVER_CHAT,
        loaded: true,
      });
    }
  },
}));

// The rotation pool shown on Home / StoreMenu combines the global promo-code
// deals (this store) with every shop's own combo/item deals (from shop.json).
// Promo codes stay decoupled from shop data; they're only merged at read time.
export function useDealPool(): Deal[] {
  const codeDeals = useContent((s) => s.deals);
  const stores = useStores((s) => s.stores);
  return useMemo(
    () => [...codeDeals, ...stores.flatMap((s) => s.deals)],
    [codeDeals, stores],
  );
}
