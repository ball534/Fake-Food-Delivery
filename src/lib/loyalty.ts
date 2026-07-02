const TIER_NAMES = [
  "Typical Customer",
  "Regular",
  "Member",
  "Patreon",
  "Platinum Patreon",
  "Certified Foodie",
  "Living Legend",
];

const MAX_TIER = TIER_NAMES.length;

export function tierName(tier: number): string {
  if (tier <= 0) return "Newcomer";
  return TIER_NAMES[Math.min(tier, MAX_TIER) - 1];
}

export function multiplierForTier(tier: number): number {
  const t = Math.max(0, Math.min(MAX_TIER, tier));
  return Math.round((1 + t / MAX_TIER) * 100) / 100;
}

const XP_PER_DOLLAR = 1;
const XP_PER_VISIT = 5;
export const XP_SWITCH_PENALTY = 5;
const XP_STEP = 20;

export function levelForXp(xp: number): number {
  if (xp <= 0) return 0;
  const L = Math.floor((Math.sqrt(1 + (8 * xp) / XP_STEP) - 1) / 2);
  return Math.min(MAX_TIER, L);
}

export function xpForOrder(orderTotal: number): number {
  return Math.round(orderTotal * XP_PER_DOLLAR) + XP_PER_VISIT;
}

export function basePointsFor(orderTotal: number): number {
  return Math.floor(orderTotal);
}

export function pointsForOrder(
  orderTotal: number,
  tier: number,
  bonusMultiplier = 1,
): number {
  return Math.round(
    basePointsFor(orderTotal) * multiplierForTier(tier) * bonusMultiplier,
  );
}
