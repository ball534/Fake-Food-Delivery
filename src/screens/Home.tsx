import { useMemo, useState } from "react";
import {
  Search as SearchIcon,
  RefreshCw,
  Copy,
  Gift,
  Flame,
  ShoppingBag,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Screen from "../components/Screen";
import StoreCard from "../components/StoreCard";
import DealPrice from "../components/DealPrice";
import { Link } from "react-router-dom";
import { useStores, storesInCategory } from "../store/storesStore";
import { selectDeal, msUntilRotation, type Deal } from "../data/promos";
import { useProfile } from "../store/profileStore";
import { useCart } from "../store/cartStore";
import { useToasts } from "../store/toastStore";
import {
  useContent,
  useDealPool,
  DEFAULT_GREETINGS,
  GREETING_SEED,
} from "../store/contentStore";
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
  const deals = useDealPool();
  const stores = useStores((s) => s.stores);
  const categories = useStores((s) => s.categories);
  const [category, setCategory] = useState<string | null>(null);
  const now = useNow();

  const deal = useMemo(() => selectDeal(deals, now), [deals, now]);
  const rotatesIn = msUntilRotation(now);

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
    [category, stores],
  );

  const featured = useMemo(
    () => [...stores].sort((a, b) => b.rating - a.rating).slice(0, 3),
    [stores],
  );

  const copyCode = () => {
    if (deal.kind === "code" && deal.code) {
      navigator.clipboard?.writeText(deal.code).catch(() => {});
      showToast(`Code ${deal.code} copied`, "🏷️");
    }
  };

  const dealHeader = (
    <>
      <span className="relative z-[1] text-xs font-semibold uppercase tracking-wide text-brand-50/80">
        {KIND_LABEL[deal.kind]}
      </span>
      <div className="relative z-[1] mt-1 flex items-center gap-3">
        {deal.emoji && <span className="text-4xl">{deal.emoji}</span>}
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold leading-tight">{deal.title}</p>
          <p className="text-sm text-brand-50/90">{deal.sub}</p>
          <DealPrice deal={deal} className="mt-1.5" />
        </div>
      </div>
    </>
  );

  return (
    <Screen className="relative pb-6">
      {/* Soft green wash that dissolves into the page — no hard seam. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-brand-500 via-brand-500/85 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-300/40 blur-3xl"
      />

      <div className="relative px-4 pt-9">
        <p className="text-lg font-bold text-white drop-shadow-sm">{greeting}</p>
        <p className="text-sm text-white/85">What are you craving?</p>
        <Link
          to="/search"
          className="glass mt-4 flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-medium text-neutral-500"
        >
          <SearchIcon size={18} />
          Search stores or dishes
        </Link>
      </div>

      <div className="relative space-y-5 p-4 pt-6">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-base font-bold text-neutral-900">
              <Gift size={18} className="text-brand-500" /> Special Deal
            </h2>
            <span className="flex items-center gap-1 text-xs font-medium text-neutral-400">
              <RefreshCw size={12} /> New in {formatCountdown(rotatesIn)}
            </span>
          </div>
          {deal.storeId ? (
            <Link
              to={`/store/${deal.storeId}`}
              className="gloss block rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 px-4 pb-4 pt-3 text-white shadow-card-hover transition active:scale-[0.99]"
            >
              {dealHeader}
            </Link>
          ) : (
            <div className="gloss rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 px-4 pb-4 pt-3 text-white shadow-card-hover">
              {dealHeader}
              {deal.kind === "code" && deal.code && (
                <button
                  onClick={copyCode}
                  className="relative z-[1] mt-3 flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-left backdrop-blur active:scale-[0.99]"
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

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
          <button
            onClick={() => setCategory(null)}
            className={`chip ${category === null ? "chip-active" : ""}`}
          >
            All
          </button>
          {categories.map((c) => (
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
          <section>
            <h2 className="mb-2 text-base font-bold text-neutral-900">
              {category} · {filtered.length}
            </h2>
            <div className="space-y-3">
              {filtered.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        ) : (
          <section>
            <h2 className="mb-2 flex items-center gap-1.5 text-base font-bold text-neutral-900">
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
                className="pointer-events-auto absolute bottom-20 right-4 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-brand-400 to-brand-600 text-white shadow-card-hover active:scale-95"
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
