import { create } from "zustand";

// One-shot celebration events (point bursts). Fire-and-forget: the PointsBurst
// overlay renders whatever is here and clears it when the animation ends.
type Celebration = {
  id: number;
  points: number;
  label?: string;
};

type CelebrationState = {
  current: Celebration | null;
  fire: (points: number, label?: string) => void;
  clear: () => void;
};

let nextId = 1;

export const useCelebration = create<CelebrationState>((set) => ({
  current: null,
  fire: (points, label) => set({ current: { id: nextId++, points, label } }),
  clear: () => set({ current: null }),
}));
