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
  /** Present for combo/item deals — the shop the deal is featured at. */
  storeId?: string;
  /** Present for combo/item deals — the (fake) price when added to cart. */
  price?: number;
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

/**
 * Built-in fallback pool. The live pool is loaded from `public/deals.csv` at
 * startup (see store/contentStore.ts) so it can be edited without touching
 * code; this array is used only if that file is missing or fails to parse.
 */
export const DEFAULT_DEALS: Deal[] = [
  // --- Redeemable promo codes ---
  { id: "code-doubleup", kind: "code", emoji: "✨", title: "Double points day", sub: "2× points — tap to copy the code", code: "DOUBLEUP", effect: "points2x" },
  { id: "code-loyalmax", kind: "code", emoji: "💜", title: "Loyalty in overdrive", sub: "Double loyalty gain — tap to copy", code: "LOYALMAX", effect: "loyalty2x" },
  { id: "code-zoomzoom", kind: "code", emoji: "⚡", title: "Free Express delivery", sub: "Skip the wait — tap to copy", code: "ZOOMZOOM", effect: "freeexpress" },

  // --- Special combos ---
  { id: "combo-bogo-boba", kind: "combo", emoji: "🧋", title: "1-for-1 Bubble Tea", sub: "KOI Thé · today only", storeId: "koi", price: 4.2 },
  { id: "combo-wings-bogo", kind: "combo", emoji: "🍗", title: "Buy 3 Get 1 Free Wings", sub: "4Fingers · mix any sauce", storeId: "4fingers", price: 9.0 },
  { id: "combo-mcdouble", kind: "combo", emoji: "🍔", title: "McSpicy + McCrispy Double Meal", sub: "McDonald's exclusive set", storeId: "mcd", price: 12.9 },
  { id: "combo-whopper-duo", kind: "combo", emoji: "👑", title: "Whopper Duo Box", sub: "2 Whoppers + 2 fries + 2 drinks", storeId: "bk", price: 18.9 },

  // --- Limited-time items ---
  { id: "item-seaweed-fries", kind: "item", emoji: "🍟", title: "Seaweed Shaker Fries", sub: "McDonald's · back for a limited run", storeId: "mcd", price: 4.5 },
  { id: "item-truffle-burger", kind: "item", emoji: "🍔", title: "Truffle Wagyu Burger", sub: "Burger King · new drop", storeId: "bk", price: 11.9 },
  { id: "item-saltedegg-popcorn", kind: "item", emoji: "🧂", title: "Salted Egg Popcorn Chicken", sub: "KFC · while stocks last", storeId: "kfc", price: 6.5 },
  { id: "item-matcha-soft", kind: "item", emoji: "🍦", title: "Matcha Soft Serve", sub: "Mr Bean · seasonal special", storeId: "mrbean", price: 3.2 },
];

/** Current rotation slot for a given time. */
function currentSlot(now: number): number {
  return Math.floor(now / ROTATION_MS);
}

/** Milliseconds until the deal rotates again. */
export function msUntilRotation(now: number): number {
  return ROTATION_MS - (now % ROTATION_MS);
}

/** The single Special Deal to show right now, from the given pool. */
export function selectDeal(pool: Deal[], now: number): Deal {
  const deals = pool.length > 0 ? pool : DEFAULT_DEALS;
  return deals[currentSlot(now) % deals.length];
}

/** Valid deal kinds / effects, for validating CSV rows. */
const DEAL_KINDS = new Set<DealKind>(["code", "combo", "item"]);
const EFFECTS = new Set<PromoEffect>(["points2x", "loyalty2x", "freeexpress"]);

/** Split one CSV line into fields, honouring "double-quoted" values. */
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

/**
 * Parse the contents of `public/deals.csv` into a Deal pool. Expects a header
 * row of: id,kind,emoji,title,sub,code,effect,storeId,price (extra/blank
 * columns are tolerated). Invalid rows are skipped. Returns [] on total failure
 * so callers can fall back to DEFAULT_DEALS.
 */
export function parseDealsCsv(text: string): Deal[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const ci = {
    id: col("id"),
    kind: col("kind"),
    emoji: col("emoji"),
    title: col("title"),
    sub: col("sub"),
    code: col("code"),
    effect: col("effect"),
    storeId: col("storeid"),
    price: col("price"),
  };

  const deals: Deal[] = [];
  for (const line of lines.slice(1)) {
    const f = splitCsvLine(line);
    const get = (i: number) => (i >= 0 && i < f.length ? f[i] : "");
    const kind = get(ci.kind) as DealKind;
    const id = get(ci.id);
    const title = get(ci.title);
    if (!id || !title || !DEAL_KINDS.has(kind)) continue;

    const effectRaw = get(ci.effect) as PromoEffect;
    const priceRaw = get(ci.price);
    const price = priceRaw ? Number(priceRaw) : undefined;
    deals.push({
      id,
      kind,
      emoji: get(ci.emoji) || "🎁",
      title,
      sub: get(ci.sub),
      code: get(ci.code) || undefined,
      effect: EFFECTS.has(effectRaw) ? effectRaw : undefined,
      storeId: get(ci.storeId) || undefined,
      price: price !== undefined && Number.isFinite(price) ? price : undefined,
    });
  }
  return deals;
}
