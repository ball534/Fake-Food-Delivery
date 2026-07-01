import type { Deal } from "./promos";

export type ItemOptionChoice = {
  id: string;
  label: string;
  priceDelta: number;
};

export type ItemOption = {
  id: string;
  label: string;
  choices: ItemOptionChoice[];
  required?: boolean;
  multiSelect?: boolean;
  min?: number;
  max?: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoji?: string;
  basePrice: number;
  options?: ItemOption[];
};

export type MenuCategory = {
  label: string;
  items: MenuItem[];
};

export type Store = {
  id: string;
  name: string;
  cuisine: string;
  categories: string[];
  banner: string;
  logo: string;
  rating: number;
  priceLevel: 1 | 2 | 3;
  menu: MenuCategory[];
  deals: Deal[];
  reviews: Review[];
};

export type Review = {
  author: string;
  rating: number;
  text: string;
};

export type SelectedChoice = {
  optionId: string;
  choiceId: string;
};

export type CartLine = {
  lineId: string;
  itemId: string;
  storeId: string;
  qty: number;
  selectedChoices: SelectedChoice[];
  note?: string;
  unitPrice: number;
  lineTotal: number;
  name?: string;
  icon?: string;
  emoji?: string;
  // Points spent at checkout to redeem this line (combo/item deals only). The
  // cost is per redeemed line, independent of qty. Absent for normal items.
  pointsCost?: number;
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

export type GeoPoint = { lat: number; lng: number };

export type Order = {
  id: string;
  storeId: string;
  storeName: string;
  storeLogo?: string;
  storeEmoji?: string;
  lines: CartLine[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  placedAt: number;
  stageTimes: Record<OrderStatus, number>;
  etaAt: number;
  driver: Driver;
  address: string;
  addressLabel?: string;
  rating?: number;
  pointsEarned: number;
  deliverySpeed: DeliverySpeed;
  promoCode?: string;
  storeLoc: GeoPoint;
  dropLoc: GeoPoint;
};

export type Address = {
  id: string;
  label: string;
  line: string;
  loc?: GeoPoint;
};

export type UserProfile = {
  name: string;
  email: string;
  emoji: string;
  points: number;
  loyalty: Record<string, number>;
  lastLoyaltyShopId: string | null;
  addresses: Address[];
  selectedAddressId: string;
};
