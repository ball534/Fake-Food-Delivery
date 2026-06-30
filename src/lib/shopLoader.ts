import type {
  ItemOption,
  ItemOptionChoice,
  MenuCategory,
  MenuItem,
  Review,
  Store,
} from "../data/types";

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

function parseSection(raw: RawSection, idx: number, usedOpt: Set<string>): ItemOption {
  const usedChoice = new Set<string>();
  const choices: ItemOptionChoice[] = (raw.options ?? []).map((o, j) => ({
    id: uniqueSlug(slug(o.name) || `c-${j}`, usedChoice),
    label: o.name,
    priceDelta: Number(o.price) || 0,
  }));
  const multiSelect =
    raw.multiselect === true || raw.type === "multi-select" || raw.type === "multi";
  return {
    id: uniqueSlug(slug(raw.name) || `opt-${idx}`, usedOpt),
    label: raw.name,
    required: !!raw.required,
    multiSelect,
    min: multiSelect && typeof raw.min === "number" ? Math.max(0, raw.min) : undefined,
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
    icon: `${shopBase}/icons/${id}.png`,
    basePrice: Number(raw.price) || 0,
    options: (raw.section ?? []).map((s, i) => parseSection(s, i, usedOpt)),
    tags: raw.tags && raw.tags.length ? raw.tags : undefined,
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
