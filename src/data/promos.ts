export type PromoEffect = "points2x" | "loyalty2x" | "freeexpress";

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

export const EFFECT_LABEL: Record<PromoEffect, string> = {
  points2x: "2× points on this order",
  loyalty2x: "Double loyalty gain this order",
  freeexpress: "Free Express delivery",
};

export const ROTATION_MS = 10 * 60 * 1000;

export const PROMO_CODES: Record<string, { effect: PromoEffect; emoji: string }> = {
  DOUBLEUP: { effect: "points2x", emoji: "✨" },
  LOYALMAX: { effect: "loyalty2x", emoji: "💜" },
  ZOOMZOOM: { effect: "freeexpress", emoji: "⚡" },
};

// Only promo *codes* live in the global pool. Per-shop combo/item deals are
// defined in each shop's shop.json and merged into the rotation at runtime
// (see useDealPool in contentStore).
export const DEFAULT_DEALS: Deal[] = [
  { kind: "code", emoji: "✨", title: "Double points day", sub: "2× points — tap to copy the code", code: "DOUBLEUP", effect: "points2x" },
  { kind: "code", emoji: "💜", title: "Loyalty in overdrive", sub: "Double loyalty gain — tap to copy", code: "LOYALMAX", effect: "loyalty2x" },
  { kind: "code", emoji: "⚡", title: "Free Express delivery", sub: "Skip the wait — tap to copy", code: "ZOOMZOOM", effect: "freeexpress" },
];

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
const EFFECTS = new Set<PromoEffect>(["points2x", "loyalty2x", "freeexpress"]);

const num = (v: unknown): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;
const str = (v: unknown): string => (typeof v === "string" ? v : "");

export function parseDealsJson(value: unknown): Deal[] {
  if (!Array.isArray(value)) return [];
  const deals: Deal[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const kind = r.kind as DealKind;
    const title = str(r.title);
    if (!title || !DEAL_KINDS.has(kind)) continue;

    const effect = r.effect as PromoEffect;
    deals.push({
      kind,
      emoji: str(r.emoji),
      title,
      sub: str(r.sub),
      code: str(r.code) || undefined,
      effect: EFFECTS.has(effect) ? effect : undefined,
      storeId: str(r.storeId) || undefined,
      price: num(r.price),
      originalPrice: num(r.originalPrice),
    });
  }
  return deals;
}
