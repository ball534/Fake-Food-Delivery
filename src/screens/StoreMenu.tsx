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
import { STORES_BY_ID } from "../data/stores";
import { getReviews } from "../data/reviews";
import { etaRange } from "../lib/format";
import { pluralize } from "../lib/format";
import { useCart } from "../store/cartStore";
import { useToasts } from "../store/toastStore";
import { useContent } from "../store/contentStore";
import { useNow } from "../lib/hooks";
import { selectDeal } from "../data/promos";

export default function StoreMenu() {
  const { storeId = "" } = useParams();
  const store = STORES_BY_ID[storeId];
  const addLine = useCart((s) => s.addLine);
  const showToast = useToasts((s) => s.show);
  const deals = useContent((s) => s.deals);
  const now = useNow();
  // The currently-rotating Special Deal, surfaced here only when it's featured
  // at this shop (combo / limited-time item deals carry a storeId).
  const deal = selectDeal(deals, now);
  const storeDeal = deal.storeId === storeId ? deal : null;
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const clickLockUntil = useRef(0);

  // Scroll-spy: highlight the chip for whichever category section is currently
  // in the main viewing area as the user scrolls the menu.
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
        // A click does its own scroll + highlight; don't fight it mid-animation.
        if (Date.now() < clickLockUntil.current || visible.size === 0) return;
        const topMost = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0];
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

  // Keep the active chip scrolled into view within the horizontal nav.
  useEffect(() => {
    if (activeCat) {
      chipRefs.current[activeCat]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeCat]);

  if (!store) {
    return (
      <Screen>
        <TopBar title="Store" />
        <EmptyState emoji="🤷" title="Store not found" />
      </Screen>
    );
  }

  const reviews = getReviews(store.id);

  const scrollToCat = (label: string) => {
    setActiveCat(label);
    // Briefly suspend scroll-spy so the smooth-scroll doesn't flicker the
    // highlight through intermediate categories.
    clickLockUntil.current = Date.now() + 700;
    // Scroll the <main> container manually (rather than scrollIntoView, which
    // is unreliable across nested scroll/sticky contexts) so the section lands
    // just below the sticky category nav.
    const main = document.querySelector("main");
    const el = document.getElementById(`cat-${label}`);
    if (!main || !el) return;
    const STICKY_NAV = 56;
    const top =
      el.getBoundingClientRect().top -
      main.getBoundingClientRect().top +
      main.scrollTop -
      STICKY_NAV;
    main.scrollTo({ top, behavior: "smooth" });
  };

  // Add the featured combo / limited-time item straight to the cart. It isn't a
  // real menu item, so we add it as a snapshot line (name + emoji travel with it).
  const addStoreDeal = () => {
    if (!storeDeal) return;
    addLine({
      item: {
        id: `deal-${storeDeal.id}`,
        name: storeDeal.title,
        description: storeDeal.sub,
        emoji: storeDeal.emoji,
        basePrice: storeDeal.price ?? 0,
      },
      storeId,
      qty: 1,
      selectedChoices: [],
    });
    showToast(`Added ${storeDeal.title}`, "🛒");
  };

  return (
    <Screen className="pb-28">
      {/* Banner */}
      <div
        className="relative grid h-44 place-items-center text-7xl"
        style={{
          backgroundImage: `linear-gradient(135deg, ${store.bannerFrom}, ${store.bannerTo})`,
        }}
      >
        <div className="absolute inset-0 bg-black/5" />
        <span className="relative drop-shadow-lg">{store.emoji}</span>
        <div className="absolute inset-x-0 top-0">
          <TopBar transparent />
        </div>
      </div>

      {/* Store info card */}
      <div className="-mt-6 rounded-t-3xl bg-neutral-50 px-4 pt-8 dark:bg-neutral-950">
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-neutral-900 dark:text-white">
          {store.name}
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
          {store.cuisine} · {"$".repeat(store.priceLevel)}
        </p>
        <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600 dark:text-neutral-300">
          <span className="flex items-center gap-1 font-semibold">
            <Star size={15} className="fill-amber-400 text-amber-400" />
            {store.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={15} /> {etaRange(store.etaMinutes)}
          </span>
          <span className="flex items-center gap-1">
            <Bike size={15} /> {store.distanceKm.toFixed(1)} km
          </span>
        </div>

        {/* Featured special running at this shop right now */}
        {storeDeal && (
          <div className="mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-3 text-white shadow-card">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-50/80">
              {storeDeal.kind === "combo" ? "Special combo" : "Limited-time item"}
            </span>
            <div className="mt-0.5 flex items-center gap-3">
              <span className="text-3xl">{storeDeal.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold leading-tight">{storeDeal.title}</p>
                <p className="text-xs text-brand-50/90">{storeDeal.sub}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={addStoreDeal}
                aria-label={`Add ${storeDeal.title} to cart`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-brand-600 shadow-card-hover"
              >
                <Plus size={18} strokeWidth={3} />
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky category nav */}
      <div className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
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

      {/* Menu */}
      <div className="space-y-7 p-4">
        {store.menu.map((cat) => (
          <section
            key={cat.label}
            id={`cat-${cat.label}`}
            data-cat={cat.label}
            className="scroll-mt-16"
          >
            <h2 className="mb-3 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              {cat.label}
            </h2>
            <div className="space-y-2.5">
              {cat.items.map((item) => (
                <ItemCard key={item.id} item={item} storeId={store.id} />
              ))}
            </div>
          </section>
        ))}

        {/* Reviews */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Reviews
            <span className="text-sm font-medium text-neutral-400">
              {pluralize(reviews.length, "review")}
            </span>
          </h2>
          <div className="space-y-2.5">
            {reviews.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-lg dark:bg-neutral-800">
                    {r.emoji}
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {r.author}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {r.daysAgo === 0 ? "Today" : pluralize(r.daysAgo, "day") + " ago"}
                    </p>
                  </div>
                  <Stars value={r.rating} size={14} />
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
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
