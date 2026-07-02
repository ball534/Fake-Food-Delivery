import { create } from "zustand";
import type { Store } from "../data/types";
import { loadShops } from "../lib/shopLoader";
import { CUISINE_CATEGORIES } from "../data/categories";

function computeCategories(stores: Store[]): string[] {
  const present = new Set(stores.flatMap((s) => s.categories));
  const ordered = CUISINE_CATEGORIES.filter((c) => present.has(c));
  const extra = [...present]
    .filter((c) => !CUISINE_CATEGORIES.includes(c))
    .sort();
  return [...ordered, ...extra];
}

type StoresState = {
  stores: Store[];
  byId: Record<string, Store>;
  categories: string[];
  loaded: boolean;
  error: boolean;
  load: () => Promise<void>;
};

export const useStores = create<StoresState>((set, get) => ({
  stores: [],
  byId: {},
  categories: [],
  loaded: false,
  error: false,

  load: async () => {
    if (get().loaded) return;
    const base = import.meta.env.BASE_URL ?? "/";
    try {
      const stores = await loadShops(base);
      set({
        stores,
        byId: Object.fromEntries(stores.map((s) => [s.id, s])),
        categories: computeCategories(stores),
        loaded: true,
        error: stores.length === 0,
      });
    } catch {
      set({ loaded: true, error: true });
    }
  },
}));

export function getStoreById(id: string): Store | undefined {
  return useStores.getState().byId[id];
}
