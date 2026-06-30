import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "../store/cartStore";
import { money, pluralize } from "../lib/format";
import { useStores } from "../store/storesStore";
import { describeChoices } from "../lib/pricing";
import Thumb from "./Thumb";

/**
 * Floating cart on the store menu. Tap to expand an inline list of your items
 * — adjust quantities and pick-and-mix without leaving the menu — then check
 * out. Collapsed it just shows the running count + subtotal.
 */
export default function CartBar() {
  const navigate = useNavigate();
  const cart = useCart((s) => s.cart);
  const count = useCart((s) => s.itemCount());
  const subtotal = useCart((s) => s.subtotal());
  const setQty = useCart((s) => s.setQty);
  const removeLine = useCart((s) => s.removeLine);
  const [expanded, setExpanded] = useState(false);

  const byId = useStores((s) => s.byId);
  const store = cart.storeId ? byId[cart.storeId] : null;
  const open = count > 0;
  const showList = expanded && open;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[440px] flex-col gap-2 p-3"
        >
          {/* Expandable item list (pick & mix) */}
          <AnimatePresence>
            {showList && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="pointer-events-auto overflow-hidden rounded-2xl bg-white shadow-card-hover dark:bg-neutral-900"
              >
                <div className="max-h-[44vh] divide-y divide-neutral-100 overflow-y-auto dark:divide-neutral-800">
                  {cart.lines.map((line) => {
                    const item = store?.menu
                      .flatMap((c) => c.items)
                      .find((i) => i.id === line.itemId);
                    const name = item?.name ?? line.name ?? "Item";
                    const icon = item?.icon ?? line.icon;
                    const emoji = item?.emoji ?? line.emoji;
                    const summary = item
                      ? describeChoices(item, line.selectedChoices)
                      : "";
                    return (
                      <div key={line.lineId} className="flex items-center gap-3 p-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                          <Thumb src={icon} emoji={emoji} fallback="food" alt={name} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                            {name}
                          </p>
                          {summary && (
                            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                              {summary}
                            </p>
                          )}
                          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            {money(line.lineTotal)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() =>
                              line.qty <= 1
                                ? removeLine(line.lineId)
                                : setQty(line.lineId, line.qty - 1)
                            }
                            aria-label={line.qty <= 1 ? "Remove" : "Decrease"}
                            className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-neutral-600 active:scale-90 dark:bg-neutral-800 dark:text-neutral-300"
                          >
                            {line.qty <= 1 ? <Trash2 size={13} /> : <Minus size={14} />}
                          </button>
                          <span className="w-4 text-center text-sm font-bold text-neutral-900 dark:text-white">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => setQty(line.lineId, line.qty + 1)}
                            aria-label="Increase"
                            className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-neutral-600 active:scale-90 dark:bg-neutral-800 dark:text-neutral-300"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="btn-primary w-full rounded-none py-3.5"
                >
                  Go to checkout · {money(subtotal)}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The bar itself — tap to expand/collapse the order */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="pointer-events-auto flex w-full items-center justify-between rounded-2xl bg-brand-500 px-4 py-3.5 text-white shadow-card-hover active:scale-[0.99]"
          >
            <span className="flex items-center gap-2 font-semibold">
              <span className="relative">
                <ShoppingBag size={20} />
                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-white px-1 text-[10px] font-bold text-brand-600">
                  {count}
                </span>
              </span>
              {showList ? "Hide order" : "Your order"}
            </span>
            <span className="flex items-center gap-2 text-sm font-medium text-brand-50">
              {pluralize(count, "item")} · {money(subtotal)}
              <motion.span animate={{ rotate: showList ? 0 : 180 }}>
                <ChevronDown size={18} />
              </motion.span>
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
