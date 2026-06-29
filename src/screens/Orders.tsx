import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Screen from "../components/Screen";
import EmptyState from "../components/EmptyState";
import Stars from "../components/Stars";
import { useOrders } from "../store/orderStore";
import { useCart } from "../store/cartStore";
import { useToasts } from "../store/toastStore";
import { STATUS_LABEL } from "../lib/simulation";
import { formatClock, formatDate, money, pluralize } from "../lib/format";
import type { Order } from "../data/types";

export default function Orders() {
  const orders = useOrders((s) => s.orders);
  const active = orders.filter((o) => o.status !== "delivered");
  const past = orders.filter((o) => o.status === "delivered");
  const [tab, setTab] = useState<"active" | "past">("active");

  if (orders.length === 0) {
    return (
      <Screen>
        <Header />
        <EmptyState
          emoji="🧾"
          title="No orders yet"
          subtitle="When you place an order, you can track it live right here."
        />
      </Screen>
    );
  }

  const list = tab === "active" ? active : past;

  return (
    <Screen className="pb-6">
      <Header />
      <div className="sticky top-0 z-10 flex gap-2 border-b border-neutral-200 bg-neutral-50/95 px-4 py-2.5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <button
          onClick={() => setTab("active")}
          className={`chip ${tab === "active" ? "chip-active" : ""}`}
        >
          Active {active.length > 0 && `· ${active.length}`}
        </button>
        <button
          onClick={() => setTab("past")}
          className={`chip ${tab === "past" ? "chip-active" : ""}`}
        >
          Past {past.length > 0 && `· ${past.length}`}
        </button>
      </div>

      <div className="space-y-3 p-4">
        {list.length === 0 ? (
          <EmptyState
            emoji={tab === "active" ? "🛵" : "📦"}
            title={tab === "active" ? "No active orders" : "No past orders"}
            subtitle={
              tab === "active"
                ? "Your in-progress deliveries will show here."
                : "Delivered orders will be archived here."
            }
          />
        ) : (
          list.map((o) => <OrderRow key={o.id} order={o} />)
        )}
      </div>
    </Screen>
  );
}

function Header() {
  return (
    <div className="bg-gradient-to-b from-brand-500 to-brand-600 px-4 pb-4 pt-6 text-white">
      <h1 className="text-2xl font-extrabold">Orders</h1>
      <p className="text-sm text-brand-50/90">Track your (pretend) deliveries</p>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const navigate = useNavigate();
  const reorder = useCart((s) => s.reorder);
  const rateOrder = useOrders((s) => s.rateOrder);
  const showToast = useToasts((s) => s.show);

  const isActive = order.status !== "delivered";

  const doReorder = (e: React.MouseEvent) => {
    e.stopPropagation();
    reorder(order.storeId, order.lines);
    showToast("Added to cart", "🔁");
    navigate("/checkout");
  };

  return (
    <div
      onClick={() => navigate(`/track/${order.id}`)}
      className="cursor-pointer rounded-2xl bg-white p-4 shadow-card active:scale-[0.99] dark:bg-neutral-900"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-neutral-100 text-2xl dark:bg-neutral-800">
          {order.storeEmoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-neutral-900 dark:text-white">
            {order.storeName}
          </p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {pluralize(order.lines.reduce((n, l) => n + l.qty, 0), "item")} ·{" "}
            {money(order.total)} · {formatDate(order.placedAt)}
          </p>
          <p className="mt-0.5 text-xs font-medium text-brand-600 dark:text-brand-400">
            +{order.pointsEarned} points ✨
          </p>
        </div>
        {isActive ? (
          <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            ETA {formatClock(order.etaAt)}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800">
            Delivered
          </span>
        )}
      </div>

      {isActive && (
        <p className="mt-2 text-sm font-medium text-brand-600 dark:text-brand-400">
          {STATUS_LABEL[order.status]} →
        </p>
      )}

      {!isActive && (
        <div
          className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800"
          onClick={(e) => e.stopPropagation()}
        >
          {order.rating ? (
            <Stars value={order.rating} size={16} />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Rate:</span>
              <Stars
                value={0}
                size={18}
                onChange={(v) => {
                  rateOrder(order.id, v);
                  showToast("Thanks for rating!", "⭐");
                }}
              />
            </div>
          )}
          <button
            onClick={doReorder}
            className="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-700 active:scale-95 dark:bg-neutral-800 dark:text-neutral-200"
          >
            <RefreshCw size={13} /> Reorder
          </button>
        </div>
      )}
    </div>
  );
}
