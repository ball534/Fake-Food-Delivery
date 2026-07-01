import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MessageSquare,
  Home as HomeIcon,
  UserRound,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import Screen from "../components/Screen";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import DeliveryMap from "../components/DeliveryMap";
import Confetti from "../components/Confetti";
import Stars from "../components/Stars";
import { useOrders } from "../store/orderStore";
import { useToasts } from "../store/toastStore";
import { useNow } from "../lib/hooks";
import { STATUS_LABEL } from "../lib/simulation";
import { describeChoices } from "../lib/pricing";
import { DELIVERY_BY_ID } from "../lib/delivery";
import { useStores } from "../store/storesStore";
import { formatClock, formatDate, money } from "../lib/format";

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export default function OrderTracking() {
  const { orderId = "" } = useParams();
  const navigate = useNavigate();
  const now = useNow();
  const order = useOrders((s) => s.orders.find((o) => o.id === orderId));
  const rateOrder = useOrders((s) => s.rateOrder);
  const showToast = useToasts((s) => s.show);
  const byId = useStores((s) => s.byId);

  const [confetti, setConfetti] = useState(false);
  const celebrated = useRef(false);
  useEffect(() => {
    if (order?.status === "delivered" && !celebrated.current) {
      celebrated.current = true;
      setConfetti(true);
      const id = setTimeout(() => setConfetti(false), 2600);
      return () => clearTimeout(id);
    }
  }, [order?.status]);

  if (!order) {
    return (
      <Screen>
        <TopBar title="Order" />
        <EmptyState emoji="🤷" title="Order not found" />
      </Screen>
    );
  }

  const store = byId[order.storeId];
  const delivered = order.status === "delivered";

  const prepFill = clamp01(
    (now - order.placedAt) / (order.stageTimes.delivering - order.placedAt),
  );
  const driveFill = clamp01(
    (now - order.stageTimes.delivering) /
      (order.stageTimes.delivered - order.stageTimes.delivering),
  );
  const totalMin = Math.round((order.etaAt - order.placedAt) / 60000);

  return (
    <Screen className="pb-8">
      {confetti && <Confetti />}
      <TopBar title="Track order" />

      <div className="space-y-4 p-4">
        <div className="gloss rounded-2xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 p-4 text-white shadow-card-hover">
          <p className="text-xs font-medium text-brand-50/90">
            {delivered ? "Your order is" : "Status"}
          </p>
          <p className="text-2xl font-extrabold leading-tight">
            {STATUS_LABEL[order.status]}
          </p>

          <div className="mt-4 flex items-center gap-1.5">
            <Segment fill={prepFill} active={order.status === "preparing"} />
            <Segment fill={driveFill} active={order.status === "delivering"} />
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                delivered ? "bg-white text-brand-600" : "bg-white/25"
              }`}
            >
              {delivered && <Check size={14} strokeWidth={3} />}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-semibold">
              {delivered ? "Arrived" : `ETA ${formatClock(order.etaAt)}`}
            </span>
            <span className="text-brand-50/90">Est. total ~{totalMin} min</span>
          </div>
        </div>

        <DeliveryMap order={order} now={now} />

        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-neutral-200">
            <UserRound
              size={34}
              className="translate-y-1 fill-neutral-400 text-neutral-400"
            />
          </span>
          <div className="flex-1">
            <p className="font-bold text-neutral-900">{order.driver.name}</p>
          </div>
          <button
            onClick={() => showToast("Message sent into the void ✉️", "💬")}
            aria-label="Message driver"
            className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600 active:scale-90"
          >
            <MessageSquare size={18} />
          </button>
        </div>

        {delivered && (
          <div className="card flex flex-col items-center gap-2 p-4 text-center">
            <p className="font-bold text-neutral-900">
              {order.rating ? "Thanks for rating!" : "How was it?"}
            </p>
            <Stars
              value={order.rating ?? 0}
              size={28}
              onChange={(v) => {
                rateOrder(order.id, v);
                showToast("Thanks for rating!", "⭐");
              }}
            />
          </div>
        )}

        <div
          className="rounded-2xl p-5 font-mono text-[13px] leading-relaxed shadow-card"
          style={{ backgroundColor: "#f7f2e7", color: "#4a4334" }}
        >
          <div className="text-center">
            <p className="text-base font-bold uppercase tracking-[0.2em]">
              {order.storeName}
            </p>
            <p className="text-[11px] text-neutral-400">
              FAKEEATS · SIMULATION
            </p>
            <p className="text-[11px] text-neutral-400">
              {formatDate(order.placedAt)}
            </p>
          </div>

          <Dashed />

          {order.lines.map((line) => {
            const item = store?.menu
              .flatMap((c) => c.items)
              .find((i) => i.id === line.itemId);
            const summary = item
              ? describeChoices(item, line.selectedChoices)
              : "";
            return (
              <div key={line.lineId} className="mb-1">
                <div className="flex justify-between gap-2">
                  <span>
                    {line.qty} × {item?.name ?? line.name ?? "Item"}
                  </span>
                  <span>{money(line.lineTotal)}</span>
                </div>
                {summary && (
                  <p className="pl-3 text-[11px] text-neutral-400">{summary}</p>
                )}
              </div>
            );
          })}

          <Dashed />

          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{money(order.total)}</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Delivery</span>
            <span>{DELIVERY_BY_ID[order.deliverySpeed].label}</span>
          </div>
          {order.promoCode && (
            <div className="flex justify-between text-neutral-500">
              <span>Promo</span>
              <span>{order.promoCode}</span>
            </div>
          )}
          <div className="flex justify-between text-brand-600">
            <span>Points earned</span>
            <span>+{order.pointsEarned}</span>
          </div>

          <Dashed />

          <p className="text-center text-[11px] tracking-widest">
            *** THANK YOU ***
          </p>
          <p className="mt-1 text-center text-[11px] text-neutral-400">
            Delivered to {order.addressLabel ?? order.address}
          </p>
        </div>

        <button onClick={() => navigate("/")} className="btn-secondary w-full">
          <HomeIcon size={18} /> Back to home
        </button>
      </div>
    </Screen>
  );
}

function Segment({ fill, active }: { fill: number; active: boolean }) {
  return (
    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
      <motion.div
        className="relative h-full overflow-hidden rounded-full bg-white/70"
        initial={false}
        animate={{ width: `${fill * 100}%` }}
        transition={{ ease: "linear", duration: 0.6 }}
      >
        {active && (
          <motion.span
            className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-white/0 via-white to-white/0"
            initial={{ x: "-70%" }}
            animate={{ x: "230%" }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
          />
        )}
      </motion.div>
    </div>
  );
}

function Dashed() {
  return <div className="my-2 border-t border-dashed border-neutral-300" />;
}
