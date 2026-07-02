import { useNavigate } from "react-router-dom";
import { Plus, Flame } from "lucide-react";
import { motion } from "framer-motion";
import type { MenuItem } from "../data/types";
import { money } from "../lib/format";
import { needsCustomisation, buildDefaultChoices } from "../lib/pricing";
import { useCart } from "../store/cartStore";
import { useToasts } from "../store/toastStore";
import { ordersToday, sellingFast } from "../lib/urgency";
import Thumb from "./Thumb";

const TAG_STYLE: Record<string, string> = {
  popular: "bg-brand-50 text-brand-600",
  new: "bg-gold-50 text-gold-600",
  spicy: "bg-red-50 text-red-600",
};
const TAG_LABEL: Record<string, string> = {
  popular: "🔥 Popular",
  new: "✨ New",
  spicy: "🌶️ Spicy",
};

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
  const popular = item.tags?.includes("popular") ?? false;
  const fast = sellingFast(storeId, item.id);

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      className="flex cursor-pointer gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-black/[0.04] transition active:scale-[0.99]"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {(item.tags?.length ?? 0) > 0 && (
          <div className="mb-1 flex flex-wrap gap-1">
            {item.tags!.map((t) => (
              <span
                key={t}
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${TAG_STYLE[t]}`}
              >
                {TAG_LABEL[t]}
              </span>
            ))}
          </div>
        )}
        <h4 className="truncate font-semibold leading-snug text-neutral-900">
          {item.name}
        </h4>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500">
          {item.description}
        </p>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <p className="text-sm font-bold text-neutral-900">
            {money(item.basePrice)}
            {needsCustomisation(item) && (
              <span className="ml-0.5 text-xs font-normal text-neutral-400">
                +
              </span>
            )}
          </p>
          {popular ? (
            <span className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-500">
              <Flame size={11} />
              {ordersToday(storeId, item.id, true)} ordered today
            </span>
          ) : (
            fast && (
              <span className="text-[11px] font-semibold text-gold-600">
                Selling fast
              </span>
            )
          )}
        </div>
      </div>
      <div className="relative shrink-0">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-xl bg-neutral-100 text-4xl">
          <Thumb
            src={item.icon}
            emoji={item.emoji}
            alt={item.name}
            fit="contain"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={quickAdd}
          aria-label={`Add ${item.name}`}
          className="bg-sunset absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full text-white shadow-glow ring-1 ring-white/40"
        >
          <Plus size={18} strokeWidth={3} />
        </motion.button>
      </div>
    </div>
  );
}
