import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import type { GeoPoint } from "../data/types";

type Suggestion = { id: string; line: string; loc?: GeoPoint };

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onChange: (line: string, loc?: GeoPoint) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const skipNext = useRef(false);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const term = value.trim();
    if (term.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=0&limit=6&q=${encodeURIComponent(
            term,
          )}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const data: unknown = await res.json();
        const list: Suggestion[] = (Array.isArray(data) ? data : [])
          .map((d) => {
            const row = d as {
              place_id?: number | string;
              display_name?: string;
              lat?: string;
              lon?: string;
            };
            const lat = Number(row.lat);
            const lng = Number(row.lon);
            const loc =
              Number.isFinite(lat) && Number.isFinite(lng)
                ? { lat, lng }
                : undefined;
            return {
              id: String(row.place_id ?? ""),
              line: row.display_name ?? "",
              loc,
            };
          })
          .filter((s) => s.line);
        setSuggestions(list);
        setOpen(list.length > 0);
      } catch {
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(handle);
      controller.abort();
    };
  }, [value]);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const pick = (s: Suggestion) => {
    skipNext.current = true;
    onChange(s.line, s.loc);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:text-white"
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-card dark:border-neutral-700 dark:bg-neutral-900">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => pick(s)}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                <MapPin size={15} className="mt-0.5 shrink-0 text-brand-500" />
                <span className="line-clamp-2">{s.line}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {loading && value.trim().length >= 3 && (
        <p className="mt-1 px-1 text-xs text-neutral-400">Finding addresses…</p>
      )}
    </div>
  );
}
