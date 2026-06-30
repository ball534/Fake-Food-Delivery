import { create } from "zustand";
import type { Store } from "../data/types";
import { loadShops } from "../lib/shopLoader";

// The shop catalogue, loaded once at startup from /public/shops (data-driven).
// Replaces the old hardcoded STORES array. Components read it reactively via the
// `useStores` hook; plain modules use the `getStoreById` helper.

/** Pseudo-category for the cross-cutting "Fast Food" chip (not a real cuisine). */
export const FAST_FOOD_CATEGORY = "Fast Food";

/** Preferred display order for the Home category chips. */
const CATEGORY_ORDER = [
  "Western",
  "Japanese",
  "Korean",
  "Chinese",
  "Filipino",
  "Local",
  "Drinks",
];

/** Category chips actually backed by a shop, in display order (Fast Food leads). */
function computeCategories(stores: Store[]): string[] {
  const present = new Set(stores.flatMap((s) => s.categories));
  const ordered = CATEGORY_ORDER.filter((c) => present.has(c));
  const extra = [...present].filter((c) => !CATEGORY_ORDER.includes(c)).sort();
  const cuisines = [...ordered, ...extra];
  return stores.some((s) => s.fastFood)
    ? [FAST_FOOD_CATEGORY, ...cuisines]
    : cuisines;
}

type StoresState = {
  stores: Store[];
  byId: Record<string, Store>;
  categories: string[];
  /** True once a load attempt has finished (success or failure). */
  loaded: boolean;
  /** True if loading failed or produced no shops. */
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

/** Non-reactive lookup for use outside React components (stores, lib helpers). */
export function getStoreById(id: string): Store | undefined {
  return useStores.getState().byId[id];
}

/** Stores belonging to a Home category chip (handles the Fast Food pseudo-cat). */
export function storesInCategory(category: string): Store[] {
  const { stores } = useStores.getState();
  if (category === FAST_FOOD_CATEGORY) return stores.filter((s) => s.fastFood);
  return stores.filter((s) => s.categories.includes(category));
}
