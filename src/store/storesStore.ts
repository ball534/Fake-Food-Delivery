import { create } from "zustand";
import type { Store } from "../data/types";
import { loadShops } from "../lib/shopLoader";

export const FAST_FOOD_CATEGORY = "Fast Food";

const CATEGORY_ORDER = [
  "Western",
  "Japanese",
  "Korean",
  "Chinese",
  "Filipino",
  "Local",
  "Drinks",
];

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

export function storesInCategory(category: string): Store[] {
  const { stores } = useStores.getState();
  if (category === FAST_FOOD_CATEGORY) return stores.filter((s) => s.fastFood);
  return stores.filter((s) => s.categories.includes(category));
}
