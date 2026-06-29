import { create } from "zustand";
import type { Address, GeoPoint, UserProfile } from "../data/types";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { makeId } from "../lib/id";
import {
  multiplierForTier,
  pointsForOrder,
  levelForXp,
  xpForOrder,
  XP_SWITCH_PENALTY,
} from "../lib/loyalty";

export const MAX_ADDRESSES = 3;

function defaultProfile(): UserProfile {
  return {
    name: "User",
    email: "user@fakeeats.sim",
    emoji: "🦊",
    points: 0,
    loyalty: {},
    lastLoyaltyShopId: null,
    addresses: [], // start blank — the user adds their own
    selectedAddressId: "",
  };
}

export type PurchaseOpts = {
  /** Bonus multiplier on points (e.g. Saver 1.5×, or a 2× promo). */
  pointsMultiplier?: number;
  /** Multiplier on loyalty XP gained this order (default 1; a promo can double it). */
  loyaltyTiers?: number;
  /** Points spent (e.g. Express). */
  pointsSpent?: number;
};

export type PurchaseResult = {
  pointsEarned: number;
  pointsSpent: number;
  multiplier: number;
  newTier: number;
  droppedShopId: string | null;
};

type ProfileState = {
  profile: UserProfile;
  setName: (name: string) => void;
  setEmoji: (emoji: string) => void;
  addAddress: (label: string, line: string, loc?: GeoPoint) => boolean; // false if at max
  editAddress: (id: string, label: string, line: string, loc?: GeoPoint) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string) => void;
  selectedAddress: () => Address | undefined;
  /** Raw accumulated loyalty XP for a shop. */
  loyaltyXp: (storeId: string) => number;
  /** Loyalty level for a shop, derived from its XP. */
  loyaltyTier: (storeId: string) => number;
  multiplierFor: (storeId: string) => number;
  recordPurchase: (storeId: string, orderTotal: number, opts?: PurchaseOpts) => PurchaseResult;
  reset: () => void;
};

function persist(profile: UserProfile) {
  saveJSON(STORAGE_KEYS.profile, profile);
}

// Merge defaults over whatever is stored so older/partial blobs gain new fields.
const stored = loadJSON<Partial<UserProfile>>(STORAGE_KEYS.profile, {});
const initialProfile: UserProfile = { ...defaultProfile(), ...stored };

export const useProfile = create<ProfileState>((set, get) => ({
  profile: initialProfile,

  setName: (name) =>
    set((s) => {
      const profile = { ...s.profile, name };
      persist(profile);
      return { profile };
    }),

  setEmoji: (emoji) =>
    set((s) => {
      const profile = { ...s.profile, emoji };
      persist(profile);
      return { profile };
    }),

  addAddress: (label, line, loc) => {
    const { profile } = get();
    if (profile.addresses.length >= MAX_ADDRESSES) return false;
    const addr: Address = { id: makeId("addr-"), label, line, loc };
    const next = {
      ...profile,
      addresses: [...profile.addresses, addr],
      selectedAddressId: addr.id,
    };
    persist(next);
    set({ profile: next });
    return true;
  },

  editAddress: (id, label, line, loc) =>
    set((s) => {
      const addresses = s.profile.addresses.map((a) =>
        a.id === id ? { ...a, label, line, loc } : a,
      );
      const profile = { ...s.profile, addresses };
      persist(profile);
      return { profile };
    }),

  removeAddress: (id) =>
    set((s) => {
      const addresses = s.profile.addresses.filter((a) => a.id !== id);
      const selectedAddressId =
        s.profile.selectedAddressId === id
          ? (addresses[0]?.id ?? "")
          : s.profile.selectedAddressId;
      const profile = { ...s.profile, addresses, selectedAddressId };
      persist(profile);
      return { profile };
    }),

  selectAddress: (id) =>
    set((s) => {
      const profile = { ...s.profile, selectedAddressId: id };
      persist(profile);
      return { profile };
    }),

  selectedAddress: () => {
    const { profile } = get();
    return (
      profile.addresses.find((a) => a.id === profile.selectedAddressId) ??
      profile.addresses[0]
    );
  },

  loyaltyXp: (storeId) => get().profile.loyalty[storeId] ?? 0,

  loyaltyTier: (storeId) => levelForXp(get().profile.loyalty[storeId] ?? 0),

  multiplierFor: (storeId) =>
    multiplierForTier(levelForXp(get().profile.loyalty[storeId] ?? 0)),

  recordPurchase: (storeId, orderTotal, opts = {}) => {
    const { pointsMultiplier = 1, loyaltyTiers = 1, pointsSpent = 0 } = opts;
    const { profile } = get();
    const currentXp = profile.loyalty[storeId] ?? 0;
    const currentTier = levelForXp(currentXp);
    const multiplier = multiplierForTier(currentTier);
    const pointsEarned = pointsForOrder(orderTotal, currentTier, pointsMultiplier);

    const loyalty: Record<string, number> = { ...profile.loyalty };

    // Straying to a different shop only chips a little XP off your previous
    // one (gentle decay — loyalty is hard to lose, see lib/loyalty.ts).
    let droppedShopId: string | null = null;
    const prev = profile.lastLoyaltyShopId;
    if (prev && prev !== storeId) {
      loyalty[prev] = Math.max(0, (loyalty[prev] ?? 0) - XP_SWITCH_PENALTY);
      droppedShopId = prev;
    }

    // Earn XP at the shop you ordered from (loyaltyTiers doubles it for a promo).
    const newXp = currentXp + xpForOrder(orderTotal) * loyaltyTiers;
    loyalty[storeId] = newXp;
    const newTier = levelForXp(newXp);

    const next: UserProfile = {
      ...profile,
      points: Math.max(0, profile.points + pointsEarned - pointsSpent),
      loyalty,
      lastLoyaltyShopId: storeId,
    };
    persist(next);
    set({ profile: next });

    return { pointsEarned, pointsSpent, multiplier, newTier, droppedShopId };
  },

  reset: () => {
    const profile = defaultProfile();
    persist(profile);
    set({ profile });
  },
}));
