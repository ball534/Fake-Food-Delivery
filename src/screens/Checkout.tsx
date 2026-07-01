import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  ChevronRight,
  Sparkles,
  Minus,
  Plus,
  Trash2,
  Tag,
  X,
  Check,
} from "lucide-react";
import Screen from "../components/Screen";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import { useCart } from "../store/cartStore";
import { useProfile } from "../store/profileStore";
import { useOrders, MAX_ACTIVE_ORDERS } from "../store/orderStore";
import { useToasts } from "../store/toastStore";
import { useStores } from "../store/storesStore";
import Thumb from "../components/Thumb";
import { describeChoices } from "../lib/pricing";
import { money } from "../lib/format";
import { basePointsFor } from "../lib/loyalty";
import {
  DELIVERY_OPTIONS,
  EXPRESS_COST,
  estimateMinutes,
} from "../lib/delivery";
import { geocodeAddress } from "../lib/geocode";
import { PROMO_CODES, EFFECTS } from "../data/promos";
import type { DeliverySpeed } from "../data/types";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useCart((s) => s.cart);
  const subtotal = useCart((s) => s.subtotal());
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.removeLine);
  const clearCart = useCart((s) => s.clear);

  const profile = useProfile((s) => s.profile);
  const selectedAddress = useProfile((s) => s.selectedAddress)();
  const recordPurchase = useProfile((s) => s.recordPurchase);
  const multiplierFor = useProfile((s) => s.multiplierFor);
  const placeOrder = useOrders((s) => s.placeOrder);
  const activeCount = useOrders((s) => s.activeOrders().length);
  const showToast = useToasts((s) => s.show);

  const [speed, setSpeed] = useState<DeliverySpeed>("regular");
  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const byId = useStores((s) => s.byId);
  const store = cart.storeId ? byId[cart.storeId] : null;

  if (!store || cart.lines.length === 0) {
    return (
      <Screen>
        <TopBar title="Checkout" />
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          subtitle="Browse stores and add some food to get started."
          action={
            <button onClick={() => navigate("/")} className="btn-primary">
              Browse stores
            </button>
          }
        />
      </Screen>
    );
  }

  const total = subtotal;
  const effect = appliedCode ? PROMO_CODES[appliedCode]?.effect : null;
  const effectCfg = effect ? EFFECTS[effect] : null;
  const freeExpress = !!effectCfg?.freeExpress;

  const deliverySeed = selectedAddress?.id ?? "no-address";
  const option = DELIVERY_OPTIONS.find((o) => o.id === speed)!;
  const etaMinutes = estimateMinutes(speed, deliverySeed);
  // Points come out of the wallet for two things: redeeming combo/item deals
  // (charged here, so removing the line refunds) and paying for Express.
  const redeemCost = cart.lines.reduce((n, l) => n + (l.pointsCost ?? 0), 0);
  const expressCost =
    speed === "express" ? (freeExpress ? 0 : EXPRESS_COST) : 0;
  const pointsCost = redeemCost + expressCost;
  const pointsMultiplier =
    option.pointsMultiplier * (effectCfg?.pointsMultiplier ?? 1);
  const loyaltyTiers = effectCfg?.loyaltyMultiplier ?? 1;
  const bonusPoints = effectCfg?.bonusPoints ?? 0;

  const estPoints =
    Math.round(
      basePointsFor(total) * multiplierFor(store.id) * pointsMultiplier,
    ) + bonusPoints;

  // Express can only use whatever points remain after redemptions are paid for.
  const pointsAfterRedeem = profile.points - redeemCost;
  const cannotAfford = pointsCost > profile.points;
  const noAddress = !selectedAddress;
  const atActiveLimit = activeCount >= MAX_ACTIVE_ORDERS;
  const blocked = noAddress || cannotAfford || atActiveLimit;

  const applyCode = () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    if (PROMO_CODES[code]) {
      setAppliedCode(code);
      setCodeInput("");
      showToast(
        `Promo applied: ${EFFECTS[PROMO_CODES[code].effect].label}`,
        "🏷️",
      );
    } else {
      showToast("Invalid promo code", "⚠️");
    }
  };

  const place = async () => {
    if (placing || blocked) return;
    setPlacing(true);
    const dropLoc =
      selectedAddress?.loc ??
      (selectedAddress?.line
        ? await geocodeAddress(selectedAddress.line)
        : null) ??
      undefined;
    const { pointsEarned } = recordPurchase(store.id, total, {
      pointsMultiplier,
      loyaltyTiers,
      pointsSpent: pointsCost,
      bonusPoints,
    });
    const order = placeOrder({
      storeId: store.id,
      lines: cart.lines,
      subtotal,
      total,
      address: selectedAddress?.line ?? "Somewhere nice",
      addressLabel: selectedAddress?.label,
      pointsEarned,
      deliverySpeed: speed,
      etaMinutes,
      promoCode: appliedCode ?? undefined,
      dropLoc,
    });
    clearCart();
    showToast(`+${pointsEarned} points earned!`, "✨");
    navigate(`/track/${order.id}`, { replace: true });
  };

  return (
    <Screen className="pb-40">
      <TopBar title="Checkout" />

      <div className="space-y-4 p-4">
        <div className="flex items-center gap-5">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-neutral-100">
            <Thumb src={store.logo} alt={store.name} fallback="logo" />
          </span>
          <div>
            <p className="font-bold text-neutral-900">{store.name}</p>
            <p className="text-xs text-neutral-500">{store.cuisine}</p>
          </div>
        </div>

        <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl bg-white shadow-card">
          {cart.lines.map((line) => {
            const item = store.menu
              .flatMap((c) => c.items)
              .find((i) => i.id === line.itemId);
            const name = item?.name ?? line.name ?? "Item";
            const icon = item?.icon ?? line.icon;
            const emoji = item?.emoji ?? line.emoji;
            const summary = item
              ? describeChoices(item, line.selectedChoices)
              : "";
            return (
              <div key={line.lineId} className="flex gap-3 p-3">
                <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-neutral-100">
                  <Thumb
                    src={icon}
                    emoji={emoji}
                    fallback="food"
                    alt={name}
                    fit="contain"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900">{name}</p>
                      {line.pointsCost != null && line.pointsCost > 0 && (
                        <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                          🔓 Redeemed · {line.pointsCost} pts
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeLine(line.lineId)}
                      aria-label="Remove"
                      className="text-neutral-400 active:scale-90"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {summary && (
                    <p className="mt-0.5 truncate text-xs text-neutral-500">
                      {summary}
                    </p>
                  )}
                  {line.note && (
                    <p className="mt-0.5 truncate text-xs italic text-neutral-400">
                      “{line.note}”
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQty(line.lineId, line.qty - 1)}
                        aria-label="Decrease"
                        className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 active:scale-90"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center font-bold text-neutral-900">
                        {line.qty}
                      </span>
                      <button
                        onClick={() => setQty(line.lineId, line.qty + 1)}
                        aria-label="Increase"
                        className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 active:scale-90"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-neutral-900">
                      {money(line.lineTotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => navigate(`/store/${store.id}`)}
          className="w-full rounded-2xl border border-dashed border-neutral-300 py-3 text-sm font-semibold text-neutral-500 active:scale-[0.99]"
        >
          + Add more items
        </button>

        <section className="card p-4">
          {selectedAddress ? (
            <button
              onClick={() => navigate("/profile")}
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600">
                <MapPin size={18} />
              </span>
              <div className="flex-1">
                <p className="text-xs text-neutral-400">
                  Delivering to · {selectedAddress.label}
                </p>
                <p className="font-semibold text-neutral-900">
                  {selectedAddress.line}
                </p>
              </div>
              <ChevronRight size={18} className="text-neutral-300" />
            </button>
          ) : (
            <Link
              to="/profile"
              className="flex w-full items-center gap-3 text-left"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-500">
                <MapPin size={18} />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-red-500">
                  Add a delivery address
                </p>
                <p className="text-xs text-neutral-400">
                  Required to place your order
                </p>
              </div>
              <ChevronRight size={18} className="text-neutral-300" />
            </Link>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-neutral-900">Delivery</h2>
          <div className="space-y-2">
            {DELIVERY_OPTIONS.map((o) => {
              const active = speed === o.id;
              const isExpress = o.id === "express";
              const expressFree = isExpress && freeExpress;
              const disabled =
                isExpress && !freeExpress && o.pointsCost > pointsAfterRedeem;
              const est = estimateMinutes(o.id, deliverySeed);
              return (
                <button
                  key={o.id}
                  onClick={() => !disabled && setSpeed(o.id)}
                  disabled={disabled}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition disabled:opacity-50 ${
                    active
                      ? "border-brand-500 bg-brand-50"
                      : "border-transparent bg-white"
                  }`}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-neutral-900">
                      {o.label}
                      {expressFree && (
                        <span className="ml-2 rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          FREE
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-neutral-500">
                      ~{est} min · {expressFree ? "free with promo" : o.desc}
                      {disabled && " · not enough points"}
                    </p>
                  </div>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                      active
                        ? "border-brand-500 bg-brand-500"
                        : "border-neutral-300"
                    }`}
                  >
                    {active && (
                      <Check size={12} className="text-white" strokeWidth={3} />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-neutral-900">
            Promo code
          </h2>
          {appliedCode ? (
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
              <Tag size={18} className="text-brand-600" />
              <div className="flex-1">
                <p className="font-bold text-brand-700">{appliedCode}</p>
                <p className="text-xs text-brand-600/80">
                  {EFFECTS[PROMO_CODES[appliedCode].effect].label}
                </p>
              </div>
              <button
                onClick={() => setAppliedCode(null)}
                aria-label="Remove promo"
                className="text-neutral-400 active:scale-90"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyCode()}
                placeholder="Enter code (e.g. DOUBLEUP)"
                className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm uppercase outline-none placeholder:normal-case focus:border-brand-500"
              />
              <button
                onClick={applyCode}
                className="btn-secondary px-4 py-2.5 text-sm"
              >
                Apply
              </button>
            </div>
          )}
        </section>

        <section className="flex items-center gap-2 rounded-2xl bg-brand-50 px-4 py-3 text-sm">
          <Sparkles size={16} className="shrink-0 text-brand-600" />
          <span className="text-brand-800">
            You'll earn <strong>{estPoints} points</strong>
            {pointsCost > 0 && (
              <>
                {" "}
                and spend <strong>{pointsCost}</strong>
                {redeemCost > 0 && expressCost > 0
                  ? " on deals + Express"
                  : redeemCost > 0
                    ? " to redeem deals"
                    : " on Express"}
              </>
            )}
          </span>
        </section>

        <section className="card flex items-center justify-between p-4 text-base font-bold text-neutral-900">
          <span>Total</span>
          <span>{money(total)}</span>
        </section>
      </div>

      <div className="glass-nav fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] border-t border-black/5 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          onClick={place}
          disabled={blocked || placing}
          className="btn-primary w-full"
        >
          {placing
            ? "Placing…"
            : noAddress
              ? "Add an address to continue"
              : atActiveLimit
                ? `Max ${MAX_ACTIVE_ORDERS} active orders — wait for one to arrive`
                : cannotAfford
                  ? `Not enough points — need ${pointsCost - profile.points} more`
                  : `Place order · ${money(total)}`}
        </button>
      </div>
    </Screen>
  );
}
