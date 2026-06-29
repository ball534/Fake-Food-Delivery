import type { DeliverySpeed } from "../data/types";

// The three delivery speeds offered at checkout:
// Express spends points and is fastest; Saver is slow but earns bonus points.

export type DeliveryOption = {
  id: DeliverySpeed;
  label: string;
  emoji: string;
  desc: string;
  /** Total delivery time range, in real minutes. */
  minutes: [number, number];
  /** Multiplier applied to points earned. */
  pointsMultiplier: number;
  /** Points spent to choose this option (Express). */
  pointsCost: number;
};

export const EXPRESS_COST = 150;

// Each tier's time is a range we pick a value from per delivery address (see
// `estimateMinutes`). Centres land near Regular ~20, Saver ~30, Express ~12 min.
export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "regular",
    label: "Regular",
    emoji: "🛵",
    desc: "Standard delivery",
    minutes: [16, 24],
    pointsMultiplier: 1,
    pointsCost: 0,
  },
  {
    id: "saver",
    label: "Saver",
    emoji: "🐢",
    desc: "A little slower · earn +50% points",
    minutes: [26, 34],
    pointsMultiplier: 1.5,
    pointsCost: 0,
  },
  {
    id: "express",
    label: "Express",
    emoji: "⚡",
    desc: `Fastest · costs ${EXPRESS_COST} points`,
    minutes: [9, 15],
    pointsMultiplier: 1,
    pointsCost: EXPRESS_COST,
  },
];

export const DELIVERY_BY_ID: Record<DeliverySpeed, DeliveryOption> =
  Object.fromEntries(DELIVERY_OPTIONS.map((o) => [o.id, o])) as Record<
    DeliverySpeed,
    DeliveryOption
  >;

/** Stable 32-bit hash of a string (FNV-1a) — used to seed per-address timing. */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * The estimated delivery time (whole minutes) for a speed at a given drop-off.
 * Deterministic from the address `seed`, so it stays put across re-renders but
 * re-rolls to a fresh value whenever the delivery location changes.
 */
export function estimateMinutes(speed: DeliverySpeed, seed: string): number {
  const [min, max] = DELIVERY_BY_ID[speed].minutes;
  const frac = (hashSeed(`${seed}:${speed}`) % 1000) / 1000;
  return Math.round(min + frac * (max - min));
}
