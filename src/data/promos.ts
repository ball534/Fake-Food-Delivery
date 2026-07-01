export type PromoEffect =
  | "points2x"
  | "points3x"
  | "points5x"
  | "loyalty2x"
  | "loyalty3x"
  | "freeexpress"
  | "bonus100"
  | "bonus250"
  | "bonus500";

export type DealKind = "code" | "combo" | "item";

export type Deal = {
  kind: DealKind;
  emoji: string;
  title: string;
  sub: string;
  code?: string;
  effect?: PromoEffect;
  storeId?: string;
  price?: number;
  originalPrice?: number;
};

// What each promo effect actually does at checkout. `pointsMultiplier` scales
// the points earned, `loyaltyMultiplier` scales loyalty XP gain, `bonusPoints`
// is a flat grant added on top, and `freeExpress` waives the Express fee.
export type EffectConfig = {
  label: string;
  pointsMultiplier?: number;
  loyaltyMultiplier?: number;
  bonusPoints?: number;
  freeExpress?: boolean;
};

export const EFFECTS: Record<PromoEffect, EffectConfig> = {
  points2x: { label: "2× points on this order", pointsMultiplier: 2 },
  points3x: { label: "3× points on this order", pointsMultiplier: 3 },
  points5x: { label: "5× points on this order", pointsMultiplier: 5 },
  loyalty2x: { label: "Double loyalty gain this order", loyaltyMultiplier: 2 },
  loyalty3x: { label: "Triple loyalty gain this order", loyaltyMultiplier: 3 },
  freeexpress: { label: "Free Express delivery", freeExpress: true },
  bonus100: { label: "+100 bonus points, on us", bonusPoints: 100 },
  bonus250: { label: "+250 bonus points, on us", bonusPoints: 250 },
  bonus500: { label: "+500 bonus points, on us", bonusPoints: 500 },
};

// Back-compat alias: a plain effect → label lookup.
export const EFFECT_LABEL: Record<PromoEffect, string> = Object.fromEntries(
  (Object.entries(EFFECTS) as [PromoEffect, EffectConfig][]).map(([k, v]) => [k, v.label]),
) as Record<PromoEffect, string>;

export const ROTATION_MS = 10 * 60 * 1000;

// Single source of truth for every promo code. PROMO_CODES (checkout
// validation) and DEFAULT_DEALS (the rotation banners) are both derived from
// this list so they can never drift. Keep public/content.json in sync — its
// `deals` array is the same catalog authored as JSON (without `kind`, since
// content.json deals are always promo codes).
export type PromoCatalogEntry = {
  code: string;
  effect: PromoEffect;
  emoji: string;
  title: string;
  sub: string;
};

