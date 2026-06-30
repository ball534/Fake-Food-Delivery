import { useEffect, useState } from "react";
import { useOrders } from "../store/orderStore";

export function useApplyTheme() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
}

export function useOrderTicker(intervalMs = 1000) {
  const tick = useOrders((s) => s.tick);
  useEffect(() => {
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);
}

export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
