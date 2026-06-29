import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { MenuItem } from "../data/types";
import { money } from "../lib/format";
import { needsCustomisation, buildDefaultChoices } from "../lib/pricing";
import { useCart } from "../store/cartStore";
import { useToasts } from "../store/toastStore";

/**
 * A menu-item row. Tapping the row opens the customise page. The + button
 * quick-adds items with no options, or opens customise when choices matter.
 * If adding from a different store, defers to the StoreMenu's clear-cart flow
 * by routing through the detail page.
 */
export default function ItemCard({
  item,
  storeId,
}: {
  item: MenuItem;
  storeId: string;
}) {
  const navigate = useNavigate();
  const addLine = useCart((s) => s.addLine);
  const wouldReplace = useCart((s) => s.wouldReplace);
  const showToast = useToasts((s) => s.show);

  const open = () => navigate(`/item/${storeId}/${item.id}`);

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Anything needing customisation or a store switch goes through detail.
    if (needsCustomisation(item) || wouldReplace(storeId)) {
      open();
      return;
    }
    addLine({
      item,
      storeId,
      qty: 1,
      selectedChoices: buildDefaultChoices(item),
    });
    showToast(`Added ${item.name}`, "🛒");
  };

  return (
    <div
      onClick={open}
      className="flex cursor-pointer gap-3 rounded-2xl bg-white p-3 shadow-card transition active:scale-[0.99] dark:bg-neutral-900"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1.5">
          <h4 className="truncate font-semibold text-neutral-900 dark:text-white">
            {item.name}
          </h4>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
          {item.description}
        </p>
        <p className="mt-1.5 text-sm font-bold text-neutral-900 dark:text-white">
          {money(item.basePrice)}
          {needsCustomisation(item) && (
            <span className="ml-1 text-xs font-normal text-neutral-400">+</span>
          )}
        </p>
      </div>
      <div className="relative shrink-0">
        <div className="grid h-20 w-20 place-items-center rounded-xl bg-neutral-100 text-4xl dark:bg-neutral-800">
          {item.emoji}
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={quickAdd}
          aria-label={`Add ${item.name}`}
          className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white shadow-card-hover"
        >
          <Plus size={18} strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
}
