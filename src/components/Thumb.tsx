import { useState } from "react";

/**
 * Renders a food/brand picture for the data-driven shops. Prefers the image at
 * `src`; if it's missing or fails to load it falls back to `emoji` (used by
 * promo/deal snapshot items) or, failing that, the `fallback` text label (e.g.
 * "logo", "banner", "food") so the UI reads sensibly before real art is added.
 * The parent element is expected to size + center this (e.g. a fixed-size box).
 */
export default function Thumb({
  src,
  emoji,
  fallback = "img",
  alt = "",
  rounded = "rounded-xl",
}: {
  src?: string;
  emoji?: string;
  fallback?: string;
  alt?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${rounded}`}
      />
    );
  }
  if (emoji) return <span>{emoji}</span>;
  return (
    <span className="px-1 text-center text-xs font-medium lowercase text-neutral-400 dark:text-neutral-500">
      {fallback}
    </span>
  );
}
