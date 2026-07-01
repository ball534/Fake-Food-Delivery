import { useEffect, useRef } from "react";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Home as HomeIcon,
  Search as SearchIcon,
  ReceiptText,
  User,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useApplyTheme, useOrderTicker } from "./lib/hooks";
import { useOrders } from "./store/orderStore";
import { useContent } from "./store/contentStore";
import { useStores } from "./store/storesStore";
import Toaster from "./components/Toaster";

import Home from "./screens/Home";
import Search from "./screens/Search";
import Orders from "./screens/Orders";
import Profile from "./screens/Profile";
import StoreMenu from "./screens/StoreMenu";
import ItemDetail from "./screens/ItemDetail";
import Checkout from "./screens/Checkout";
import OrderTracking from "./screens/OrderTracking";
import Legal from "./screens/Legal";
import CreateStore from "./screens/CreateStore";

const TABS = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/search", label: "Search", icon: SearchIcon, end: false },
  { to: "/orders", label: "Orders", icon: ReceiptText, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
];

function TabBar() {
  const activeCount = useOrders((s) => s.activeOrders().length);

  return (
    <nav className="flex shrink-0 items-stretch border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition ${
              isActive
                ? "text-brand-600 dark:text-brand-400"
                : "text-neutral-400 dark:text-neutral-500"
            }`
          }
        >
          <span className="relative">
            <Icon size={22} strokeWidth={2.2} />
            {to === "/orders" && activeCount > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Splash({ error = false }: { error?: boolean }) {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      {error ? (
        <div className="space-y-2">
          <p className="text-3xl">🍽️</p>
          <p className="font-bold text-neutral-900 dark:text-white">
            Couldn't load the shops
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Check that <code>public/content.json</code> and the shop folders
            exist, then reload.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-neutral-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-brand-500" />
          <p className="text-sm font-medium">Loading shops…</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  useApplyTheme();
  useOrderTicker();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const loadContent = useContent((s) => s.load);
  const loadStores = useStores((s) => s.load);
  const storesLoaded = useStores((s) => s.loaded);
  const storesError = useStores((s) => s.error);

  useEffect(() => {
    loadContent();
    loadStores();
  }, [loadContent, loadStores]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  const hideTabBar =
    /^\/(store|item|cart|checkout|track|legal|create-store)\b/.test(
      location.pathname,
    );

  return (
    <div className="min-h-[100dvh] bg-neutral-100 dark:bg-black">
      <div className="phone-frame">
        <Toaster />
        <main
          ref={mainRef}
          className="relative flex-1 overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-neutral-950"
        >
          {!storesLoaded ? (
            <Splash />
          ) : storesError ? (
            <Splash error />
          ) : (
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-store" element={<CreateStore />} />
                <Route path="/store/:storeId" element={<StoreMenu />} />
                <Route path="/item/:storeId/:itemId" element={<ItemDetail />} />
                <Route
                  path="/cart"
                  element={<Navigate to="/checkout" replace />}
                />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/track/:orderId" element={<OrderTracking />} />
                <Route path="/legal/:doc" element={<Legal />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </AnimatePresence>
          )}
        </main>
        {storesLoaded && !storesError && !hideTabBar && <TabBar />}
      </div>
    </div>
  );
}
