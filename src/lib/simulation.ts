import type { Driver, GeoPoint, Order, OrderStatus } from "../data/types";

const PREPARING_SHARE = 0.4;

export const DEFAULT_DROP: GeoPoint = { lat: 1.2834, lng: 103.8607 };

export const STATUS_LABEL: Record<OrderStatus, string> = {
  preparing: "Kitchen is preparing your meal",
  delivering: "Driver is out for delivery",
  delivered: "Delivered",
};

// Fallback pool used only when content.json has no `drivers` list (or it fails
// to load). The live names are authored in public/content.json and threaded in
// via generateDriver's `names` argument — see contentStore + orderStore.
export const DEFAULT_DRIVER_NAMES = [
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

export function generateDriver(
  seed: number,
  names: string[] = DEFAULT_DRIVER_NAMES,
): Driver {
  const pool = names.length > 0 ? names : DEFAULT_DRIVER_NAMES;
  const n = Math.abs(Math.floor(seed));
  const name = pool[n % pool.length];
  const emoji = DRIVER_EMOJI[Math.floor(n / 3) % DRIVER_EMOJI.length];
  return { name, emoji };
}

export function storeLocationFor(
  seed: number,
  drop: GeoPoint = DEFAULT_DROP,
): GeoPoint {
  const angle = Math.abs(Math.sin(seed)) * Math.PI * 2;
  const radius = 0.008 + (Math.abs(Math.sin(seed * 1.7)) % 1) * 0.008;
  return {
    lat: drop.lat + radius * Math.cos(angle),
    lng: drop.lng + radius * Math.sin(angle),
  };
}

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

export function statusAt(order: Order, now: number): OrderStatus {
  if (now >= order.stageTimes.delivered) return "delivered";
  if (now >= order.stageTimes.delivering) return "delivering";
  return "preparing";
}

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
