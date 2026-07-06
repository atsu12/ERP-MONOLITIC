import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

import { Menu } from "lucide-react";

import { useLayoutStore } from "../store/layoutStore";

import logo from "../assets/logo.png";

import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ScanLine,
  Boxes,
  PackageMinus,
  Activity,
  Warehouse,
  FileText,
  SlidersHorizontal,
  Users,
  LogOut,
  UserCog,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const location = useLocation();

  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);

  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();

  const handleLogout = () => {
    logout();

    navigate("/login");
  };

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
          path: "/activity",
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
      ],
    },
  ];

  return (
    <aside
      className={`h-screen fixed top-0 left-0 bg-gradient-to-b from-gray-950 via-black to-gray-900 text-white border-r border-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? "w-24" : "w-72"
      }`}
    >
      {/* TOP */}

      <div className="flex justify-end p-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-gray-800 transition"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex flex-col h-full overflow-hidden">
        {/* BRAND */}

        <div className="px-6 py-8 border-b border-gray-800 shrink-0">
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <img
                src={logo}
                alt="Business-MGT ERP"
                className="h-10 w-10 object-contain"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black tracking-wide">ZICO STOCK</h1>

              <p className="text-gray-400 text-sm mt-2">
                Enterprise inventory & warehouse platform
              </p>
            </>
          )}
        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <nav className="space-y-8">
            {navSections.map((section) => {
              const visibleItems = section.items.filter((item) =>
                item.roles.includes(user?.role),
              );

              if (visibleItems.length === 0) {
                return null;
              }

              return (
                <div key={section.title}>
                  {/* SECTION TITLE */}

                  {!sidebarCollapsed && (
                    <p className="text-xs font-bold tracking-[0.2em] text-gray-500 mb-3 px-3">
                      {section.title}
                    </p>
                  )}

                  {/* LINKS */}

                  <div className="space-y-2">
                    {visibleItems.map((item) => {
                      const isActive = location.pathname === item.path;

                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          title={sidebarCollapsed ? item.label : ""}
                          className={`flex items-center ${
                            sidebarCollapsed ? "justify-center" : "gap-3"
                          } px-4 py-4 rounded-2xl transition-all duration-200 ${
                            isActive
                              ? "bg-white text-black font-bold shadow-xl"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }`}
                        >
                          <Icon size={sidebarCollapsed ? 28 : 20} />

                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* USER PANEL */}

      <div className="p-4 border-t border-gray-800 shrink-0">
        {!sidebarCollapsed && (
          <div className="bg-gray-900 rounded-2xl p-4 mb-4 border border-gray-800">
            <p className="font-semibold text-lg">{user?.username || "User"}</p>

            <p className="text-sm text-gray-400 mt-1">{user?.role || "Role"}</p>
          </div>
        )}

        <button
          onClick={() => navigate("/my-account")}
          className={`w-full flex items-center justify-center ${
            sidebarCollapsed ? "" : "gap-2"
          } bg-gray-800 hover:bg-gray-700 transition-all duration-200 py-3 rounded-2xl font-semibold mb-3`}
        >
          <UserCog size={18} />

          {!sidebarCollapsed && "My Account"}
        </button>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center justify-center ${
            sidebarCollapsed ? "" : "gap-2"
          } bg-red-600 hover:bg-red-700 transition-all duration-200 py-3 rounded-2xl font-semibold shadow-lg`}
        >
          <LogOut size={18} />

          {!sidebarCollapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
