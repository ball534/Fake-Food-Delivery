import { useMemo, useState } from "react";
import { Search as SearchIcon, RefreshCw, Copy, Gift, Flame, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Screen from "../components/Screen";
import StoreCard from "../components/StoreCard";
import { Link } from "react-router-dom";
import { STORES, CATEGORIES, storesInCategory } from "../data/stores";
import { selectDeal, msUntilRotation, type Deal } from "../data/promos";
import { useProfile } from "../store/profileStore";
import { useCart } from "../store/cartStore";
import { useToasts } from "../store/toastStore";
import { useContent, DEFAULT_GREETINGS, GREETING_SEED } from "../store/contentStore";
import { useNow } from "../lib/hooks";
import { formatCountdown } from "../lib/format";

const KIND_LABEL: Record<Deal["kind"], string> = {
  code: "Promo code",
  combo: "Special combo",
  item: "Limited-time item",
};

function partOfDay(hour: number): string {
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

export default function Home() {
  const profile = useProfile((s) => s.profile);
  const showToast = useToasts((s) => s.show);
  const cartCount = useCart((s) => s.itemCount());
  const greetings = useContent((s) => s.greetings);
  const deals = useContent((s) => s.deals);
  const [category, setCategory] = useState<string | null>(null);
  const now = useNow();

  // The Special Deal rotates every 10 minutes.
  const deal = useMemo(() => selectDeal(deals, now), [deals, now]);
  const rotatesIn = msUntilRotation(now);

  // A greeting picked for the current time of day that cycles on every page
  // refresh (GREETING_SEED advances once per load). If the chosen line contains
  // {name} it's substituted in place; otherwise the first name is appended.
  const greeting = useMemo(() => {
    const bucket = partOfDay(new Date(now).getHours());
    const pool = greetings[bucket] ?? DEFAULT_GREETINGS[bucket];
    const raw = pool[GREETING_SEED % pool.length];
    const firstName = profile.name.split(" ")[0];
    return raw.includes("{name}")
      ? raw.replace(/\{name\}/g, firstName)
      : `${raw}, ${firstName}`;
  }, [now, greetings, profile.name]);

  const filtered = useMemo(
    () => (category ? storesInCategory(category) : []),
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

  const dealHeader = (
    <>
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
    </>
  );

  return (
    <Screen className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-brand-500 to-brand-600 px-4 pb-5 pt-8 text-white">
        <p className="text-lg font-bold">{greeting}</p>
        <p className="text-sm text-brand-50/90">What are you craving?</p>
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
            <h2 className="flex items-center gap-1.5 text-base font-bold text-neutral-900 dark:text-white">
              <Gift size={18} className="text-brand-500" /> Special Deal
            </h2>
            <span className="flex items-center gap-1 text-xs font-medium text-neutral-400">
              <RefreshCw size={12} /> New in {formatCountdown(rotatesIn)}
            </span>
          </div>
          {deal.storeId ? (
            // Combo / limited-time item — tap through to the shop running it.
            <Link
              to={`/store/${deal.storeId}`}
              className="block overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 px-4 pb-4 pt-3 text-white shadow-card transition active:scale-[0.99]"
            >
              {dealHeader}
            </Link>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 px-4 pb-4 pt-3 text-white shadow-card">
              {dealHeader}
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
          )}
        </section>

        {/* Category chips */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          <button
            onClick={() => setCategory(null)}
            className={`chip ${category === null ? "chip-active" : ""}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? null : c)}
              className={`chip ${category === c ? "chip-active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>

        {category ? (
          /* Filtered results for the chosen category */
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
            <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-neutral-900 dark:text-white">
              <Flame size={18} className="text-brand-500" /> Featured
            </h2>
            <div className="space-y-3">
              {featured.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating cart button — quick jump to checkout when you've got items */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px]">
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Link
                to="/checkout"
                aria-label={`Cart, ${cartCount} items`}
                className="pointer-events-auto absolute bottom-20 right-4 grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-white shadow-card-hover active:scale-95"
              >
                <ShoppingBag size={22} />
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-brand-600 shadow">
                  {cartCount}
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
