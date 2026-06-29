// Pure points + shop-loyalty helpers. No DOM / store access here so they're
// easy to test and reuse.

/**
 * Loyalty tier names, tongue-in-cheek, from tier 1 upward. Tier 0 = no loyalty.
 * The list length sets MAX_TIER (the plan allows up to 10 tiers).
 */
export const TIER_NAMES = [
  "Typical Customer", // 1
  "Regular", // 2
  "Member", // 3
  "Patreon", // 4
  "Platinum Patreon", // 5
  "Certified Foodie", // 6
  "Living Legend", // 7
];

/** Highest loyalty tier a shop can reach. */
export const MAX_TIER = TIER_NAMES.length;

/** Friendly name for a tier (0 → "Newcomer"). */
export function tierName(tier: number): string {
  if (tier <= 0) return "Newcomer";
  return TIER_NAMES[Math.min(tier, MAX_TIER) - 1];
}

/** Points multiplier for a tier: tier 0 → 1.0×, MAX_TIER → 2.0×, linear between. */
export function multiplierForTier(tier: number): number {
  const t = Math.max(0, Math.min(MAX_TIER, tier));
  return Math.round((1 + t / MAX_TIER) * 100) / 100;
}

/** Base points for an order before any multipliers: $1 → 1 point. */
export function basePointsFor(orderTotal: number): number {
  return Math.floor(orderTotal);
}

/** Final points awarded for an order, given the shop tier and any bonus mult. */
export function pointsForOrder(
  orderTotal: number,
  tier: number,
  bonusMultiplier = 1,
): number {
  return Math.round(basePointsFor(orderTotal) * multiplierForTier(tier) * bonusMultiplier);
}
