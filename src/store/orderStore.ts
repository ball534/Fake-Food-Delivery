import { create } from "zustand";
import type { CartLine, DeliverySpeed, Order } from "../data/types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { makeId } from "../lib/id";
import {
  DEFAULT_DROP,
  computeStageTimes,
  generateDriver,
  isActive,
  statusAt,
  storeLocationFor,
} from "../lib/simulation";
import { STORES_BY_ID } from "../data/stores";

type PlaceArgs = {
  storeId: string;
  lines: CartLine[];
  subtotal: number;
  total: number;
  address: string;
  addressLabel?: string;
  pointsEarned: number;
  deliverySpeed: DeliverySpeed;
  /** Concrete estimated delivery time (minutes), seeded by the drop-off. */
  etaMinutes: number;
  promoCode?: string;
};

type OrderState = {
  orders: Order[]; // newest first
  placeOrder: (args: PlaceArgs) => Order;
  /** Recompute statuses for all active orders; persists if anything changed. */
  tick: () => void;
  rateOrder: (orderId: string, rating: number) => void;
  getOrder: (orderId: string) => Order | undefined;
  activeOrders: () => Order[];
  pastOrders: () => Order[];
};

function persist(orders: Order[]) {
  saveJSON(STORAGE_KEYS.orders, orders);
}

export const useOrders = create<OrderState>((set, get) => ({
  orders: loadJSON<Order[]>(STORAGE_KEYS.orders, []),

  placeOrder: ({ storeId, lines, subtotal, total, address, addressLabel, pointsEarned, deliverySpeed, etaMinutes, promoCode }) => {
    const placedAt = Date.now();
    const { stageTimes, etaAt } = computeStageTimes(placedAt, etaMinutes);
    const store = STORES_BY_ID[storeId];
    const order: Order = {
      id: makeId("ord-"),
      storeId,
      storeName: store?.name ?? "Store",
      storeEmoji: store?.emoji ?? "🍽️",
      lines,
      subtotal,
      total,
      status: "preparing",
      placedAt,
      stageTimes,
      etaAt,
      driver: generateDriver(placedAt),
      address,
      addressLabel,
      pointsEarned,
      deliverySpeed,
      promoCode,
      storeLoc: storeLocationFor(placedAt),
      dropLoc: DEFAULT_DROP,
    };
    const orders = [order, ...get().orders];
    persist(orders);
    set({ orders });
    return order;
  },

  tick: () => {
    const now = Date.now();
    let changed = false;
    const orders = get().orders.map((o) => {
      if (!isActive(o)) return o;
      const next = statusAt(o, now);
      if (next !== o.status) {
        changed = true;
        return { ...o, status: next };
      }
      return o;
    });
    if (changed) {
      persist(orders);
      set({ orders });
    }
  },

  rateOrder: (orderId, rating) =>
    set((s) => {
      const orders = s.orders.map((o) =>
        o.id === orderId ? { ...o, rating } : o,
      );
      persist(orders);
      return { orders };
    }),

  getOrder: (orderId) => get().orders.find((o) => o.id === orderId),
  activeOrders: () => get().orders.filter(isActive),
  pastOrders: () => get().orders.filter((o) => !isActive(o)),
}));
