import type {
  ItemOption,
  ItemOptionChoice,
  MenuCategory,
  MenuItem,
  Review,
  Store,
} from "../data/types";
import { defaultDealPoints, type Deal, type DealKind } from "../data/promos";

export type RawOption = { name: string; price?: number };

export type RawSection = {
  name: string;
  multiselect?: boolean;
  min?: number;
  max?: number;
  required?: boolean;
  type?: string;
  options?: RawOption[];
};

export type RawFood = {
  name: string;
  description?: string;
  price?: number;
  emoji?: string;
  section?: RawSection[];
};

export type RawMenuGroup = { category: string; food?: RawFood[] };

export type RawReview = {
  author: string;
  emoji?: string;
  rating: number;
  text: string;
};

export type RawDeal = {
  kind?: string;
  emoji?: string;
  title: string;
  sub?: string;
  price?: number;
  originalPrice?: number;
  pointsCost?: number;
};

export type RawShop = {
  name: string;
  categories?: string[];
  pricelevel?: number;
  rating?: number;
  menu?: RawMenuGroup[];
  deals?: RawDeal[];
  reviews?: RawReview[];
};

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "x"
  );
}

function uniqueSlug(base: string, used: Set<string>): string {
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

function parseSection(
  raw: RawSection,
  idx: number,
  usedOpt: Set<string>,
): ItemOption {
  const usedChoice = new Set<string>();
  const choices: ItemOptionChoice[] = (raw.options ?? []).map((o, j) => ({
    id: uniqueSlug(slug(o.name) || `c-${j}`, usedChoice),
    label: o.name,
    priceDelta: Number(o.price) || 0,
  }));
  const multiSelect =
    raw.multiselect === true ||
    raw.type === "multi-select" ||
    raw.type === "multi";
  return {
    id: uniqueSlug(slug(raw.name) || `opt-${idx}`, usedOpt),
    label: raw.name,
    required: !!raw.required,
    multiSelect,
    min:
      multiSelect && typeof raw.min === "number"
        ? Math.max(0, raw.min)
        : undefined,
    max:
      multiSelect && typeof raw.max === "number"
        ? Math.min(choices.length, Math.max(1, raw.max))
        : undefined,
    choices,
  };
}

function parseFood(
  raw: RawFood,
  shopBase: string,
  usedItem: Set<string>,
): MenuItem {
  const id = uniqueSlug(slug(raw.name), usedItem);
  const usedOpt = new Set<string>();
  return {
    id,
    name: raw.name,
    description: raw.description ?? "",
    emoji: raw.emoji,
    icon: `${shopBase}/icons/${id}.webp`,
    basePrice: Number(raw.price) || 0,
    options: (raw.section ?? []).map((s, i) => parseSection(s, i, usedOpt)),
  };
}

export function parseShop(raw: RawShop, folderId: string, base: string): Store {
  const id = folderId;
  const shopBase = `${base}shops/${id}`;
  const categories = (raw.categories ?? []).filter(Boolean);
  const usedItem = new Set<string>();

  const menu: MenuCategory[] = (raw.menu ?? []).map((g) => ({
    label: g.category,
    items: (g.food ?? []).map((f) => parseFood(f, shopBase, usedItem)),
  }));

  const reviews: Review[] = (raw.reviews ?? []).map((r) => ({
    author: r.author,
    rating: r.rating,
    text: r.text,
  }));

  const deals: Deal[] = (raw.deals ?? [])
    .filter((d) => d && d.title)
    .map((d) => {
      const kind: DealKind = d.kind === "combo" ? "combo" : "item";
      const price = typeof d.price === "number" ? d.price : undefined;
      const originalPrice =
        typeof d.originalPrice === "number" && d.originalPrice > (price ?? 0)
          ? d.originalPrice
          : undefined;
      // Combo/item deals are point-redeemable. Honour an explicit pointsCost
      // (including 0 to make a deal free); otherwise derive one from its value.
      const pointsCost =
        typeof d.pointsCost === "number"
          ? Math.max(0, Math.round(d.pointsCost))
          : defaultDealPoints(price ?? 0);
      return {
        kind,
        emoji: d.emoji || "",
        title: d.title,
        sub: d.sub ?? "",
        storeId: id,
        price,
        originalPrice,
        pointsCost,
      };
    });

  const priceLevel = Math.min(
    3,
    Math.max(1, Math.round(raw.pricelevel ?? 1)),
  ) as 1 | 2 | 3;

  return {
    id,
    name: raw.name,
    cuisine: categories[0] ?? "Other",
    categories: categories.length ? categories : ["Other"],
    banner: `${shopBase}/banner.webp`,
    logo: `${shopBase}/logo.webp`,
    rating: typeof raw.rating === "number" ? raw.rating : 4.5,
    priceLevel,
    menu,
    deals,
    reviews,
  };
}

export async function loadShops(base: string): Promise<Store[]> {
  const res = await fetch(`${base}content.json`);
  if (!res.ok) throw new Error(`content.json: ${res.status}`);
  const data = (await res.json()) as { shops?: unknown };
  const ids = Array.isArray(data.shops)
    ? (data.shops.filter((s) => typeof s === "string") as string[])
    : [];

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