export const PROMO_CATALOG: PromoCatalogEntry[] = [
  // 2× points
  { code: "DOUBLEUP", effect: "points2x", emoji: "✨", title: "Double points day", sub: "2× points — tap to copy the code" },
  { code: "POINTSPARTY", effect: "points2x", emoji: "✨", title: "Points party", sub: "Everything earns 2× points — tap to copy" },
  { code: "STACKUP", effect: "points2x", emoji: "✨", title: "Stack 'em up", sub: "Double points this order — tap to copy" },
  { code: "BONUSPTS", effect: "points2x", emoji: "✨", title: "Bonus points blast", sub: "2× points at checkout — tap to copy" },
  { code: "POINTSTORM", effect: "points2x", emoji: "✨", title: "Points storm", sub: "Twice the points — tap to copy" },
  { code: "SCOREBIG", effect: "points2x", emoji: "✨", title: "Score big", sub: "2× points, bigger rewards — tap to copy" },
  { code: "POINTPUSH", effect: "points2x", emoji: "✨", title: "Point push", sub: "Double your points — tap to copy" },
  // 3× points
  { code: "TRIPLEPTS", effect: "points3x", emoji: "🌟", title: "Triple points treat", sub: "3× points this order — tap to copy" },
  { code: "POINTS3X", effect: "points3x", emoji: "🌟", title: "Points times three", sub: "Earn 3× points — tap to copy" },
  { code: "MEGAPOINTS", effect: "points3x", emoji: "🌟", title: "Mega points mode", sub: "3× points at checkout — tap to copy" },
  // 5× points
  { code: "POINTS5X", effect: "points5x", emoji: "💥", title: "Points overload", sub: "A massive 5× points — tap to copy" },
  { code: "FIVEXFRENZY", effect: "points5x", emoji: "💥", title: "5× frenzy", sub: "Quintuple your points — tap to copy" },
  // Double loyalty gain
  { code: "LOYALMAX", effect: "loyalty2x", emoji: "💜", title: "Loyalty in overdrive", sub: "Double loyalty gain — tap to copy" },
  { code: "TIERUP", effect: "loyalty2x", emoji: "💜", title: "Tier up faster", sub: "2× loyalty progress — tap to copy" },
  { code: "VIPCLIMB", effect: "loyalty2x", emoji: "💜", title: "VIP climb", sub: "Double loyalty this order — tap to copy" },
  { code: "LOVEBACK", effect: "loyalty2x", emoji: "💜", title: "Loyalty love", sub: "Twice the loyalty gain — tap to copy" },
  { code: "RANKUP", effect: "loyalty2x", emoji: "💜", title: "Rank up rush", sub: "Double loyalty gain — tap to copy" },
  { code: "GOLDPATH", effect: "loyalty2x", emoji: "💜", title: "Golden path", sub: "2× loyalty toward your next tier — tap to copy" },
  { code: "LOYAL2X", effect: "loyalty2x", emoji: "💜", title: "Loyalty doubler", sub: "Double loyalty gain — tap to copy" },
  // Triple loyalty gain
  { code: "LOYALTY3X", effect: "loyalty3x", emoji: "💖", title: "Loyalty triple threat", sub: "3× loyalty gain — tap to copy" },
  { code: "TRIPLELOYAL", effect: "loyalty3x", emoji: "💖", title: "Triple loyalty boost", sub: "Triple your loyalty progress — tap to copy" },
  // Free Express delivery
  { code: "ZOOMZOOM", effect: "freeexpress", emoji: "⚡", title: "Free Express delivery", sub: "Skip the wait — tap to copy" },
  { code: "FASTLANE", effect: "freeexpress", emoji: "⚡", title: "Fast lane, free", sub: "Free Express delivery — tap to copy" },
  { code: "SPEEDFREE", effect: "freeexpress", emoji: "⚡", title: "Speed's on us", sub: "Free Express delivery — tap to copy" },
  { code: "NOWAIT", effect: "freeexpress", emoji: "⚡", title: "No waiting around", sub: "Free Express delivery — tap to copy" },
  { code: "FLASHRIDE", effect: "freeexpress", emoji: "⚡", title: "Flash ride", sub: "Express delivery, free — tap to copy" },
  { code: "QUICKDROP", effect: "freeexpress", emoji: "⚡", title: "Quick drop", sub: "Free Express delivery — tap to copy" },
  { code: "TURBODROP", effect: "freeexpress", emoji: "⚡", title: "Turbo drop", sub: "Free Express delivery — tap to copy" },
  // Free bonus points
  { code: "FREE100", effect: "bonus100", emoji: "🎁", title: "100 points, on us", sub: "+100 bonus points free — tap to copy" },
  { code: "GIFT100", effect: "bonus100", emoji: "🎁", title: "Gift of 100", sub: "+100 points, our treat — tap to copy" },
  { code: "FREE250", effect: "bonus250", emoji: "🎁", title: "250 points free", sub: "+250 bonus points free — tap to copy" },
  { code: "BONUS250", effect: "bonus250", emoji: "🎁", title: "Big 250 bonus", sub: "+250 points added — tap to copy" },
  { code: "FREE500", effect: "bonus500", emoji: "🎁", title: "500 points jackpot", sub: "+500 bonus points free — tap to copy" },
  { code: "JACKPOT500", effect: "bonus500", emoji: "🎁", title: "Jackpot 500", sub: "+500 points, on the house — tap to copy" },
];

export const PROMO_CODES: Record<string, { effect: PromoEffect; emoji: string }> =
  Object.fromEntries(
    PROMO_CATALOG.map((p) => [p.code, { effect: p.effect, emoji: p.emoji }]),
  );

// Only promo *codes* live in the global pool. Per-shop combo/item deals are
// defined in each shop's shop.json and merged into the rotation at runtime
// (see useDealPool in contentStore).
export const DEFAULT_DEALS: Deal[] = PROMO_CATALOG.map((p) => ({
  kind: "code",
  emoji: p.emoji,
  title: p.title,
  sub: p.sub,
  code: p.code,
  effect: p.effect,
}));

function currentSlot(now: number): number {
  return Math.floor(now / ROTATION_MS);
}

export function msUntilRotation(now: number): number {
  return ROTATION_MS - (now % ROTATION_MS);
}

export function selectDeal(pool: Deal[], now: number): Deal {
  const deals = pool.length > 0 ? pool : DEFAULT_DEALS;
  return deals[currentSlot(now) % deals.length];
}

const DEAL_KINDS = new Set<DealKind>(["code", "combo", "item"]);
const isEffect = (v: unknown): v is PromoEffect =>
  typeof v === "string" && v in EFFECTS;

const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;
const str = (v: unknown): string => (typeof v === "string" ? v : "");

export function parseDealsJson(value: unknown): Deal[] {
  if (!Array.isArray(value)) return [];
  const deals: Deal[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const title = str(r.title);
    if (!title) continue;
    // content.json deals omit `kind` — they're always promo codes. Anything
    // with an explicit valid kind (combo/item) is honoured; otherwise "code".
    const kind = DEAL_KINDS.has(r.kind as DealKind) ? (r.kind as DealKind) : "code";

    deals.push({
      kind,
      emoji: str(r.emoji),
      title,
      sub: str(r.sub),
      code: str(r.code) || undefined,
      effect: isEffect(r.effect) ? r.effect : undefined,
      storeId: str(r.storeId) || undefined,
      price: num(r.price),
      originalPrice: num(r.originalPrice),
    });
  }
  return deals;
}
