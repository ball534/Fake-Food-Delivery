import type { Deal } from "../data/promos";
import { money } from "../lib/format";

// Price row for combo/item deals, shown on the brand-gradient deal cards
// (white text). Renders nothing for promo-code deals, which have no price.
export default function DealPrice({
  deal,
  className = "",
}: {
  deal: Deal;
  className?: string;
}) {
  if (deal.price == null) return null;
  const save =
    deal.originalPrice != null
      ? Math.round((deal.originalPrice - deal.price) * 100) / 100
      : 0;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="font-extrabold">{money(deal.price)}</span>
      {deal.originalPrice != null && (
        <span className="text-sm text-white/60 line-through">
          {money(deal.originalPrice)}
        </span>
      )}
      {save > 0 && (
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          Save {money(save)}
        </span>
      )}
      {deal.pointsCost != null && deal.pointsCost > 0 && (
        <span className="rounded-full bg-amber-300/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-50">
          🔓 {deal.pointsCost} pts
        </span>
      )}
    </div>
  );
}
