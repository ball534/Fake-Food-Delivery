import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, X, Clock, SlidersHorizontal } from "lucide-react";
import Screen from "../components/Screen";
import StoreCard from "../components/StoreCard";
import EmptyState from "../components/EmptyState";
import { STORES, STORES_BY_ID } from "../data/stores";
import type { Store } from "../data/types";
import { useOrders } from "../store/orderStore";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { money } from "../lib/format";

type SortKey = "relevance" | "rating" | "eta" | "distance";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Best match" },
  { key: "rating", label: "Top rated" },
  { key: "eta", label: "Fastest" },
  { key: "distance", label: "Nearest" },
];

type DishHit = { store: Store; itemId: string; name: string; emoji: string; price: number };

export default function Search() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [recent, setRecent] = useState<string[]>(() =>
    loadJSON<string[]>(STORAGE_KEYS.recentSearches, []),
  );
  const orders = useOrders((s) => s.orders);

  const q = query.trim().toLowerCase();

  // Shops the user has previously ordered from (newest first, de-duplicated),
  // surfaced even if they were never searched for.
  const previousStores = useMemo(() => {
    const seen = new Set<string>();
    const list: Store[] = [];
    for (const o of orders) {
      if (seen.has(o.storeId)) continue;
      seen.add(o.storeId);
      const store = STORES_BY_ID[o.storeId];
      if (store) list.push(store);
    }
    return list;
  }, [orders]);

  const commitSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 6);
    setRecent(next);
    saveJSON(STORAGE_KEYS.recentSearches, next);
  };

  const { stores, dishes } = useMemo(() => {
    if (!q) return { stores: [] as Store[], dishes: [] as DishHit[] };
    const storeHits = STORES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.cuisine.toLowerCase().includes(q) ||
        s.menu.some((cat) => cat.items.some((i) => i.name.toLowerCase().includes(q))),
    );
    const sorted = [...storeHits].sort((a, b) => {
      switch (sort) {
        case "rating":
          return b.rating - a.rating;
        case "eta":
          return a.etaMinutes[0] - b.etaMinutes[0];
        case "distance":
          return a.distanceKm - b.distanceKm;
        default:
          return 0;
      }
    });
    const dishHits: DishHit[] = [];
    for (const s of STORES) {
      for (const cat of s.menu) {
        for (const i of cat.items) {
          if (i.name.toLowerCase().includes(q)) {
            dishHits.push({ store: s, itemId: i.id, name: i.name, emoji: i.emoji, price: i.basePrice });
          }
        }
      }
    }
    return { stores: sorted, dishes: dishHits.slice(0, 8) };
  }, [q, sort]);

  return (
    <Screen className="pb-6">
      <div className="sticky top-0 z-10 space-y-3 border-b border-neutral-200 bg-neutral-50/95 px-4 pb-3 pt-6 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-card dark:bg-neutral-900">
          <SearchIcon size={18} className="text-neutral-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => commitSearch(query)}
            placeholder="Search stores, cuisines, dishes"
            className="flex-1 bg-transparent text-sm text-neutral-900 outline-none dark:text-white"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear">
              <X size={18} className="text-neutral-400" />
            </button>
          )}
        </div>

        {q && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <SlidersHorizontal size={16} className="shrink-0 text-neutral-400" />
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`chip ${sort === s.key ? "chip-active" : ""}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5 p-4">
        {!q && recent.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-neutral-900 dark:text-white">
              Recent
            </h2>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button key={r} onClick={() => setQuery(r)} className="chip">
                  <Clock size={13} /> {r}
                </button>
              ))}
            </div>
          </section>
        )}

        {!q && previousStores.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-neutral-900 dark:text-white">
              Order again
            </h2>
            <div className="space-y-3">
              {previousStores.map((s) => (
                <StoreCard key={s.id} store={s} />
              ))}
            </div>
          </section>
        )}

        {q && dishes.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-neutral-900 dark:text-white">
              Dishes
            </h2>
            <div className="space-y-2">
              {dishes.map((d) => (
                <Link
                  key={d.itemId}
                  to={`/item/${d.store.id}/${d.itemId}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-2.5 shadow-card dark:bg-neutral-900"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-100 text-2xl dark:bg-neutral-800">
                    {d.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-neutral-900 dark:text-white">
                      {d.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {d.store.name} · {money(d.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {q && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-neutral-900 dark:text-white">
              Stores · {stores.length}
            </h2>
            {stores.length === 0 ? (
              <EmptyState
                emoji="🔍"
                title="No matches"
                subtitle={`Nothing found for "${query}". Try another keyword.`}
              />
            ) : (
              <div className="space-y-3">
                {stores.map((s) => (
                  <StoreCard key={s.id} store={s} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </Screen>
  );
}
