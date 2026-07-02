import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Gift, Sparkles } from "lucide-react";
import { useProfile, dayStamp } from "../store/profileStore";
import { useCelebration } from "../store/celebrationStore";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { seededInt } from "../lib/urgency";

type RewardState = { day: string; claimed: boolean };

// Today's prize is derived from the date so it can't be re-rolled.
const PRIZES = [20, 25, 30, 40, 50, 75, 100];
function prizeForToday(): number {
  return PRIZES[seededInt(`scratch:${dayStamp()}`, 0, PRIZES.length - 1)];
}

const REVEAL_AT = 0.5; // fraction scratched before the card pops open

// Daily scratch-and-win card. A gold foil canvas sits over the prize; rubbing
// it erases the foil (destination-out) and past the threshold the reward is
// granted once per calendar day.
export default function ScratchCard() {
  const grantPoints = useProfile((s) => s.grantPoints);
  const fire = useCelebration((s) => s.fire);
  const [state, setState] = useState<RewardState>(() => {
    const stored = loadJSON<RewardState | null>(STORAGE_KEYS.dailyReward, null);
    return stored && stored.day === dayStamp()
      ? stored
      : { day: dayStamp(), claimed: false };
  });
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cells = useRef(new Set<number>());
  const scratching = useRef(false);
  const done = useRef(false);
  const prize = prizeForToday();

  useEffect(() => {
    if (state.claimed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, "#FFCC4A");
    grad.addColorStop(0.5, "#F99307");
    grad.addColorStop(1, "#FFB520");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "800 15px 'Baloo 2', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH ME 🎁", rect.width / 2, rect.height / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.claimed]);

  const claim = () => {
    if (done.current) return;
    done.current = true;
    setRevealed(true);
    const next = { day: dayStamp(), claimed: true };
    saveJSON(STORAGE_KEYS.dailyReward, next);
    grantPoints(prize);
    fire(prize, "Daily scratch reward");
    // Keep the revealed prize on screen for a beat before collapsing to the
    // claimed state.
    setTimeout(() => setState(next), 2200);
  };

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!scratching.current || done.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Coverage estimate on a coarse grid — enough to know when to pop.
    const COLS = 12;
    const ROWS = 4;
    const col = Math.floor((x / rect.width) * COLS);
    const row = Math.floor((y / rect.height) * ROWS);
    cells.current.add(row * COLS + col);
    if (cells.current.size / (COLS * ROWS) >= REVEAL_AT) claim();
  };

  if (state.claimed && !revealed) {
    return (
      <div className="card flex items-center gap-3 p-3.5">
        <span className="bg-goldshine grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-glow-gold">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-neutral-900">
            Daily reward claimed · +{prize} pts
          </p>
          <p className="text-xs text-neutral-500">
            A fresh scratch card lands tomorrow 🎁
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="gloss bg-sunset-deep relative overflow-hidden rounded-2xl p-3.5 text-white shadow-glow"
    >
      <div className="relative z-[1] mb-2.5 flex items-center gap-2">
        <Gift size={17} className="animate-float" />
        <p className="font-display text-base font-bold leading-none">
          Daily Scratch & Win
        </p>
        <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          1 / day
        </span>
      </div>
      <div className="relative z-[1] h-[72px] overflow-hidden rounded-xl">
        <div className="glass-warm absolute inset-0 grid place-items-center rounded-xl">
          <motion.p
            initial={false}
            animate={
              revealed ? { scale: [1, 1.25, 1.1] } : { scale: 1, opacity: 0.95 }
            }
            className="font-display text-2xl font-extrabold tracking-tight"
          >
            +{prize} points!
          </motion.p>
        </div>
        {!revealed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none rounded-xl"
            onPointerDown={(e) => {
              scratching.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratch(e);
            }}
            onPointerMove={scratch}
            onPointerUp={() => (scratching.current = false)}
            onPointerCancel={() => (scratching.current = false)}
          />
        )}
      </div>
    </motion.div>
  );
}
