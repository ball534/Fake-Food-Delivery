import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import Screen from "../components/Screen";
import StoreCard from "../components/StoreCard";
import EmptyState from "../components/EmptyState";
import { useStores } from "../store/storesStore";
import type { Store } from "../data/types";
import { useOrders } from "../store/orderStore";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";

export default function Search() {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(() =>
    loadJSON<string[]>(STORAGE_KEYS.recentSearches, []),
  );
  const orders = useOrders((s) => s.orders);
  const stores = useStores((s) => s.stores);
  const byId = useStores((s) => s.byId);

  const q = query.trim().toLowerCase();

  const previousStores = useMemo(() => {
    const seen = new Set<string>();
    const list: Store[] = [];
    for (const o of orders) {
      if (seen.has(o.storeId)) continue;
      seen.add(o.storeId);
      const store = byId[o.storeId];
      if (store) list.push(store);
    }
    return list;
  }, [orders, byId]);

  const commitSearch = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [
      t,
      ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase()),
    ].slice(0, 6);
    setRecent(next);
    saveJSON(STORAGE_KEYS.recentSearches, next);
  };

  const results = useMemo(() => {
    if (!q) return [] as Store[];
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.categories.some((c) => c.toLowerCase().includes(q)) ||
        s.menu.some((cat) =>
          cat.items.some((i) => i.name.toLowerCase().includes(q)),
        ),
    );
  }, [q, stores]);

  return (
    <Screen className="pb-6">
      <div className="glass-nav sticky top-0 z-10 space-y-3 border-b border-black/5 px-4 pb-3 pt-6">
        <div className="glass flex items-center gap-2 rounded-2xl px-4 py-3">
          <SearchIcon size={18} className="text-neutral-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => commitSearch(query)}
            placeholder="Search stores, cuisines, dishes"
            className="flex-1 bg-transparent text-sm text-neutral-900 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear">
              <X size={18} className="text-neutral-400" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 p-4">
        {!q && recent.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-neutral-900">
              Recent
            </h2>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <button key={r} onClick={() => setQuery(r)} className="chip">
                  {r}
                </button>
              ))}
            </div>
          </section>
        )}

        {!q && previousStores.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-neutral-900">
              Order again
            </h2>
            <div className="flex flex-wrap gap-2">
              {previousStores.map((s) => (
                <Link key={s.id} to={`/store/${s.id}`} className="chip">
                  {s.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {q && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-neutral-900">
              Stores · {results.length}
            </h2>
            {results.length === 0 ? (
              <EmptyState
                emoji="🔍"
                title="No matches"
                subtitle={`Nothing found for "${query}". Try another keyword.`}
              />
            ) : (
              <div className="space-y-3">
                {results.map((s) => (
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
