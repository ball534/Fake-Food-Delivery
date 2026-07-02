import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCelebration } from "../store/celebrationStore";

const COINS = ["🪙", "✨", "⭐", "💰", "🪙", "✨"];

// Full-screen "+N pts" celebration. Fired from the celebration store whenever
// the wallet grows (order placed, scratch card won). Purely decorative and
// self-dismissing.
export default function PointsBurst() {
  const current = useCelebration((s) => s.current);
  const clear = useCelebration((s) => s.clear);

  useEffect(() => {
    if (!current) return;
    const id = setTimeout(clear, 1900);
    return () => clearTimeout(id);
  }, [current, clear]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-[60] mx-auto grid max-w-[440px] place-items-center overflow-hidden"
        >
          {COINS.map((c, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl"
              style={{ left: `${14 + i * 14}%`, top: "58%" }}
              initial={{ y: 0, opacity: 0, scale: 0.6 }}
              animate={{
                y: -(90 + (i % 3) * 46),
                x: (i % 2 === 0 ? -1 : 1) * (10 + i * 6),
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.15, 1, 0.8],
                rotate: (i % 2 === 0 ? -1 : 1) * 24,
              }}
              transition={{ duration: 1.5, delay: i * 0.06, ease: "easeOut" }}
            >
              {c}
            </motion.span>
          ))}
          <motion.div
            initial={{ scale: 0.4, y: 26, opacity: 0 }}
            animate={{ scale: [0.4, 1.12, 1], y: [26, -6, 0], opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="gloss flex flex-col items-center gap-0.5 rounded-3xl bg-gold-400 px-7 py-4 text-white shadow-glow-gold"
          >
            <span className="flex items-center gap-2 font-display text-3xl font-extrabold drop-shadow-sm">
              <Sparkles size={26} /> +{current.points} pts
            </span>
            {current.label && (
              <span className="text-xs font-bold text-white/90">
                {current.label}
              </span>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
