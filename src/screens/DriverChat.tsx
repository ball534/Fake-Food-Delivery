import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import Screen from "../components/Screen";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import { useOrders } from "../store/orderStore";
import { useChat } from "../store/chatStore";
import { useContent } from "../store/contentStore";
import { STATUS_LABEL } from "../lib/simulation";
import {
  driverReply,
  formatEta,
  greetingText,
  type ChatContext,
} from "../lib/driverChat";
import { formatClock } from "../lib/format";

export default function DriverChat() {
  const { orderId = "" } = useParams();
  const order = useOrders((s) => s.orders.find((o) => o.id === orderId));
  const messages = useChat((s) => s.threads[orderId] ?? []);
  const append = useChat((s) => s.append);
  const config = useContent((s) => s.driverChat);

  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout>>();

  // Seed the driver's opening line the first time this thread is opened.
  useEffect(() => {
    if (!order) return;
    if (useChat.getState().messages(orderId).length > 0) return;
    const ctx: ChatContext = {
      driver: order.driver.name,
      store: order.storeName,
      eta: formatEta(order.etaAt, Date.now()),
    };
    append(orderId, "driver", greetingText(config, ctx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, order?.id]);

  // Keep the newest message in view (including the typing bubble).
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, typing]);

  useEffect(() => () => clearTimeout(replyTimer.current), []);

  if (!order) {
    return (
      <Screen>
        <TopBar title="Chat" />
        <EmptyState emoji="🤷" title="Order not found" />
      </Screen>
    );
  }

  const delivered = order.status === "delivered";

  function send() {
    const text = draft.trim();
    if (!text || !order) return;
    append(orderId, "user", text);
    setDraft("");

    const ctx: ChatContext = {
      driver: order.driver.name,
      store: order.storeName,
      eta: formatEta(order.etaAt, Date.now()),
    };
    const reply = driverReply(
      text,
      config,
      ctx,
      useChat.getState().messages(orderId).length,
    );

    setTyping(true);
    clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setTyping(false);
      append(orderId, "driver", reply);
    }, 900 + Math.min(text.length * 25, 1200));
  }

  return (
    <Screen className="flex h-full flex-col">
      <TopBar
        title={order.driver.name}
        right={
          <span className="mr-1 text-xs font-medium text-brand-600">
            {delivered ? "Delivered" : "Online"}
          </span>
        }
      />

      <div className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-50 text-xl">
          <UserRound size={24} className="text-brand-400" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-neutral-900">
            {order.driver.name}
          </p>
          <p className="truncate text-xs text-neutral-500">
            Your driver · {STATUS_LABEL[order.status]}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto bg-neutral-50 p-4"
      >
        {messages.map((m) => (
          <Bubble key={m.id} from={m.from} text={m.text} at={m.at} />
        ))}
        {typing && <TypingBubble />}
      </div>

      <div className="flex items-center gap-2 border-t border-black/5 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder={`Message ${order.driver.name}…`}
          aria-label="Message driver"
          className="min-w-0 flex-1 rounded-full border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:bg-white"
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Send message"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-500 text-white shadow-card transition active:scale-90 disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </Screen>
  );
}

function Bubble({
  from,
  text,
  at,
}: {
  from: "user" | "driver";
  text: string;
  at: number;
}) {
  const mine = from === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-card ${
          mine
            ? "rounded-br-md bg-brand-500 text-white"
            : "rounded-bl-md bg-white text-neutral-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{text}</p>
        <p
          className={`mt-0.5 text-[10px] ${
            mine ? "text-brand-50/80" : "text-neutral-400"
          }`}
        >
          {formatClock(at)}
        </p>
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-card">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-neutral-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
