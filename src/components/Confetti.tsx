import { motion } from "framer-motion";

const PIECES = ["🎉", "🎊", "✨", "🥳", "🍔", "🍟", "🧋", "⭐"];

export default function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: 28 }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 7) * 0.08;
        const piece = PIECES[i % PIECES.length];
        const drift = ((i % 5) - 2) * 24;
        return (
          <motion.span
            key={i}
            className="absolute top-0 text-xl"
            style={{ left: `${left}%` }}
            initial={{ y: -40, opacity: 0, rotate: 0 }}
            animate={{
              y: "110vh",
              x: drift,
              opacity: [0, 1, 1, 0.8],
              rotate: 360,
            }}
            transition={{
              duration: 2.4 + (i % 4) * 0.3,
              delay,
              ease: "easeIn",
            }}
          >
            {piece}
          </motion.span>
        );
      })}
    </div>
  );
}
