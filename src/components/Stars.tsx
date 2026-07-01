import { Star } from "lucide-react";

export default function Stars({
  value,
  onChange,
  size = 20,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const interactive = !!onChange;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const star = (
          <Star
            size={size}
            className={
              filled ? "fill-amber-400 text-amber-400" : "text-neutral-300"
            }
          />
        );
        return interactive ? (
          <button
            key={n}
            aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
            onClick={() => onChange(n)}
            className="active:scale-90"
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}
