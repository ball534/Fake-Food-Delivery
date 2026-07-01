import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function TopBar({
  title,
  right,
  transparent = false,
}: {
  title?: string;
  right?: ReactNode;
  transparent?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <header
      className={`sticky top-0 z-20 flex h-14 items-center gap-2 px-3 ${
        transparent ? "" : "glass-nav border-b border-black/5"
      }`}
    >
      <button
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="grid h-10 w-10 place-items-center rounded-full border border-white/50 bg-white/70 text-neutral-800 shadow-card backdrop-blur-xl backdrop-saturate-150 active:scale-95"
      >
        <ChevronLeft size={24} />
      </button>
      {title && (
        <h1 className="flex-1 truncate text-lg font-bold text-neutral-900">
          {title}
        </h1>
      )}
      <div className="ml-auto flex items-center gap-1">{right}</div>
    </header>
  );
}
