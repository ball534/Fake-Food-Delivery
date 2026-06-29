import { useMemo, useState } from "react";
import { Search as SearchIcon, RefreshCw, Copy } from "lucide-react";
import Screen from "../components/Screen";
import StoreCard from "../components/StoreCard";
import { Link } from "react-router-dom";
import { STORES, CATEGORIES } from "../data/stores";
import { selectDeal, msUntilRotation, type Deal } from "../data/promos";
import { useProfile } from "../store/profileStore";
import { useToasts } from "../store/toastStore";
import { useNow } from "../lib/hooks";
import { formatCountdown } from "../lib/format";

const CATEGORY_EMOJI: Record<string, string> = {
  Western: "🍔",
  Japanese: "🍣",
  Korean: "🌶️",
  Chinese: "🥡",
  Filipino: "🍝",
  Local: "🥟",
  Drinks: "🧋",
};

const KIND_LABEL: Record<Deal["kind"], string> = {
  code: "Promo code",
  combo: "Special combo",
  item: "Limited-time item",
};

export default function Home() {
  const profile = useProfile((s) => s.profile);
  const showToast = useToasts((s) => s.show);
  const [category, setCategory] = useState<string | null>(null);
  const now = useNow();

  // The Special Deal rotates every 10 minutes.
  const deal = useMemo(() => selectDeal(now), [now]);
  const rotatesIn = msUntilRotation(now);

  const filtered = useMemo(
    () => (category ? STORES.filter((s) => s.cuisine === category) : []),
    [category],
  );

  const featured = useMemo(
    () => [...STORES].sort((a, b) => b.rating - a.rating).slice(0, 3),
    [],
  );

  const copyCode = () => {
    if (deal.kind === "code" && deal.code) {
      navigator.clipboard?.writeText(deal.code).catch(() => {});
      showToast(`Code ${deal.code} copied`, "🏷️");
    }
  };

  return (
    <Screen className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 px-4 pb-5 pt-8 text-white">
        <p className="text-lg font-bold">
          Hi {profile.name.split(" ")[0]} 👋 What are you craving?
        </p>
        <Link
          to="/search"
          className="mt-3 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-neutral-400 shadow-card"
        >
          <SearchIcon size={18} />
          Search stores or dishes
        </Link>
      </div>

      <div className="space-y-5 p-4">
        {/* Special Deal */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Special Deal 🎁
            </h2>
            <span className="flex items-center gap-1 text-xs font-medium text-neutral-400">
              <RefreshCw size={12} /> New in {formatCountdown(rotatesIn)}
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-4 text-white shadow-card">
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-50/80">
              {KIND_LABEL[deal.kind]}
            </span>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-4xl">{deal.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-extrabold leading-tight">{deal.title}</p>
                <p className="text-sm text-brand-50/90">{deal.sub}</p>
              </div>
            </div>
            {deal.kind === "code" && deal.code && (
              <button
                onClick={copyCode}
                className="mt-3 flex w-full items-center justify-between rounded-xl bg-white/15 px-3 py-2 text-left backdrop-blur active:scale-[0.99]"
              >
                <span className="font-mono text-base font-bold tracking-widest">
                  {deal.code}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <Copy size={14} /> Tap to copy
                </span>
              </button>
            )}
          </div>
        </section>

        {/* Category chips */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          <button
            onClick={() => setCategory(null)}
            className={`chip ${category === null ? "chip-active" : ""}`}
          >
            🍽️ All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? null : c)}
              className={`chip ${category === c ? "chip-active" : ""}`}
            >
              {CATEGORY_EMOJI[c] ?? "🍴"} {c}
            </button>
          ))}
        </div>

        {category ? (
          /* Filtered results for the chosen cuisine */
          <section>
            <h2 className="mb-2 text-base font-bold text-neutral-900 dark:text-white">
              {category} · {filtered.length}
            </h2>
            <div className="space-y-3">
              {filtered.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        ) : (
          /* Featured — top 3 shops */
          <section>
            <h2 className="mb-2 text-base font-bold text-neutral-900 dark:text-white">
              Featured 🔥
            </h2>
            <div className="space-y-3">
              {featured.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Screen>
  );
}
