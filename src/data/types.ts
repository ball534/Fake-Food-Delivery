// Domain types — also the schema for the static seed data in `stores.json`.
// These are 100% platform-agnostic (no DOM / web APIs) so they port to
// React Native unchanged.

export type MenuCategoryType =
  | "set_meal"
  | "a_la_carte"
  | "side"
  | "drink"
  | "dessert";

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
  /** Emoji used as a lightweight, license-free "photo". See §8 / §13 Q5. */
  emoji: string;
  basePrice: number; // fake credits
  options?: ItemOption[];
  tags?: string[]; // "spicy", "popular", "new"
};

export type MenuCategory = {
  type: MenuCategoryType;
  label: string;
  items: MenuItem[];
};

export type Store = {
  id: string;
  name: string;
  /** Broad cuisine bucket — the Home filter chips + the card subtitle (e.g. "Western"). */
  cuisine: string;
  /** Emoji logo + a tailwind gradient for the banner — keeps assets free. */
  emoji: string;
  bannerFrom: string; // tailwind color stop, e.g. "#fbbf24"
  bannerTo: string;
  rating: number; // 4.0–4.9
  etaMinutes: [number, number];
  distanceKm: number;
  priceLevel: 1 | 2 | 3; // $ / $$ / $$$ (rough)
  menu: MenuCategory[];
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
  storeEmoji: string;
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
};

export type UserProfile = {
  name: string;
  email: string;
  emoji: string; // avatar
  /** Total reward points earned across all orders. */
  points: number;
  /** Loyalty tier (0–MAX_TIER) per store id. */
  loyalty: Record<string, number>;
  /** The store you most recently built loyalty with (drops when you switch). */
  lastLoyaltyShopId: string | null;
  addresses: Address[];
  selectedAddressId: string;
};
