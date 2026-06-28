import { ReactNode, useEffect, useRef, useState } from "react";

import { Bell, Search, X, Wifi, WifiOff } from "lucide-react";

import { useLayoutStore } from "../store/layoutStore";

import { useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";

import NotificationPanel from "./NotificationPanel";

import { useRealtimeInventory } from "../hooks/useRealtimeInventory";

import { useLowStockAlerts } from "../hooks/useLowStockAlerts";

import { useApiHealth } from "../hooks/useApiHealth";

import { useAuthStore } from "../store/authStore";

import { useNotificationStore } from "../store/notificationStore";

import { useSearchStore } from "../store/searchStore";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  /* =========================
     ROUTER
  ========================= */

  const location = useLocation();

  /* =========================
     REALTIME
  ========================= */

  useRealtimeInventory();

  /* =========================
     LOW STOCK
  ========================= */

  useLowStockAlerts();

  /* =========================
     API HEALTH
  ========================= */

  const { apiOnline } = useApiHealth();

  /* =========================
     AUTH
  ========================= */

  const user = useAuthStore((state) => state.user);

  const sidebarCollapsed =
  useLayoutStore(
    (state) =>
      state.sidebarCollapsed
  );

  /* =========================
     NOTIFICATIONS
  ========================= */

  const notifications = useNotificationStore((state) => state.notifications);

  const [showNotifications, setShowNotifications] = useState(false);

  /* =========================
     SEARCH
  ========================= */

  const {
    getSearch,

    setSearch,

    clearSearch,
  } = useSearchStore();

  const search = getSearch(location.pathname);

  const searchInputRef = useRef<HTMLInputElement>(null);

  /* =========================
     SHORTCUT
  ========================= */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (!isShortcut) {
        return;
      }

      event.preventDefault();

      searchInputRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  /* =========================
     PAGE CONFIG
  ========================= */

  const pageConfig: Record<
    string,
    {
      title: string;
      description: string;
    }
  > = {
    "/dashboard": {
      title: "Operations Dashboard",

      description: "Real-time inventory monitoring and warehouse operations.",
    },

    "/products": {
      title: "Product Management",

      description:
        "Manage inventory products, stock levels, and serialized items.",
    },

    "/movements": {
      title: "Inventory Movements",

      description:
        "Track stock movement operations and warehouse transactions.",
    },

    "/activity": {
      title: "Activity Logs",

      description: "Monitor ERP activity and operational audit trails.",
    },

    "/scan": {
      title: "Inventory Scanning",

      description: "Scan serialized inventory and validate stock operations.",
    },

    "/serial-intake": {
      title: "Serial Intake",

      description: "Register serialized inventory into warehouse stock.",
    },
  };

  const currentPage = pageConfig[location.pathname] || {
    title: "ZICO STOCK",

    description: "Enterprise inventory & warehouse platform.",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN */}

      <main
  className={`min-h-screen transition-all duration-300 ${
    sidebarCollapsed
      ? "ml-24"
      : "ml-72"
  }`}
>
        {/* HEADER */}

        <header className="h-auto min-h-20 bg-white border-b border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 px-4 md:px-8 py-4 sticky top-0 z-20">
          {/* LEFT */}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentPage.title}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {currentPage.description}
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-4">
            {/* SEARCH */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(location.pathname, e.target.value)}
                placeholder="Search inventory..."
                className="bg-gray-100 border border-gray-200 rounded-xl pl-10 pr-20 py-2 focus:outline-none focus:ring-2 focus:ring-black transition w-48 md:w-72"
              />

              {/* SHORTCUT */}

              {!search && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 border border-gray-300 rounded px-1.5 py-0.5">
                  Ctrl K
                </div>
              )}

              {/* CLEAR */}

              {search && (
                <button
                  onClick={() => clearSearch(location.pathname)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* API STATUS */}

            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                apiOnline
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {apiOnline ? <Wifi size={16} /> : <WifiOff size={16} />}

              <span>{apiOnline ? "API Online" : "API Offline"}</span>
            </div>

            {/* NOTIFICATIONS */}

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center relative"
              >
                <Bell size={20} className="text-gray-700" />

                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && <NotificationPanel />}
            </div>

            {/* USER */}

            <div className="bg-black text-white px-4 py-2 rounded-xl shadow-lg">
              <p className="font-semibold text-sm">
                {user?.username || "User"}
              </p>

              <p className="text-xs text-gray-300">{user?.role || "Role"}</p>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <div className="p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
