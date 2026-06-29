// The Home "Special Deal" — one deal at a time, rotating every 10 minutes
// through a pool of three kinds: redeemable promo codes, special combos, and
// limited-time items.

/** Effects a promo code can apply when redeemed at checkout. */
export type PromoEffect = "points2x" | "loyalty2x" | "freeexpress";

export type DealKind = "code" | "combo" | "item";

export type Deal = {
  id: string;
  kind: DealKind;
  emoji: string;
  title: string;
  sub: string;
  /** Present for code deals — the code to redeem at checkout. */
  code?: string;
  effect?: PromoEffect;
};

/** Human-readable description of each effect (shown when a code is applied). */
export const EFFECT_LABEL: Record<PromoEffect, string> = {
  points2x: "2× points on this order",
  loyalty2x: "Double loyalty gain this order",
  freeexpress: "Free Express delivery",
};

/** How often the Special Deal rotates. */
export const ROTATION_MS = 10 * 60 * 1000; // 10 minutes

// Redeemable codes, keyed by the (upper-cased) code the user types in.
export const PROMO_CODES: Record<string, { effect: PromoEffect; emoji: string }> = {
  DOUBLEUP: { effect: "points2x", emoji: "✨" },
  LOYALMAX: { effect: "loyalty2x", emoji: "💜" },
  ZOOMZOOM: { effect: "freeexpress", emoji: "⚡" },
};

const POOL: Deal[] = [
  // --- Redeemable promo codes ---
  { id: "code-doubleup", kind: "code", emoji: "✨", title: "Double points day", sub: "2× points — tap to copy the code", code: "DOUBLEUP", effect: "points2x" },
  { id: "code-loyalmax", kind: "code", emoji: "💜", title: "Loyalty in overdrive", sub: "Double loyalty gain — tap to copy", code: "LOYALMAX", effect: "loyalty2x" },
  { id: "code-zoomzoom", kind: "code", emoji: "⚡", title: "Free Express delivery", sub: "Skip the wait — tap to copy", code: "ZOOMZOOM", effect: "freeexpress" },

  // --- Special combos ---
  { id: "combo-bogo-boba", kind: "combo", emoji: "🧋", title: "1-for-1 Bubble Tea", sub: "KOI Thé & LiHO · today only" },
  { id: "combo-wings-bogo", kind: "combo", emoji: "🍗", title: "Buy 3 Get 1 Free Wings", sub: "4Fingers · mix any sauce" },
  { id: "combo-mcdouble", kind: "combo", emoji: "🍔", title: "McSpicy + McCrispy Double Meal", sub: "McDonald's exclusive set" },
  { id: "combo-whopper-duo", kind: "combo", emoji: "👑", title: "Whopper Duo Box", sub: "2 Whoppers + 2 fries + 2 drinks" },

  // --- Limited-time items ---
  { id: "item-seaweed-fries", kind: "item", emoji: "🍟", title: "Seaweed Shaker Fries", sub: "McDonald's · back for a limited run" },
  { id: "item-truffle-burger", kind: "item", emoji: "🍔", title: "Truffle Wagyu Burger", sub: "Burger King · new drop" },
  { id: "item-saltedegg-popcorn", kind: "item", emoji: "🧂", title: "Salted Egg Popcorn Chicken", sub: "KFC · while stocks last" },
  { id: "item-matcha-soft", kind: "item", emoji: "🍦", title: "Matcha Soft Serve", sub: "Mr Bean · seasonal special" },
];

/** Current rotation slot for a given time. */
function currentSlot(now: number): number {
  return Math.floor(now / ROTATION_MS);
}

/** Milliseconds until the deal rotates again. */
export function msUntilRotation(now: number): number {
  return ROTATION_MS - (now % ROTATION_MS);
}

/** The single Special Deal to show right now. */
export function selectDeal(now: number): Deal {
  return POOL[currentSlot(now) % POOL.length];
}
