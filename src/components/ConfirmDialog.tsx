import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="m-4 w-full max-w-sm rounded-2xl bg-white p-5 shadow-card-hover"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
            {body && (
              <div className="mt-2 text-sm text-neutral-500">{body}</div>
            )}
            <div className="mt-5 flex gap-3">
              <button onClick={onCancel} className="btn-secondary flex-1">
                {cancelLabel}
              </button>
              <button onClick={onConfirm} className="btn-primary flex-1">
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
