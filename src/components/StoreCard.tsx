import { Link } from "react-router-dom";
import { Star, Clock, Bike } from "lucide-react";
import type { Store } from "../data/types";
import { etaRange } from "../lib/format";

export default function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      to={`/store/${store.id}`}
      className="block overflow-hidden rounded-2xl bg-white shadow-card transition active:scale-[0.99] dark:bg-neutral-900"
    >
      <div
        className="relative grid h-28 place-items-center text-5xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${store.bannerFrom}, ${store.bannerTo})`,
        }}
      >
        <span className="drop-shadow">{store.emoji}</span>
      </div>
      <div className="flex gap-3 p-3">
        {/* Square brand logo, sitting to the left of the shop name */}
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-neutral-100 text-2xl shadow-sm dark:bg-neutral-800">
          {store.logo}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-bold text-neutral-900 dark:text-white">
              {store.name}
            </h3>
            <span className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {store.rating.toFixed(1)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
            {store.cuisine}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock size={13} /> {etaRange(store.etaMinutes)}
            </span>
            <span className="flex items-center gap-1">
              <Bike size={13} /> {store.distanceKm.toFixed(1)} km
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
