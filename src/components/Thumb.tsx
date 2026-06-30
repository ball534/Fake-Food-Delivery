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
    const fitClass = fit === "contain" ? "object-contain" : "object-cover";
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full ${fitClass} ${rounded}`}
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
