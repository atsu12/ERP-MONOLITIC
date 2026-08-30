import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Boxes,
  PackageMinus,
  ScanLine,
  ArrowLeftRight,
  Activity,
  Warehouse,
  FileText,
  Users,
  BookOpen,
  SlidersHorizontal,
  Wallet,
  UserCog,
  LogOut,
} from "lucide-react";

import { useLayoutStore } from "../store/layoutStore";
import logo from "../assets/logo.png";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { sidebarCollapsed, mobileMenuOpen, toggleSidebar, closeMobileMenu } =
    useLayoutStore();

  const navSections = [
    {
      title: "MAIN",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
          roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
          label: "Products",
          path: "/products",
          icon: Package,
          roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
          label: "Inventory Movements",
          path: "/movements",
          icon: ArrowLeftRight,
          roles: ["ADMIN", "MANAGER"],
        },
      ],
    },

    {
      title: "OPERATIONS",
      items: [
        {
          label: "Stock In",
          path: "/stock-in",
          icon: Boxes,
          roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
          label: "Stock Out",
          path: "/stock-out",
          icon: PackageMinus,
          roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
          label: "Cashier",
          path: "/cashier",
          icon: Wallet,
          roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
          label: "Scan Inventory",
          path: "/scan",
          icon: ScanLine,
          roles: ["ADMIN", "MANAGER", "STAFF"],
        },
      ],
    },

    {
      title: "ADMINISTRATION",
      items: [
        {
          label: "Audit Log",
          path: "/audit-log",
          icon: Activity,
          roles: ["ADMIN"],
        },
        {
          label: "Warehouses",
          path: "/warehouses",
          icon: Warehouse,
          roles: ["ADMIN"],
        },
        {
          label: "Customers",
          path: "/customers",
          icon: Users,
          roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
          label: "Reports",
          path: "/reports",
          icon: FileText,
          roles: ["ADMIN", "MANAGER"],
        },
        {
          label: "Adjustments",
          path: "/adjustments",
          icon: SlidersHorizontal,
          roles: ["ADMIN"],
        },
        {
          label: "Users",
          path: "/users",
          icon: Users,
          roles: ["ADMIN"],
        },
        {
          label: "Help",
          path: "/help",
          icon: BookOpen,
          roles: ["ADMIN", "MANAGER", "STAFF"],
        },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-[#182443] bg-[#0b1530] text-white shadow-[8px_0_30px_rgba(15,23,42,0.12)] transition-all duration-300 ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      } ${sidebarCollapsed ? "w-[84px]" : "w-[252px]"}`}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="relative flex min-h-[116px] shrink-0 flex-col items-center justify-center border-b border-white/[0.06] px-5 py-4">
          {sidebarCollapsed ? (
            <img
              src={logo}
              alt="Business-MGT ERP"
              className="mx-auto h-50 w-80 object-contain"
            />
          ) : (
            <div className="flex w-full flex-col items-center">
              <img
                src={logo}
                alt="Business-MGT ERP"
                className="h-11 w-21 object-contain"
              />

              <p className="mt-2 w-full max-w-[210px] text-center text-[10px] font-medium leading-4 tracking-[0.08em] text-slate-400">
                Enterprise & Business Management Platform
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                closeMobileMenu();
              } else {
                toggleSidebar();
              }
            }}
            className="absolute right-3 top-3 hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.07] hover:text-white lg:block"
          >
            {window.innerWidth < 1024 ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="erp-sidebar-scroll min-h-0 flex-1 overflow-y-auto px-3 py-5">
          <nav className="space-y-5">
            {navSections.map((section) => {
              const visibleItems = section.items.filter((item) =>
                item.roles.includes(user?.role),
              );

              if (!visibleItems.length) {
                return null;
              }

              return (
                <div key={section.title}>
                  {!sidebarCollapsed && (
                    <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.14em] text-slate-500">
                      {section.title}
                    </p>
                  )}

                  <div className="space-y-0">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const active = location.pathname === item.path;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={closeMobileMenu}
                          title={sidebarCollapsed ? item.label : undefined}
                          className={`group relative flex items-center rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                            sidebarCollapsed ? "justify-center" : "gap-3"
                          } ${
                            active
                              ? "bg-[#3155d9] text-white shadow-[0_5px_14px_rgba(49,85,217,0.18)]"
                              : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <Icon
                            size={sidebarCollapsed ? 21 : 18}
                            strokeWidth={active ? 2.2 : 1.9}
                          />

                          {!sidebarCollapsed && (
                            <>
                              <span className="flex-1">{item.label}</span>

                              {active && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 border-t border-white/[0.08] bg-[#0f1b3d] p-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-2">
            <button
              onClick={() => navigate("/my-account")}
              className={`mb-1 flex w-full items-center rounded-xl px-3 py-3 text-xs font-semibold text-slate-200 transition-all duration-200 hover:bg-white/[0.08] hover:text-white ${
                sidebarCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <UserCog size={18} strokeWidth={2} />

              {!sidebarCollapsed && "My Account"}
            </button>

            <button
              onClick={handleLogout}
              className={`flex w-full items-center rounded-xl border border-red-400/20 bg-red-500 px-3 py-3 text-xs font-bold text-white-300 transition-all duration-200 hover:border-red-400/40 hover:bg-red-500/[0.16] hover:text-red-200 ${
                sidebarCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <LogOut size={18} strokeWidth={2} />

              {!sidebarCollapsed && "Logout"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
