import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Clock, Bike, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Screen from "../components/Screen";
import TopBar from "../components/TopBar";
import ItemCard from "../components/ItemCard";
import CartBar from "../components/CartBar";
import EmptyState from "../components/EmptyState";
import Stars from "../components/Stars";
import Thumb from "../components/Thumb";
import DealPrice from "../components/DealPrice";
import { useStores } from "../store/storesStore";
import { etaRange } from "../lib/format";
import { pluralize, initials } from "../lib/format";
import { etaRangeFor, distanceFor } from "../lib/delivery";
import { useCart } from "../store/cartStore";
import { useProfile } from "../store/profileStore";
import { useToasts } from "../store/toastStore";
import { useDealPool } from "../store/contentStore";
import { useNow } from "../lib/hooks";
import { selectDeal } from "../data/promos";

export default function StoreMenu() {
  const { storeId = "" } = useParams();
  const store = useStores((s) => s.byId[storeId]);
  const selectedAddress = useProfile((s) => s.selectedAddress)();
  const points = useProfile((s) => s.profile.points);
  const addLine = useCart((s) => s.addLine);
  const showToast = useToasts((s) => s.show);
  const deals = useDealPool();
  const now = useNow();
  const deal = selectDeal(deals, now);
  const storeDeal = deal.storeId === storeId ? deal : null;
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const programmatic = useRef(false);
  const settleTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!store) return;
    const root = document.querySelector("main");
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const label = (e.target as HTMLElement).dataset.cat;
          if (!label) continue;
          if (e.isIntersecting) visible.set(label, e.boundingClientRect.top);
          else visible.delete(label);
        }
        if (programmatic.current || visible.size === 0) return;
        const topMost = [...visible.entries()].sort(
          (a, b) => a[1] - b[1],
        )[0][0];
        setActiveCat(topMost);
      },
      { root, rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    store.menu.forEach((cat) => {
      const el = document.getElementById(`cat-${cat.label}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [store]);

  useEffect(() => {
    if (!activeCat) return;
    const chip = chipRefs.current[activeCat];
    const nav = chip?.parentElement;
    if (!chip || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const target =
      nav.scrollLeft +
      (chipRect.left - navRect.left) -
      (nav.clientWidth - chip.clientWidth) / 2;
    nav.scrollTo({ left: target, behavior: "smooth" });
  }, [activeCat]);

  if (!store) {
    return (
      <Screen>
        <TopBar title="Store" />
        <EmptyState emoji="🤷" title="Store not found" />
      </Screen>
    );
  }

  const reviews = store.reviews;
  const seed = selectedAddress?.id ?? "no-address";
  const eta = etaRangeFor(store.id, seed);
  const distanceKm = distanceFor(store.id, seed);

  const scrollToCat = (label: string) => {
    setActiveCat(label);
    const main = document.querySelector("main");
    const el = document.getElementById(`cat-${label}`);
    if (!main || !el) return;
    programmatic.current = true;
    const STICKY_NAV = 56;
    const top =
      el.getBoundingClientRect().top -
      main.getBoundingClientRect().top +
      main.scrollTop -
      STICKY_NAV;
    main.scrollTo({ top, behavior: "smooth" });

    const release = () => {
      programmatic.current = false;
      main.removeEventListener("scrollend", release);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
    main.addEventListener("scrollend", release);
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(release, 1000);
  };

  const dealCost = storeDeal?.pointsCost ?? 0;
  const canRedeem = points >= dealCost;

  const addStoreDeal = () => {
    if (!storeDeal || !canRedeem) return;
    const dealItemId = `deal-${storeId}-${storeDeal.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")}`;
    addLine({
      item: {
        id: dealItemId,
        name: storeDeal.title,
        description: storeDeal.sub,
        icon: "",
        emoji: storeDeal.emoji,
        basePrice: storeDeal.price ?? 0,
      },
      storeId,
      qty: 1,
      selectedChoices: [],
      pointsCost: dealCost,
    });
    showToast(
      dealCost > 0
        ? `${storeDeal.title} added · ${dealCost} pts at checkout`
        : `Added ${storeDeal.title}`,
      "🛒",
    );
  };

  return (
    <Screen className="pb-28">
      <div className="relative grid h-44 place-items-center overflow-hidden bg-neutral-200">
        <Thumb
          src={store.banner}
          alt={store.name}
          fallback="banner"
          rounded=""
        />
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute inset-x-0 top-0">
          <TopBar transparent />
        </div>
      </div>

      <div className="relative -mt-6 rounded-t-3xl bg-neutral-50 px-4 pt-8">
        <span className="absolute -top-8 left-4 grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white shadow-card-hover ring-1 ring-black/5">
          <Thumb
            src={store.logo}
            alt={store.name}
            fallback="logo"
            rounded="rounded-2xl"
          />
        </span>
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-neutral-900">
          {store.name}
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          {store.cuisine} · {"$".repeat(store.priceLevel)}
        </p>
        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
          <span className="flex items-center gap-1 font-semibold">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            {store.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={15} /> {etaRange(eta)}
          </span>
          <span className="flex items-center gap-1">
            <Bike size={15} /> {distanceKm.toFixed(1)} km
          </span>
        </div>

        {storeDeal && (
          <div className="gloss mt-3 rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 p-3 text-white shadow-card-hover">
            <span className="relative z-[1] text-[10px] font-semibold uppercase tracking-wide text-brand-50/80">
              {storeDeal.kind === "combo"
                ? "Special combo"
                : "Limited-time item"}
            </span>
            <div className="relative z-[1] mt-0.5 flex items-center gap-3">
              {storeDeal.emoji && (
                <span className="text-3xl">{storeDeal.emoji}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-extrabold leading-tight">
                  {storeDeal.title}
                </p>
                <p className="text-xs text-brand-50/90">{storeDeal.sub}</p>
                <DealPrice deal={storeDeal} className="mt-1" />
              </div>
              {dealCost > 0 ? (
                <motion.button
                  whileTap={canRedeem ? { scale: 0.9 } : undefined}
                  onClick={addStoreDeal}
                  disabled={!canRedeem}
                  aria-label={
                    canRedeem
                      ? `Redeem ${storeDeal.title} for ${dealCost} points`
                      : `Not enough points to redeem ${storeDeal.title}`
                  }
                  className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-extrabold text-brand-600 shadow-card-hover disabled:bg-white/40 disabled:text-white disabled:shadow-none"
                >
                  {canRedeem ? "Redeem" : `Need ${dealCost - points} pts`}
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={addStoreDeal}
                  aria-label={`Add ${storeDeal.title} to cart`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-brand-600 shadow-card-hover"
                >
                  <Plus size={18} strokeWidth={3} />
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="glass-nav sticky top-0 z-10 border-b border-black/5">
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5 no-scrollbar">
          {store.menu.map((cat) => (
            <button
              key={cat.label}
              ref={(el) => (chipRefs.current[cat.label] = el)}
              onClick={() => scrollToCat(cat.label)}
              className={`chip ${activeCat === cat.label ? "chip-active" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-7 p-4">
        {store.menu.map((cat) => (
          <section
            key={cat.label}
            id={`cat-${cat.label}`}
            data-cat={cat.label}
            className="scroll-mt-16"
          >
            <h2 className="mb-3 text-lg font-bold tracking-tight text-neutral-900">
              {cat.label}
            </h2>
            <div className="space-y-2.5">
              {cat.items.map((item) => (
                <ItemCard key={item.id} item={item} storeId={store.id} />
              ))}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-900">
            Reviews
            <span className="text-sm font-medium text-neutral-400">
              {pluralize(reviews.length, "review")}
            </span>
          </h2>
          <div className="space-y-2.5">
            {reviews.map((r, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-500">
                    {initials(r.author)}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="font-semibold text-neutral-900">{r.author}</p>
                  </div>
                  <Stars value={r.rating} size={14} />
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-neutral-600">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <CartBar />
    </Screen>
  );
}
