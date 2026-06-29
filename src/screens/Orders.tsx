import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Screen from "../components/Screen";
import EmptyState from "../components/EmptyState";
import Stars from "../components/Stars";
import { useOrders, MAX_ACTIVE_ORDERS } from "../store/orderStore";
import { useCart } from "../store/cartStore";
import { useToasts } from "../store/toastStore";
import { STATUS_LABEL } from "../lib/simulation";
import { formatClock, formatDate, money, pluralize } from "../lib/format";
import type { Order } from "../data/types";

export default function Orders() {
  const orders = useOrders((s) => s.orders);
  const active = orders.filter((o) => o.status !== "delivered");
  const past = orders.filter((o) => o.status === "delivered");

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

  return (
    <Screen className="pb-6">
      <Header />
      <div className="space-y-6 p-4">
        {/* Active deliveries first */}
        {active.length > 0 && (
          <section>
            <SectionHeading
              title="Active"
              count={`${active.length}/${MAX_ACTIVE_ORDERS}`}
            />
            <div className="space-y-3">
              {active.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </div>
          </section>
        )}

        {/* Past orders below */}
        {past.length > 0 && (
          <section>
            <SectionHeading title="Past orders" count={`${past.length}`} />
            <div className="space-y-3">
              {past.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Screen>
  );
}

function SectionHeading({ title, count }: { title: string; count: string }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-base font-bold tracking-tight text-neutral-900 dark:text-white">
      {title}
      <span className="text-sm font-medium text-neutral-400">{count}</span>
    </h2>
  );
}

function Header() {
  return (
    <div className="bg-gradient-to-b from-brand-500 to-brand-600 px-4 pb-4 pt-6 text-white">
      <h1 className="text-2xl font-extrabold">Orders</h1>
      <p className="text-sm text-brand-50/90">Track your deliveries</p>
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
