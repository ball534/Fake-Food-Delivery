import { useState } from "react";

export default function Thumb({
  src,
  emoji,
  fallback = "img",
  alt = "",
  rounded = "rounded-xl",
  fit = "cover",
}: {
  src?: string;
  emoji?: string;
  fallback?: string;
  alt?: string;
  rounded?: string;
  fit?: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    // "contain" caps the image by both dimensions so a square image never
    // overflows a wide box (which would clip it). "cover" fills and crops.
    const fitClass =
      fit === "contain"
        ? "max-h-full max-w-full object-contain"
        : "h-full w-full object-cover";
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${fitClass} ${rounded}`}
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
