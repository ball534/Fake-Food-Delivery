// Loads the data-driven shops from /public/shops at runtime and maps the
// on-disk JSON shape (see public/shops/example/shop.json and the README there)
// into the app's internal Store types.
//
// The file format is intentionally minimal/authorable — it carries no ids and
// no image paths. This module is the single seam that derives everything the UI
// needs from it: stable option/choice/item ids (which the cart relies on) and
// image URLs (by fixed convention: banner.png, logo.png, icons/<food>.png).
import type {
  ItemOption,
  ItemOptionChoice,
  MenuCategory,
  MenuItem,
  Review,
  Store,
} from "../data/types";

// ---- Raw on-disk shapes (what shop.json contains) ------------------------

export type RawOption = { name: string; price?: number };

export type RawSection = {
  name: string;
  /** "single-select" (radio) or "multi-select" (checkbox). Defaults to single. */
  type?: string;
  required?: boolean;
  options?: RawOption[];
};

export type RawFood = {
  name: string;
  description?: string;
  price?: number;
  tags?: string[];
  section?: RawSection[];
};

export type RawMenuGroup = { category: string; food?: RawFood[] };

export type RawReview = {
  author: string;
  emoji?: string;
  rating: number;
  text: string;
  daysAgo: number;
};

export type RawShop = {
  name: string;
  categories?: string[];
  fastfood?: boolean;
  pricelevel?: number;
  rating?: number;
  menu?: RawMenuGroup[];
  reviews?: RawReview[];
};

// ---- Helpers -------------------------------------------------------------

/** kebab-case slug — derives stable ids and image filenames from names. */
function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "x"
  );
}

/** Return a slug guaranteed unique within `used` (appends -2, -3, … on clash). */
function uniqueSlug(base: string, used: Set<string>): string {
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

function parseSection(raw: RawSection, idx: number, usedOpt: Set<string>): ItemOption {
  const usedChoice = new Set<string>();
  const choices: ItemOptionChoice[] = (raw.options ?? []).map((o, j) => ({
    id: uniqueSlug(slug(o.name) || `c-${j}`, usedChoice),
    label: o.name,
    priceDelta: Number(o.price) || 0,
  }));
  return {
    id: uniqueSlug(slug(raw.name) || `opt-${idx}`, usedOpt),
    label: raw.name,
    required: !!raw.required,
    multiSelect: raw.type === "multi-select" || raw.type === "multi",
    choices,
  };
}

function parseFood(
  raw: RawFood,
  shopBase: string,
  usedItem: Set<string>,
): MenuItem {
  // The item id and its image filename both derive from the name, so a dropped-in
  // icons/<id>.png lines up automatically.
  const id = uniqueSlug(slug(raw.name), usedItem);
  const usedOpt = new Set<string>();
  return {
    id,
    name: raw.name,
    description: raw.description ?? "",
    icon: `${shopBase}/icons/${id}.png`,
    basePrice: Number(raw.price) || 0,
    options: (raw.section ?? []).map((s, i) => parseSection(s, i, usedOpt)),
    tags: raw.tags && raw.tags.length ? raw.tags : undefined,
  };
}

/**
 * Map one raw shop.json blob into a fully-formed internal Store. `folderId` is
 * the shop's folder name, which serves as its id; images live alongside it by
 * fixed convention (banner.png / logo.png / icons/<food>.png).
 */
export function parseShop(raw: RawShop, folderId: string, base: string): Store {
  const id = folderId;
  const shopBase = `${base}shops/${id}`;
  const categories = (raw.categories ?? []).filter(Boolean);
  const usedItem = new Set<string>();

  const menu: MenuCategory[] = (raw.menu ?? []).map((g) => ({
    label: g.category,
    items: (g.food ?? []).map((f) => parseFood(f, shopBase, usedItem)),
  }));

  const reviews: Review[] = (raw.reviews ?? []).map((r, i) => ({
    id: `r-${id}-${i}`,
    author: r.author,
    emoji: r.emoji ?? "🙂",
    rating: r.rating,
    text: r.text,
    daysAgo: r.daysAgo,
  }));

  const priceLevel = Math.min(3, Math.max(1, Math.round(raw.pricelevel ?? 1))) as 1 | 2 | 3;

  return {
    id,
    name: raw.name,
    cuisine: categories[0] ?? "Other",
    categories: categories.length ? categories : ["Other"],
    fastFood: !!raw.fastfood,
    banner: `${shopBase}/banner.png`,
    logo: `${shopBase}/logo.png`,
    rating: typeof raw.rating === "number" ? raw.rating : 4.5,
    priceLevel,
    menu,
    reviews,
  };
}

/**
 * Fetch the shop index (built at build time — see scripts/build-shops-index.mjs)
 * and then every shop.json it lists, in parallel. A shop that fails to load is
 * skipped rather than breaking the whole catalogue.
 */
export async function loadShops(base: string): Promise<Store[]> {
  const idxRes = await fetch(`${base}index.json`);
  if (!idxRes.ok) throw new Error(`index.json: ${idxRes.status}`);
  const ids = (await idxRes.json()) as string[];

  const shops = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(`${base}shops/${id}/shop.json`);
        if (!res.ok) return null;
        return parseShop((await res.json()) as RawShop, id, base);
      } catch {
        return null;
      }
    }),
  );
  return shops.filter((s): s is Store => s !== null);
}
