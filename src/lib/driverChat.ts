// The messaging screen's "AI-ish" driver. The driver's personality — its
// opening line, the intents it recognises, and the canned replies for each —
// all live in public/content.json under `driverChat`, so it's fully data
// driven and authorable without touching code. This module holds the types,
// the sensible fallbacks used before content loads, the JSON parser, and the
// keyword-matching engine that best-guesses what the user meant.

type ChatIntent = {
  id: string;
  keywords: string[];
  replies: string[];
};

export type DriverChatConfig = {
  greeting: string;
  intents: ChatIntent[];
  fallback: string[];
};

export const DEFAULT_DRIVER_CHAT: DriverChatConfig = {
  greeting:
    "Hey, it's {driver}! 🛵 I've got your {store} order and I'm on the way. Let me know if you need anything!",
  intents: [
    {
      id: "eta",
      keywords: ["how long", "eta", "when", "arrive", "how far", "almost"],
      replies: [
        "I'm about {eta} away — hang tight! 🛵",
        "Should be roughly {eta} out, moving as fast as I safely can!",
      ],
    },
    {
      id: "location",
      keywords: ["where are you", "where you", "your location", "outside"],
      replies: [
        "Just a few streets away, following the map to you now.",
        "I'm close! Pulling into your area shortly.",
      ],
    },
    {
      id: "thanks",
      keywords: ["thank", "thanks", "cheers", "appreciate"],
      replies: ["You're welcome! 😊 See you in a bit.", "Anytime! 🙌"],
    },
  ],
  fallback: [
    "Got it! 👍 I'll keep that in mind.",
    "No worries — I'm on my way with your order. 🛵",
  ],
};

const str = (v: unknown): string => (typeof v === "string" ? v : "");
const strList = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "")
    : [];

export function parseDriverChat(value: unknown): DriverChatConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_DRIVER_CHAT;
  }
  const obj = value as Record<string, unknown>;

  const intents: ChatIntent[] = [];
  if (Array.isArray(obj.intents)) {
    for (const raw of obj.intents) {
      if (!raw || typeof raw !== "object") continue;
      const r = raw as Record<string, unknown>;
      const keywords = strList(r.keywords);
      const replies = strList(r.replies);
      if (keywords.length === 0 || replies.length === 0) continue;
      intents.push({ id: str(r.id) || `intent-${intents.length}`, keywords, replies });
    }
  }

  const greeting = str(obj.greeting) || DEFAULT_DRIVER_CHAT.greeting;
  const fallback = strList(obj.fallback);

  return {
    greeting,
    intents: intents.length > 0 ? intents : DEFAULT_DRIVER_CHAT.intents,
    fallback: fallback.length > 0 ? fallback : DEFAULT_DRIVER_CHAT.fallback,
  };
}

// Placeholders any reply/greeting may contain.
export type ChatContext = {
  driver: string;
  store: string;
  eta: string;
};

function fillTemplate(template: string, ctx: ChatContext): string {
  return template
    .replace(/\{driver\}/g, ctx.driver)
    .replace(/\{store\}/g, ctx.store)
    .replace(/\{eta\}/g, ctx.eta);
}

// Deterministic-ish pick that still varies between replies: seed rotates the
// pool so the driver doesn't repeat the same line back to back.
function pick(pool: string[], seed: number): string {
  if (pool.length === 0) return "";
  return pool[Math.abs(Math.floor(seed)) % pool.length];
}

export function greetingText(config: DriverChatConfig, ctx: ChatContext): string {
  return fillTemplate(config.greeting, ctx);
}

// Best-guess the user's intent from their message by scanning each intent's
// keywords in priority order (first match wins), falling back to the generic
// pool when nothing matches. `seed` varies which canned reply is chosen.
export function driverReply(
  message: string,
  config: DriverChatConfig,
  ctx: ChatContext,
  seed: number,
): string {
  const text = message.toLowerCase();
  for (const intent of config.intents) {
    if (intent.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return fillTemplate(pick(intent.replies, seed), ctx);
    }
  }
  return fillTemplate(pick(config.fallback, seed), ctx);
}

// Human-friendly ETA string from the order's arrival timestamp.
export function formatEta(etaAt: number, now: number): string {
  const mins = Math.round((etaAt - now) / 60000);
  if (mins <= 0) return "arriving any moment now";
  if (mins === 1) return "1 minute";
  return `${mins} minutes`;
}
