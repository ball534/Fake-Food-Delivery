import { AnimatePresence, motion } from "framer-motion";
import { useToasts } from "../store/toastStore";

export default function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 mx-auto flex max-w-[440px] flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-card-hover dark:bg-white dark:text-neutral-900"
          >
            {t.emoji && <span className="text-base">{t.emoji}</span>}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
