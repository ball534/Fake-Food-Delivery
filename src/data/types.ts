// Domain types — also the schema for the static seed data in `stores.json`.
// These are 100% platform-agnostic (no DOM / web APIs) so they port to
// React Native unchanged.

export type ItemOptionChoice = {
  id: string;
  label: string;
  priceDelta: number; // added to base price (fake credits)
};

export type ItemOption = {
  id: string;
  label: string; // "Size", "Add-ons", "Spice level"
  choices: ItemOptionChoice[];
  required?: boolean;
  multiSelect?: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  /** Item image URL, resolved from the shop folder (e.g. /shops/mcd/icons/x.png). */
  icon: string;
  /** Optional emoji — used only by snapshot items added straight from a promo/deal. */
  emoji?: string;
  basePrice: number; // fake credits
  options?: ItemOption[];
  tags?: string[]; // "spicy", "popular", "new"
};

export type MenuCategory = {
  /** Section heading shown on the store page, e.g. "Set Meals", "Drinks". */
  label: string;
  items: MenuItem[];
};

export type Store = {
  id: string;
  name: string;
  /** Primary cuisine bucket (categories[0]) — the card subtitle (e.g. "Western"). */
  cuisine: string;
  /** Every cuisine bucket this shop belongs to — drives the Home filter chips. */
  categories: string[];
  /** Whether this shop is surfaced by the cross-cutting "Fast Food" chip. */
  fastFood: boolean;
  /** Banner image URL (shops/<id>/banner.png) — text fallback if absent. */
  banner: string;
  /** Square brand-logo image URL (shops/<id>/logo.png) — text fallback if absent. */
  logo: string;
  rating: number; // 4.0–4.9
  priceLevel: 1 | 2 | 3; // $ / $$ / $$$ (rough)
  menu: MenuCategory[];
  /** Fake customer reviews shown on the store page. */
  reviews: Review[];
  // NOTE: delivery time + distance are NOT stored here — they are derived at
  // runtime from the chosen delivery address (see lib/delivery.ts), so they
  // re-roll whenever the drop-off location changes.
};

/** A fake customer review shown on the store page. */
export type Review = {
  id: string;
  author: string;
  emoji: string; // avatar
  rating: number; // 1–5
  text: string;
  daysAgo: number;
};

// ---- User-data shapes (live in localStorage) ----

export type SelectedChoice = {
  optionId: string;
  choiceId: string;
};

export type CartLine = {
  /** Unique per cart line so two customisations of one item don't merge. */
  lineId: string;
  itemId: string;
  storeId: string;
  qty: number;
  selectedChoices: SelectedChoice[];
  note?: string;
  unitPrice: number; // base + option deltas
  lineTotal: number; // unitPrice * qty
  /** Display snapshot — lets lines render even when the item isn't in the
   *  live store menu (e.g. a promo "Special Deal" added straight from a banner). */
  name?: string;
  /** Image URL snapshot for real menu items. */
  icon?: string;
  /** Emoji snapshot for promo/deal items that have no image. */
  emoji?: string;
};

export type Cart = {
  storeId: string | null;
  lines: CartLine[];
};

export type OrderStatus = "preparing" | "delivering" | "delivered";

export type DeliverySpeed = "regular" | "saver" | "express";

export type Driver = {
  name: string;
  emoji: string;
};

/** A real-world latitude/longitude, used for the Leaflet map. */
export type GeoPoint = { lat: number; lng: number };

export type Order = {
  id: string;
  storeId: string;
  storeName: string;
  /** Brand-logo image URL snapshot, for the order list/receipt. */
  storeLogo?: string;
  /** Legacy emoji snapshot — kept for orders placed before the image switch. */
  storeEmoji?: string;
  lines: CartLine[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  placedAt: number; // epoch ms
  /** Absolute timestamps for each stage transition (epoch ms). */
  stageTimes: Record<OrderStatus, number>;
  etaAt: number; // when "delivered" is expected
  driver: Driver;
  address: string;
  /** The label the user saved this drop-off under (e.g. "Home", "Work"). */
  addressLabel?: string;
  rating?: number;
  /** Reward points earned for this order (base × loyalty multiplier). */
  pointsEarned: number;
  deliverySpeed: DeliverySpeed;
  promoCode?: string;
  /** Imaginary store location + the drop-off, for the map. */
  storeLoc: GeoPoint;
  dropLoc: GeoPoint;
};

export type Address = {
  id: string;
  label: string; // "Home", "Work"
  line: string;
  /** Real coordinates for this address (from autocomplete / GPS), used for the
   *  delivery map. Absent for hand-typed addresses — the map falls back then. */
  loc?: GeoPoint;
};

export type UserProfile = {
  name: string;
  email: string;
  emoji: string; // avatar
  /** Total reward points earned across all orders. */
  points: number;
  /** Accumulated loyalty XP per store id (level is derived from it — see lib/loyalty.ts). */
  loyalty: Record<string, number>;
  /** The store you most recently built loyalty with (drops when you switch). */
  lastLoyaltyShopId: string | null;
  addresses: Address[];
  selectedAddressId: string;
};
