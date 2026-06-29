import type { Driver, GeoPoint, Order, OrderStatus } from "../data/types";

// Order-lifecycle simulation. Pure helpers + timing config. No DOM here.
// The total delivery time depends on the chosen delivery speed (see
// lib/delivery.ts); the kitchen takes ~40% of it and the drive ~60%.

const PREPARING_SHARE = 0.4;

/**
 * The (imaginary) drop-off location used for the map. Geolocation is not used
 * (manual addresses only), so every order delivers to this fixed real point —
 * Marina Bay, Singapore — with the store pin placed a short distance away.
 */
export const DEFAULT_DROP: GeoPoint = { lat: 1.2834, lng: 103.8607 };

export const STATUS_LABEL: Record<OrderStatus, string> = {
  preparing: "Kitchen is preparing your meal",
  delivering: "Driver is out for delivery",
  delivered: "Delivered",
};

const DRIVER_NAMES = [
  "Wei Ming",
  "Siti",
  "Raj",
  "Hafiz",
  "Mei Ling",
  "Daniel",
  "Aisyah",
  "Kumar",
  "Jia Hui",
  "Faizal",
];
const DRIVER_EMOJI = ["🧑‍🦱", "👩", "🧔", "👨", "👩‍🦰", "🧑"];

/** Build a fake driver, varied by a seed (order placement time). */
export function generateDriver(seed: number): Driver {
  const n = Math.abs(Math.floor(seed));
  const name = DRIVER_NAMES[n % DRIVER_NAMES.length];
  const emoji = DRIVER_EMOJI[Math.floor(n / 3) % DRIVER_EMOJI.length];
  return { name, emoji };
}

/**
 * A plausible store location near the drop-off, derived deterministically from
 * the order seed so it's stable across renders. ~0.8–1.6 km away from `drop`.
 */
export function storeLocationFor(seed: number, drop: GeoPoint = DEFAULT_DROP): GeoPoint {
  const angle = (Math.abs(Math.sin(seed)) * Math.PI * 2);
  const radius = 0.008 + (Math.abs(Math.sin(seed * 1.7)) % 1) * 0.008; // degrees
  return {
    lat: drop.lat + radius * Math.cos(angle),
    lng: drop.lng + radius * Math.sin(angle),
  };
}

/**
 * Given the moment an order is placed and its total time (whole minutes),
 * compute absolute timestamps for each stage. `stageTimes[status]` = when the
 * order ENTERS that status.
 */
export function computeStageTimes(
  placedAt: number,
  totalMinutes: number,
): {
  stageTimes: Record<OrderStatus, number>;
  etaAt: number;
} {
  const totalMs = totalMinutes * 60 * 1000;
  const prepMs = totalMs * PREPARING_SHARE;
  const stageTimes = {} as Record<OrderStatus, number>;
  stageTimes.preparing = placedAt;
  stageTimes.delivering = placedAt + prepMs;
  stageTimes.delivered = placedAt + totalMs;
  return { stageTimes, etaAt: placedAt + totalMs };
}

/** Which status an order should be in right now, given its schedule. */
export function statusAt(order: Order, now: number): OrderStatus {
  if (now >= order.stageTimes.delivered) return "delivered";
  if (now >= order.stageTimes.delivering) return "delivering";
  return "preparing";
}

/** 0..1 progress along the store→drop route (only moves during "delivering"). */
export function deliveringProgress(order: Order, now: number): number {
  const start = order.stageTimes.delivering;
  const end = order.stageTimes.delivered;
  if (now <= start) return 0;
  if (now >= end || end <= start) return 1;
  return (now - start) / (end - start);
}

export function isActive(order: Order): boolean {
  return order.status !== "delivered";
}
