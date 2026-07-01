import { create } from "zustand";
import type { Cart, CartLine, MenuItem, SelectedChoice } from "../data/types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { computeUnitPrice } from "../lib/pricing";
import { makeId } from "../lib/id";

function emptyCart(): Cart {
  return { storeId: null, lines: [] };
}

type AddArgs = {
  item: MenuItem;
  storeId: string;
  qty: number;
  selectedChoices: SelectedChoice[];
  note?: string;
  pointsCost?: number;
};

type CartState = {
  cart: Cart;
  wouldReplace: (storeId: string) => boolean;
  addLine: (args: AddArgs) => void;
  setQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  reorder: (storeId: string, lines: CartLine[]) => void;
  itemCount: () => number;
  subtotal: () => number;
};

function persist(cart: Cart) {
  saveJSON(STORAGE_KEYS.cart, cart);
}

export const useCart = create<CartState>((set, get) => ({
  cart: loadJSON<Cart>(STORAGE_KEYS.cart, emptyCart()),

  wouldReplace: (storeId) => {
    const { cart } = get();
    return (
      cart.lines.length > 0 && cart.storeId !== null && cart.storeId !== storeId
    );
  },

  addLine: ({ item, storeId, qty, selectedChoices, note, pointsCost }) =>
    set((s) => {
      const unitPrice = computeUnitPrice(item, selectedChoices);
      const line: CartLine = {
        lineId: makeId("line-"),
        itemId: item.id,
        storeId,
        qty,
        selectedChoices,
        note: note?.trim() || undefined,
        unitPrice,
        lineTotal: Math.round(unitPrice * qty * 100) / 100,
        name: item.name,
        icon: item.icon || undefined,
        emoji: item.emoji,
        pointsCost: pointsCost && pointsCost > 0 ? pointsCost : undefined,
      };
      const switching = s.cart.storeId !== null && s.cart.storeId !== storeId;
      const cart: Cart = switching
        ? { storeId, lines: [line] }
        : { storeId, lines: [...s.cart.lines, line] };
      persist(cart);
      return { cart };
    }),

  setQty: (lineId, qty) =>
    set((s) => {
      const lines = s.cart.lines
        .map((l) =>
          l.lineId === lineId
            ? {
                ...l,
                qty,
                lineTotal: Math.round(l.unitPrice * qty * 100) / 100,
              }
            : l,
        )
        .filter((l) => l.qty > 0);
      const cart: Cart = {
        storeId: lines.length ? s.cart.storeId : null,
        lines,
      };
      persist(cart);
      return { cart };
    }),

  removeLine: (lineId) =>
    set((s) => {
      const lines = s.cart.lines.filter((l) => l.lineId !== lineId);
      const cart: Cart = {
        storeId: lines.length ? s.cart.storeId : null,
        lines,
      };
      persist(cart);
      return { cart };
    }),

  clear: () => {
    const cart = emptyCart();
    persist(cart);
    set({ cart });
  },

  reorder: (storeId, lines) => {
    const cart: Cart = {
      storeId,
      lines: lines.map((l) => ({ ...l, lineId: makeId("line-") })),
    };
    persist(cart);
    set({ cart });
  },

  itemCount: () => get().cart.lines.reduce((n, l) => n + l.qty, 0),

  subtotal: () =>
    Math.round(
      get().cart.lines.reduce((sum, l) => sum + l.lineTotal, 0) * 100,
    ) / 100,
}));
