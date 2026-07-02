import { create } from "zustand";
import { loadJSON, saveJSON, STORAGE_KEYS } from "../lib/storage";
import { makeId } from "../lib/id";

type ChatMessage = {
  id: string;
  from: "user" | "driver";
  text: string;
  at: number;
};

type ChatThreads = Record<string, ChatMessage[]>;

type ChatState = {
  threads: ChatThreads;
  messages: (orderId: string) => ChatMessage[];
  append: (orderId: string, from: ChatMessage["from"], text: string) => void;
};

function persist(threads: ChatThreads) {
  saveJSON(STORAGE_KEYS.driverChats, threads);
}

export const useChat = create<ChatState>((set, get) => ({
  threads: loadJSON<ChatThreads>(STORAGE_KEYS.driverChats, {}),

  messages: (orderId) => get().threads[orderId] ?? [],

  append: (orderId, from, text) =>
    set((s) => {
      const msg: ChatMessage = { id: makeId("msg-"), from, text, at: Date.now() };
      const thread = [...(s.threads[orderId] ?? []), msg];
      const threads = { ...s.threads, [orderId]: thread };
      persist(threads);
      return { threads };
    }),
}));
