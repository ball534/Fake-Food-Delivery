import { Link } from "react-router-dom";
import { Star, Clock, Bike } from "lucide-react";
import type { Store } from "../data/types";
import { etaRange } from "../lib/format";
import { etaRangeFor, distanceFor } from "../lib/delivery";
import { useProfile } from "../store/profileStore";
import Thumb from "./Thumb";

export default function StoreCard({ store }: { store: Store }) {
  const selectedAddress = useProfile((s) => s.selectedAddress)();
  const seed = selectedAddress?.id ?? "no-address";
  const eta = etaRangeFor(store.id, seed);
  const distanceKm = distanceFor(store.id, seed);

  return (
    <Link
      to={`/store/${store.id}`}
      className="block overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-black/[0.04] transition active:scale-[0.99]"
    >
      <div className="relative grid h-28 place-items-center overflow-hidden bg-neutral-200">
        <Thumb
          src={store.banner}
          alt={store.name}
          fallback="banner"
          rounded=""
        />
        <span className="glass absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-neutral-800">
          <Star size={12} className="fill-gold-400 text-gold-400" />
          {store.rating.toFixed(1)}
        </span>
      </div>
      <div className="p-3">
        <div className="flex gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-neutral-100 shadow-sm">
            <Thumb src={store.logo} alt={store.name} fallback="logo" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-neutral-900">
              {store.name}
            </h3>
            <p className="mt-0.5 truncate text-xs text-neutral-500">
              {store.cuisine} · {"$".repeat(store.priceLevel)}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1 font-semibold text-neutral-600">
            <Clock size={13} /> {etaRange(eta)}
          </span>
          <span className="flex items-center gap-1">
            <Bike size={13} /> {distanceKm.toFixed(1)} km
          </span>
        </div>
      </div>
    </Link>
  );
}
