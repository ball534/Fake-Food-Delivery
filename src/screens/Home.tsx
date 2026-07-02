import { useMemo, useState } from "react";
import {
  Search as SearchIcon,
  Copy,
  Flame,
  ShoppingBag,
  Sparkles,
  Star,
  Clock,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Screen from "../components/Screen";
import StoreCard from "../components/StoreCard";
import DealPrice from "../components/DealPrice";
import Thumb from "../components/Thumb";
import { Link } from "react-router-dom";
import { useStores } from "../store/storesStore";
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
import { etaRange, formatCountdown } from "../lib/format";
import { etaRangeFor } from "../lib/delivery";

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
  const selectedAddress = useProfile((s) => s.selectedAddress)();
  const [category, setCategory] = useState<string | null>(null);
  const now = useNow();

  const deal = useMemo(() => selectDeal(deals, now), [deals, now]);
  const rotatesIn = msUntilRotation(now);
  const endingSoon = rotatesIn < 60_000;

  const hour = new Date(now).getHours();
  const greeting = useMemo(() => {
    const bucket = partOfDay(hour);
    const pool = greetings[bucket] ?? DEFAULT_GREETINGS[bucket];
    const raw = pool[GREETING_SEED % pool.length];
    const firstName = profile.name.split(" ")[0];
    return raw.includes("{name}")
      ? raw.replace(/\{name\}/g, firstName)
      : `${raw}, ${firstName}`;
  }, [hour, greetings, profile.name]);

  const filtered = useMemo(
    () =>
      category ? stores.filter((s) => s.categories.includes(category)) : [],
    [category, stores],
  );

  const featured = useMemo(
    () => [...stores].sort((a, b) => b.rating - a.rating).slice(0, 4),
    [stores],
  );

  const copyCode = () => {
    if (deal.kind === "code" && deal.code) {
      navigator.clipboard?.writeText(deal.code).catch(() => {});
      showToast(`Code ${deal.code} copied`, "🏷️");
    }
  };

  const seed = selectedAddress?.id ?? "no-address";

  const dealHeader = (
    <>
      <div className="relative z-[1] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-white/80">
          <Zap size={12} className="mr-1 inline -translate-y-px" />
          {KIND_LABEL[deal.kind]}
        </span>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${
            endingSoon
              ? "animate-glow-pulse bg-white text-brand-600"
              : "bg-white/20 text-white"
          }`}
        >
          <Clock size={11} />
          {endingSoon ? "ENDS " : ""}
          {formatCountdown(rotatesIn)}
        </span>
      </div>
      <div className="relative z-[1] mt-1.5 flex items-center gap-3">
        {deal.emoji && (
          <span className="animate-float text-4xl drop-shadow">
            {deal.emoji}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-extrabold leading-tight">
            {deal.title}
          </p>
          <p className="text-sm text-white/85">{deal.sub}</p>
          <DealPrice deal={deal} className="mt-1.5" />
        </div>
      </div>
    </>
  );

  return (
    <Screen className="relative pb-28">
      {/* Sunset wash that dissolves into the page — no hard seam. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-brand-500 via-brand-500/85 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-300/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-16 h-48 w-48 rounded-full bg-brand-300/40 blur-3xl"
      />

      <div className="relative px-4 pt-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-xl font-bold leading-snug text-white drop-shadow-sm">
              {greeting}
            </p>
            <p className="text-sm text-white/85">What are you craving?</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Link
              to="/profile"
              className="glass-warm flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white"
            >
              <Sparkles size={13} className="text-gold-200" />
              {profile.points.toLocaleString()} pts
            </Link>
            {profile.streak > 0 && (
              <span className="glass-warm flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white">
                <Flame size={13} className="text-gold-200" />
                {profile.streak}-day streak
              </span>
            )}
          </div>
        </div>
        <Link
          to="/search"
          className="glass mt-4 flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-semibold text-neutral-600"
        >
          <SearchIcon size={18} />
          Search stores or dishes
        </Link>
      </div>

      <div className="relative space-y-5 p-4 pt-6">
        <section>
          {deal.storeId ? (
            <Link
              to={`/store/${deal.storeId}`}
              className="gloss block rounded-2xl bg-brand-500 px-4 pb-4 pt-3 text-white shadow-glow transition active:scale-[0.99]"
            >
              {dealHeader}
            </Link>
          ) : (
            <div className="gloss rounded-2xl bg-brand-500 px-4 pb-4 pt-3 text-white shadow-glow">
              {dealHeader}
              {deal.kind === "code" && deal.code && (
                <button
                  onClick={copyCode}
                  className="relative z-[1] mt-3 flex w-full items-center justify-between rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-left backdrop-blur active:scale-[0.99]"
                >
                  <span className="font-mono text-base font-bold tracking-widest">
                    {deal.code}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold">
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
            <h2 className="mb-2 font-display text-lg font-bold text-neutral-900">
              {category} · {filtered.length}
            </h2>
            <div className="space-y-3">
              {filtered.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <section>
              <h2 className="mb-2 flex items-center gap-1.5 font-display text-lg font-bold text-neutral-900">
                <Flame size={19} className="text-brand-500" /> Hot right now
              </h2>
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
                {featured.map((store) => (
                  <Link
                    key={store.id}
                    to={`/store/${store.id}`}
                    className="w-[240px] shrink-0 snap-start overflow-hidden rounded-2xl bg-white shadow-card transition active:scale-[0.98]"
                  >
                    <div className="relative grid h-28 place-items-center overflow-hidden bg-neutral-200">
                      <Thumb
                        src={store.banner}
                        alt={store.name}
                        fallback="banner"
                        rounded=""
                      />
                      <span className="glass absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-neutral-800">
                        <Star size={12} className="fill-gold-400 text-gold-400" />
                        {store.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-neutral-100">
                        <Thumb src={store.logo} alt="" fallback="logo" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-neutral-900">
                          {store.name}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-neutral-500">
                          <Clock size={11} />
                          {etaRange(etaRangeFor(store.id, seed))}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-display text-lg font-bold text-neutral-900">
                All stores
              </h2>
              <div className="space-y-3">
                {stores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            </section>
          </>
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
                className="pointer-events-auto absolute bottom-24 right-4 grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-white shadow-glow active:scale-95"
              >
                <ShoppingBag size={22} />
                <motion.span
                  key={cartCount}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-bold text-brand-600 shadow"
                >
                  {cartCount}
                </motion.span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Screen>
  );
}
