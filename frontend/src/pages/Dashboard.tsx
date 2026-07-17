
import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";

import { socket } from "../socket/socket";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import {
  Package,
  Boxes,
  ArrowLeftRight,
  PieChart as PieChartIcon,
  BarChart3,
  Clock3,
} from "lucide-react";

import { useProductStore } from "../store/productStore";

function Dashboard() {
  /* =========================
     GLOBAL STORES
  ========================= */

  const { products, fetchProducts } = useProductStore();

  /* =========================
     LOCAL STATE
  ========================= */

  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState<any>(null);

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    socket.connect();

    loadDashboard();

    socket.on("dispatch-completed", loadDashboard);

    return () => {
      socket.off("dispatch-completed", loadDashboard);
    };
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      await fetchProducts();

      const dashboard = await apiRequest("/reports/dashboard", {
        auth: true,
      });

      setReport(dashboard);
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ANALYTICS
  ========================= */

  const totalProducts = products.length;

  const lowStockItems = products.filter(
    (product) => Number(product.quantity) < 5,
  );

  /* =========================
     PIE DATA
  ========================= */

  const brandStats = Object.values(
    products.reduce((acc: any, product: any) => {
      const brand = product.brand || "Unknown";

      if (!acc[brand]) {
        acc[brand] = {
          name: brand,
          value: 0,
        };
      }

      acc[brand].value += Number(product.quantity);

      return acc;
    }, {}),
  ).sort((a: any, b: any) => b.value - a.value);

  const maxBrands = brandStats.length <= 6 ? brandStats.length : 6;

  const COLORS = [
    "#111827",
    "#374151",
    "#6B7280",
    "#9CA3AF",
    "#D1D5DB",
    "#E5E7EB",
    "#F3F4F6",
  ];

  const pieData =
    brandStats.length <= maxBrands
      ? brandStats
      : [
        ...brandStats.slice(0, maxBrands),
        {
          name: "Others",
          value: brandStats
            .slice(maxBrands)
            .reduce((sum: number, item: any) => sum + item.value, 0),
        },
      ];

  const recentMovements = report?.recentMovements || [];

  /* =========================
     BAR DATA
  ========================= */

  const maxBars =
    products.length <= 10
      ? products.length
      : products.length <= 30
        ? 10
        : products.length <= 100
          ? 15
          : 20;

  const inventoryData = [...products]
    .sort((a, b) => Number(b.quantity) - Number(a.quantity))
    .slice(0, maxBars)
    .map((product) => ({
      name:
        product.name.length > 18
          ? `${product.name.slice(0, 18)}...`
          : product.name,

      Quantity: Number(product.quantity),
    }));

  if (loading) {
    return <div className="p-6 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      {/* PAGE HEADER */}

      <div className="mb-8">
        <h1 className="erp-page-title">Dashboard</h1>

        <p className="erp-page-description">
          Monitor inventory performance, serialized stock levels, and
          operational activity.
        </p>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* TOTAL PRODUCTS */}

        <div className="erp-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Products
              </p>

              <h2 className="text-4xl font-black text-gray-900 mt-3">
                {report?.totalProducts ?? totalProducts}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Package size={30} className="text-gray-700" />
            </div>
          </div>
        </div>

        <div className="erp-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Warehouses
              </p>

              <h2 className="text-4xl font-black text-gray-900 mt-3">
                {report?.totalWarehouses ?? 0}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Boxes size={30} className="text-gray-700" />
            </div>
          </div>
        </div>

        {/* TOTAL UNITS */}

        <div className="erp-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Units</p>

              <h2 className="text-4xl font-black text-gray-900 mt-3">
                {report?.totalQuantity ?? 0}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Boxes size={30} className="text-gray-700" />
            </div>
          </div>
        </div>

        {/* STOCK OUT */}

        <div className="erp-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Stock Out</p>

              <h2 className="text-4xl font-black text-gray-900 mt-3">
                {report?.stockOut ?? 0}
              </h2>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <ArrowLeftRight size={30} className="text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* ANALYTICS */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        {/* PIE CHART */}

        <div className="erp-card erp-section">
          <div className="flex items-center gap-3 mb-6">
            <PieChartIcon size={24} className="text-gray-700" />

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Products by Brand
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Distribution of products across the top brands.
              </p>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={5}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART */}

        <div className="erp-card erp-section">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={24} className="text-gray-700" />

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Top Products by Quantity
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Products with the highest inventory quantities.
              </p>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer>
              <BarChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar dataKey="Quantity" fill="#111827" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LOW STOCK ALERTS */}

      <div className="erp-table-container mt-8">
        <div className="erp-section border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Low Stock Alerts
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Products requiring immediate inventory attention.
            </p>
          </div>

          <div className="erp-badge-danger">
            {report?.lowStockProducts ?? lowStockItems.length} Alert(s)
          </div>
        </div>

        <div className="erp-table-scroll">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product</th>

                <th>Brand</th>

                <th>Quantity</th>

                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {lowStockItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No low stock alerts detected.
                  </td>
                </tr>
              )}

              {lowStockItems.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>

                  <td>{product.brand}</td>

                  <td>{product.quantity}</td>

                  <td>
                    <span className="erp-badge-danger">Low Stock</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT ACTIVITY */}

      <div className="erp-table-container mt-8">
        <div className="erp-section border-b border-gray-200 flex items-center gap-3">
          <Clock3 size={24} className="text-gray-700" />

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Inventory Movements
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest stock movements recorded in the ERP.
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {recentMovements.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No recent inventory movements.
            </div>
          )}

          {recentMovements.slice(0, 12).map((movement: any) => (
            <div
              key={movement.id}
              className="flex items-center justify-between p-5 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {movement.product_name}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {movement.type} • Qty {movement.quantity}
                </p>
              </div>

              <div className="text-sm text-gray-500">
                {new Date(movement.created_at).toLocaleString("en-GB")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECENT PRODUCTS */}

      <div className="erp-table-container mt-8">
        <div className="erp-table-scroll"></div>

        <div className="erp-section border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Recent Products</h2>
        </div>

        <table className="erp-table">
          <thead>
            <tr>
              <th>Product</th>

              <th>Brand</th>

              <th>Quantity</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-gray-500 py-8">
                  No inventory products available yet.
                </td>
              </tr>
            )}

            {products.slice(0, 5).map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>

                <td>{product.brand}</td>

                <td>
                  {product.track_serial
                    ? `${product.quantity} Serials`
                    : product.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
