import type { DeliverySpeed } from "../data/types";

export type DeliveryOption = {
  id: DeliverySpeed;
  label: string;
  emoji: string;
  desc: string;
  minutes: [number, number];
  pointsMultiplier: number;
  pointsCost: number;
};

export const EXPRESS_COST = 150;

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

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function estimateMinutes(speed: DeliverySpeed, seed: string): number {
  const [min, max] = DELIVERY_BY_ID[speed].minutes;
  const frac = (hashSeed(`${seed}:${speed}`) % 1000) / 1000;
  return Math.round(min + frac * (max - min));
}

export function distanceFor(storeId: string, seed: string): number {
  const frac = (hashSeed(`${seed}:${storeId}:dist`) % 1000) / 1000;
  return Math.round((0.6 + frac * 4.2) * 10) / 10;
}

export function etaRangeFor(storeId: string, seed: string): [number, number] {
  const km = distanceFor(storeId, seed);
  const mid = Math.round(11 + km * 3.4);
  return [Math.max(10, mid - 3), mid + 4];
}
