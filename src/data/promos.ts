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

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseDealsCsv(text: string): Deal[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const ci = {
    kind: col("kind"),
    emoji: col("emoji"),
    title: col("title"),
    sub: col("sub"),
    code: col("code"),
    effect: col("effect"),
    storeId: col("storeid"),
    price: col("price"),
    originalPrice: col("originalprice"),
  };

  const deals: Deal[] = [];
  for (const line of lines.slice(1)) {
    const f = splitCsvLine(line);
    const get = (i: number) => (i >= 0 && i < f.length ? f[i] : "");
    const kind = get(ci.kind) as DealKind;
    const title = get(ci.title);
    if (!title || !DEAL_KINDS.has(kind)) continue;

    const effectRaw = get(ci.effect) as PromoEffect;
    const priceRaw = get(ci.price);
    const price = priceRaw ? Number(priceRaw) : undefined;
    const origRaw = get(ci.originalPrice);
    const originalPrice = origRaw ? Number(origRaw) : undefined;
    deals.push({
      kind,
      emoji: get(ci.emoji) || "🎁",
      title,
      sub: get(ci.sub),
      code: get(ci.code) || undefined,
      effect: EFFECTS.has(effectRaw) ? effectRaw : undefined,
      storeId: get(ci.storeId) || undefined,
      price: price !== undefined && Number.isFinite(price) ? price : undefined,
      originalPrice:
        originalPrice !== undefined && Number.isFinite(originalPrice)
          ? originalPrice
          : undefined,
    });
  }
  return deals;
}
