import type { ReactNode } from "react";

export default function EmptyState({
  emoji,
  title,
  subtitle,
  action,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-3 text-6xl">{emoji}</div>
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h3>
      {subtitle && (
        <p className="mt-1 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
