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
        transparent
          ? ""
          : "border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90"
      }`}
    >
      <button
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-neutral-800 shadow-card backdrop-blur active:scale-95 dark:bg-neutral-800/80 dark:text-neutral-100"
      >
        <ChevronLeft size={24} />
      </button>
      {title && (
        <h1 className="flex-1 truncate text-lg font-bold text-neutral-900 dark:text-white">
          {title}
        </h1>
      )}
      <div className="ml-auto flex items-center gap-1">{right}</div>
    </header>
  );
}
