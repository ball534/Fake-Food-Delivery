import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Home as HomeIcon, Search as SearchIcon, ReceiptText, User } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useApplyTheme, useOrderTicker } from "./lib/hooks";
import { useOrders } from "./store/orderStore";
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

export default function App() {
  useApplyTheme();
  useOrderTicker();
  const location = useLocation();

  // The tab bar is hidden on "full-screen" sub-pages for an app-like feel.
  const hideTabBar = /^\/(store|item|cart|checkout|track|legal)\b/.test(
    location.pathname,
  );

  return (
    <div className="min-h-[100dvh] bg-neutral-100 dark:bg-black">
      <div className="phone-frame">
        <Toaster />
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-neutral-950">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/store/:storeId" element={<StoreMenu />} />
              <Route path="/item/:storeId/:itemId" element={<ItemDetail />} />
              <Route path="/cart" element={<Navigate to="/checkout" replace />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/track/:orderId" element={<OrderTracking />} />
              <Route path="/legal/:doc" element={<Legal />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </AnimatePresence>
        </main>
        {!hideTabBar && <TabBar />}
      </div>
    </div>
  );
}
