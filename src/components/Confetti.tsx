import { motion } from "framer-motion";

const PIECES = ["🎉", "🎊", "✨", "🥳", "🍔", "🍟", "🧋", "⭐", "🍕", "🪙"];
const DOT_COLORS = ["#FF4E1F", "#FFB520", "#FF9E7B", "#FFCC4A", "#ffffff"];

export default function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {/* emoji pieces */}
      {Array.from({ length: 26 }).map((_, i) => {
        const left = (i * 37) % 100;
        const delay = (i % 7) * 0.08;
        const piece = PIECES[i % PIECES.length];
        const drift = ((i % 5) - 2) * 28;
        return (
          <motion.span
            key={`e${i}`}
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
      {/* brand-colored paper dots */}
      {Array.from({ length: 34 }).map((_, i) => {
        const left = (i * 23 + 11) % 100;
        const delay = (i % 9) * 0.07;
        const color = DOT_COLORS[i % DOT_COLORS.length];
        const drift = ((i % 7) - 3) * 22;
        const size = 5 + (i % 4) * 3;
        return (
          <motion.span
            key={`d${i}`}
            className="absolute top-0 rounded-sm"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.6,
              backgroundColor: color,
            }}
            initial={{ y: -30, opacity: 0, rotate: 0 }}
            animate={{
              y: "112vh",
              x: drift,
              opacity: [0, 1, 1, 0.7],
              rotate: (i % 2 === 0 ? 1 : -1) * 540,
            }}
            transition={{
              duration: 2.1 + (i % 5) * 0.35,
              delay,
              ease: "easeIn",
            }}
          />
        );
      })}
    </div>
  );
}
