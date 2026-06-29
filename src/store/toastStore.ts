import { create } from "zustand";

export type Toast = { id: number; message: string; emoji?: string };

type ToastState = {
  toasts: Toast[];
  show: (message: string, emoji?: string) => void;
  dismiss: (id: number) => void;
};

let counter = 0;

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  show: (message, emoji) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts, { id, message, emoji }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 1900);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
