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

/** Highest loyalty level a shop can reach. */
export const MAX_TIER = TIER_NAMES.length;
export const MAX_LEVEL = MAX_TIER;

/** Friendly name for a level (0 → "Newcomer"). */
export function tierName(tier: number): string {
  if (tier <= 0) return "Newcomer";
  return TIER_NAMES[Math.min(tier, MAX_TIER) - 1];
}

/** Points multiplier for a level: 0 → 1.0×, MAX_LEVEL → 2.0×, linear between. */
export function multiplierForTier(tier: number): number {
  const t = Math.max(0, Math.min(MAX_TIER, tier));
  return Math.round((1 + t / MAX_TIER) * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────
// LOYALTY MODEL  ·  tweak these knobs to taste
// ─────────────────────────────────────────────────────────────────────────
// Loyalty is tracked as XP per shop; your LEVEL is derived from accumulated XP.
// This makes levelling up steady and rewarding, while a defection to another
// shop only chips a little XP off — so loyalty is easy to grow, hard to lose.
//
//   • XP earned for an order        = round(orderTotal · XP_PER_DOLLAR) + XP_PER_VISIT
//   • XP lost when you order from    = XP_SWITCH_PENALTY   (off your *previous* shop only)
//     a different shop than last
//   • XP needed to REACH level L     = XP_STEP · L·(L+1)/2   (a gentle, widening curve)
//
// Defaults below — reaching each level (≈$13 order ⇒ ~18 XP):
//   Lv1 20xp(~1 order)  Lv2 60(~3)  Lv3 120(~7)  Lv4 200(~11)
//   Lv5 300(~17)        Lv6 420(~24) Lv7 560(~32)
// Dropping a level needs losing a *whole step* of XP — e.g. ~12 defections to
// fall from Lv3 to Lv2 — so straying occasionally barely dents your standing.

export const XP_PER_DOLLAR = 1; // XP per $1 of the order subtotal
export const XP_PER_VISIT = 5; // flat XP just for ordering
export const XP_SWITCH_PENALTY = 5; // XP the previous shop loses when you stray
export const XP_STEP = 20; // scales the whole level curve

/** Total XP required to reach a given level (triangular curve). */
export function xpForLevel(level: number): number {
  const L = Math.max(0, level);
  return (XP_STEP * L * (L + 1)) / 2;
}

/** The loyalty level for a given amount of accumulated XP (capped at MAX_LEVEL). */
export function levelForXp(xp: number): number {
  if (xp <= 0) return 0;
  // Inverse of xpForLevel: solve XP_STEP·L(L+1)/2 ≤ xp for the largest integer L.
  const L = Math.floor((Math.sqrt(1 + (8 * xp) / XP_STEP) - 1) / 2);
  return Math.min(MAX_LEVEL, L);
}

/** XP gained for a single order of the given total. */
export function xpForOrder(orderTotal: number): number {
  return Math.round(orderTotal * XP_PER_DOLLAR) + XP_PER_VISIT;
}

/** Progress (0–1) from the current level toward the next; 1 at max level. */
export function levelProgress(xp: number): number {
  const level = levelForXp(xp);
  if (level >= MAX_LEVEL) return 1;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return ceil === floor ? 1 : (xp - floor) / (ceil - floor);
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
