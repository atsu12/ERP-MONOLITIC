import { ReactNode, useEffect, useRef, useState } from "react";

import { Bell, Menu, Search, X, Wifi, WifiOff } from "lucide-react";

import { useLayoutStore } from "../store/layoutStore";

import { useLocation, useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import NotificationPanel from "./NotificationPanel";
import { useRealtimeInventory } from "../hooks/useRealtimeInventory";
import { useLowStockAlerts } from "../hooks/useLowStockAlerts";
import { useApiHealth } from "../hooks/useApiHealth";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigate = useNavigate();

  useRealtimeInventory();
  useLowStockAlerts();

  const { apiOnline } = useApiHealth();

  const user = useAuthStore((state) => state.user);

  const {
    sidebarCollapsed,
    mobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  } = useLayoutStore();

  const notifications = useNotificationStore((state) => state.notifications);

  const [showNotifications, setShowNotifications] = useState(false);

  const [search, setSearch] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const pageConfig: Record<string, { title: string; description: string }> = {
    "/dashboard": {
      title: "Dashboard",
      description: "Real-time inventory monitoring and warehouse operations.",
    },

    "/products": {
      title: "Products",
      description: "Manage products and inventory items.",
    },

    "/stock-in": {
      title: "Stock In",
      description: "Receive inventory into your warehouse.",
    },

    "/stock-out": {
      title: "Stock Out",
      description: "Issue inventory and process customer dispatches.",
    },

    "/cashier": {
      title: "Cashier",
      description: "Manage payments and sales transactions.",
    },

    "/movements": {
      title: "Movements",
      description: "Track inventory movements and warehouse activity.",
    },

    "/activity": {
      title: "Activity Logs",
      description: "Monitor ERP activity and operational audit trails.",
    },

    "/scan": {
      title: "Scan Inventory",
      description: "Scan and validate inventory.",
    },

    "/warehouses": {
      title: "Warehouses",
      description: "Manage warehouse inventory and locations.",
    },

    "/reports": {
      title: "Reports",
      description: "Operational reports and inventory analytics.",
    },

    "/users": {
      title: "Users",
      description: "Manage ERP users and permissions.",
    },

    "/customers": {
      title: "Customers",
      description: "Manage customer records.",
    },

    "/adjustments": {
      title: "Settings",
      description: "Configure ERP and company settings.",
    },
  };

  const currentPage = pageConfig[location.pathname] || {
    title: "Business-MGT ERP",
    description: "Enterprise inventory and warehouse platform.",
  };

  const navigationResults = Object.entries(pageConfig).filter(([, page]) =>
    page.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleNavigationSearch = (path: string) => {
    setSearch("");
    navigate(path);
  };

  const handleNavigationKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && navigationResults.length > 0) {
      handleNavigationSearch(navigationResults[0][0]);
    }

    if (event.key === "Escape") {
      setSearch("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <Sidebar />

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-[84px]" : "lg:ml-[252px]"
        }`}
      >
        <header className="sticky top-0 z-20 h-[76px] border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex h-full items-center gap-5 px-5 lg:px-7">
            <button
              onClick={toggleMobileMenu}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="hidden items-center gap-3 lg:flex">
              <button
                onClick={toggleMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
              >
                <Menu size={22} />
              </button>

              <h1 className="text-[20px] font-extrabold tracking-[-0.02em] text-slate-900">
                {currentPage.title}
              </h1>
            </div>

            <div
              ref={searchContainerRef}
              className="relative mx-auto hidden w-full max-w-[520px] md:block"
            >
              <Search
                size={18}
                strokeWidth={2}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleNavigationKeyDown}
                placeholder="Go to a page..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

              {search.trim() && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_35px_rgba(15,23,42,0.12)]">
                  {navigationResults.length > 0 ? (
                    navigationResults.map(([path, page]) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => handleNavigationSearch(path)}
                        className="flex w-full items-center rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"
                      >
                        <span className="text-sm font-semibold text-slate-800">
                          {page.title}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-sm font-medium text-slate-500">
                      No matching page found.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <div
                className={`hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold sm:flex ${
                  apiOnline ? "text-emerald-600" : "text-red-600"
                }`}
                title={apiOnline ? "API Online" : "API Offline"}
              >
                {apiOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100"
                >
                  <Bell size={21} />

                  {notifications.length > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && <NotificationPanel />}
              </div>

              <button
                onClick={() => (window.location.href = "/my-account")}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3155d9] text-sm font-bold text-white shadow-sm">
                  {(user?.username || "U").charAt(0).toUpperCase()}
                </span>

                <span className="hidden text-left sm:block">
                  <strong className="block text-[13px] font-bold leading-4 text-slate-900">
                    {user?.username || "User"}
                  </strong>

                  <small className="block text-[10px] font-medium leading-4 text-slate-500">
                    {user?.role || "Administrator"}
                  </small>
                </span>
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 py-5 md:px-6 lg:px-7 lg:py-7">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
