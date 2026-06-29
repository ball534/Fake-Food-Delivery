import { useEffect, useState } from "react";
import { useOrders } from "../store/orderStore";

/** FakeEats is light-themed — ensure the `dark` class is never set on <html>. */
export function useApplyTheme() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
}

/** Drive order-lifecycle progression app-wide while any order is active. */
export function useOrderTicker(intervalMs = 1000) {
  const tick = useOrders((s) => s.tick);
  useEffect(() => {
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);
}

/** A ticking "now" (epoch ms) for live countdowns. Re-renders each interval. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
