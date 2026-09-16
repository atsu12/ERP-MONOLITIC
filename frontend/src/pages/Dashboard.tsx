import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../services/api";
import { socket } from "../socket/socket";
import { useProductStore } from "../store/productStore";
import { useSettingsStore } from "../store/settingsStore";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Package,
  Boxes,
  CircleDollarSign,
  ArrowDown,
  ArrowUp,
  Search,
  Activity,
  Warehouse,
} from "lucide-react";

const CHART_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#2563eb"];

function Dashboard() {
  const { products, fetchProducts } = useProductStore();

  const { settings, fetchSettings } = useSettingsStore();

  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState<any>(null);

  const [warehouseSummary, setWarehouseSummary] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [dashboard, warehouses] = await Promise.all([
          apiRequest("/reports/dashboard", { auth: true }),
          apiRequest("/reports/warehouse", { auth: true }),
          fetchProducts(),
          fetchSettings(),
        ] as any);

        setReport(dashboard);

        setWarehouseSummary(Array.isArray(warehouses) ? warehouses : []);
      } catch (error) {
        console.log("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    socket.connect();

    loadDashboard();

    socket.on("dispatch-completed", loadDashboard);

    return () => {
      socket.off("dispatch-completed", loadDashboard);
    };
  }, [fetchProducts, fetchSettings]);

  const totalProducts = Number(report?.totalProducts ?? products.length);

  const totalQuantity = Number(
    report?.totalQuantity ??
      products.reduce((sum, product) => sum + Number(product.quantity || 0), 0),
  );

  const inventoryValue = Number(report?.inventoryValue ?? 0);

  const stockIn = Number(report?.stockIn ?? 0);

  const stockOut = Number(report?.stockOut ?? 0);

  const recentMovements = report?.recentMovements || [];

  const fastMovingProducts = report?.fastMovingProducts || [];

  const lowStockItems = products
    .filter((product) => Number(product.quantity) < 5)
    .sort((a, b) => Number(a.quantity) - Number(b.quantity));

  const inventoryStatus = useMemo(() => {
    const inStock = products
      .filter((p) => Number(p.quantity) >= 5)
      .reduce((sum, p) => sum + Number(p.quantity || 0), 0);

    const lowStock = products
      .filter((p) => Number(p.quantity) > 0 && Number(p.quantity) < 5)
      .reduce((sum, p) => sum + Number(p.quantity || 0), 0);

    const outOfStock = products.filter((p) => Number(p.quantity) <= 0).length;

    return [
      {
        name: "In Stock",
        value: inStock,
      },
      {
        name: "Low Stock",
        value: lowStock,
      },
      {
        name: "Out of Stock",
        value: outOfStock,
      },
      {
        name: "Stock Out",
        value: stockOut,
      },
    ];
  }, [products, report]);

  const movementChart = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, index) => {
      const date = new Date();

      date.setDate(date.getDate() - (13 - index));

      return date;
    });

    const result = days.map((date) => ({
      day: date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      stockIn: 0,
      stockOut: 0,
      netMovement: 0,
    }));

    recentMovements.forEach((movement: any) => {
      const movementDate = new Date(movement.created_at);

      const index = days.findIndex(
        (date) =>
          date.getFullYear() === movementDate.getFullYear() &&
          date.getMonth() === movementDate.getMonth() &&
          date.getDate() === movementDate.getDate(),
      );

      if (index === -1) {
        return;
      }

      const quantity = Number(movement.quantity || 0);
      const type = String(movement.type || "").toUpperCase();

      if (type.includes("IN") || type === "RECEIVED") {
        result[index].stockIn += quantity;
        result[index].netMovement += quantity;
      }

      if (type.includes("OUT")) {
        result[index].stockOut += quantity;
        result[index].netMovement -= quantity;
      }
    });

    return result;
  }, [recentMovements]);

  const currency = settings?.currency_symbol || "GHS";

  const formattedValue = `${currency} ${inventoryValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const maxWarehouseQuantity = Math.max(
    ...warehouseSummary.map((warehouse) =>
      Number(warehouse.totalQuantity || 0),
    ),
    1,
  );

  if (loading) {
    return <div className="erp-dashboard-loading">Loading dashboard...</div>;
  }

  const dashboardDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="erp-dashboard">
      <section className="erp-dashboard-intro">
        <div>
          <h1>
            Welcome back, Frank! <span aria-hidden="true">👋</span>
          </h1>

          <p>Here's what's happening in your warehouse today.</p>
        </div>

        <div className="erp-dashboard-date">
          <span>Today</span>
          <strong>{dashboardDate}</strong>
        </div>
      </section>

      <section className="erp-kpi-grid">
        <DashboardKpi
          icon={<Package />}
          label="Total Products"
          value={totalProducts.toLocaleString()}
          trend="Inventory catalog"
          tone="blue"
          spark="products"
        />

        <DashboardKpi
          icon={<Boxes />}
          label="Total Quantity"
          value={totalQuantity.toLocaleString()}
          trend="Units in inventory"
          tone="green"
          spark="quantity"
        />

        <DashboardKpi
          icon={<CircleDollarSign />}
          label="Inventory Value"
          value={formattedValue}
          trend="Current stock value"
          tone="purple"
          spark="value"
        />

        <DashboardKpi
          icon={<ArrowDown />}
          label="Stock In — Last 30 Days"
          value={stockIn.toLocaleString()}
          trend="Received inventory"
          tone="green"
          spark="stock-in"
        />

        <DashboardKpi
          icon={<ArrowUp />}
          label="Stock Out — Last 30 Days"
          value={stockOut.toLocaleString()}
          trend="Issued inventory"
          tone="red"
          spark="stock-out"
        />
      </section>

      <section className="erp-dashboard-grid erp-dashboard-grid-main">
        <DashboardCard
          title="Stock Overview"
          action={dashboardDate}
          className="erp-stock-overview"
        >
          <div className="erp-chart-legend">
            <span>
              <i className="dot dot-green" />
              Stock In
            </span>

            <span>
              <i className="dot dot-red" />
              Stock Out
            </span>

            <span>
              <i className="dot dot-blue" />
              Net Movement
            </span>
          </div>

          <div className="erp-chart-large">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={movementChart}>
                <defs>
                  <linearGradient id="stockInFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.18} />

                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="day" axisLine={false} tickLine={false} />

                <YAxis axisLine={false} tickLine={false} width={34} />

                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "1px solid #e5e9f2",
                    background: "#ffffff",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.10)",
                    padding: "10px 12px",
                  }}
                  labelStyle={{
                    color: "#101828",
                    fontWeight: 800,
                    marginBottom: "6px",
                  }}
                  itemStyle={{
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                  formatter={(value, name) => [
                    Number(value ?? 0).toLocaleString(),
                    name === "netMovement"
                      ? "Net Movement"
                      : name === "stockIn"
                        ? "Stock In"
                        : "Stock Out",
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="stockIn"
                  stroke="none"
                  fill="url(#stockInFill)"
                />

                <Line
                  type="monotone"
                  dataKey="stockIn"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="stockOut"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

                <Line
                  type="monotone"
                  dataKey="netMovement"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        <DashboardCard title="Inventory Status">
          <div className="erp-status-card">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={inventoryStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {inventoryStatus.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="erp-status-legend">
              {inventoryStatus.map((item, index) => (
                <div key={item.name}>
                  <span>
                    <i
                      className="dot"
                      style={{
                        background: CHART_COLORS[index],
                      }}
                    />
                    {item.name}
                  </span>

                  <strong>{item.value.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Low Stock Alerts"
          badge={Number(report?.lowStockProducts ?? lowStockItems.length)}
          action="View all"
        >
          <div className="erp-list">
            {lowStockItems.slice(0, 6).map((product: any, index: number) => (
              <div className="erp-list-row" key={product.id}>
                <span
                  className={`erp-alert-dot ${
                    index === 0 ? "critical" : "warning"
                  }`}
                />

                <div className="erp-list-main">
                  <strong>{product.name}</strong>

                  <small>SKU: {product.sku || "—"}</small>
                </div>

                <div className="erp-list-qty">
                  <small>Quantity</small>

                  <strong>{product.quantity}</strong>
                </div>
              </div>
            ))}

            {lowStockItems.length === 0 && (
              <EmptyPanel text="No low-stock products." />
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Top Fast Moving Items" action="View all">
          <div className="erp-list">
            {fastMovingProducts
              .slice(0, 5)
              .map((product: any, index: number) => (
                <div className="erp-ranked-row" key={product.id}>
                  <span className={`rank rank-${index + 1}`}>{index + 1}</span>

                  <strong>{product.name}</strong>

                  <span className="erp-positive">
                    {Number(product.totalOut || 0).toLocaleString()} out
                  </span>
                </div>
              ))}

            {fastMovingProducts.length === 0 && (
              <EmptyPanel text="No movement data yet." />
            )}
          </div>
        </DashboardCard>
      </section>

      <section className="erp-dashboard-grid erp-dashboard-grid-bottom">
        <DashboardCard title="Recent Activity" action="View all">
          <div className="erp-activity-list">
            {recentMovements.slice(0, 5).map((movement: any) => (
              <div className="erp-activity-row" key={movement.id}>
                <span className="erp-activity-icon">
                  <Activity size={16} />
                </span>

                <div>
                  <strong>{movement.product_name}</strong>

                  <small>
                    {movement.type} · Qty {movement.quantity}
                  </small>
                </div>

                <time>
                  {new Date(movement.created_at).toLocaleString("en-GB")}
                </time>
              </div>
            ))}

            {recentMovements.length === 0 && (
              <EmptyPanel text="No recent activity." />
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Warehouse Summary" action="View all">
          <div className="erp-warehouse-list">
            {warehouseSummary.slice(0, 5).map((warehouse: any) => {
              const quantity = Number(warehouse.totalQuantity || 0);

              const percent = Math.round(
                (quantity / maxWarehouseQuantity) * 100,
              );

              return (
                <div
                  className="erp-warehouse-row"
                  key={warehouse.id || warehouse.name}
                >
                  <span className="erp-warehouse-icon">
                    <Warehouse size={16} />
                  </span>

                  <strong>{warehouse.name}</strong>

                  <span>{quantity.toLocaleString()}</span>

                  <div className="erp-progress">
                    <span
                      style={{
                        width: `${Math.max(percent, 3)}%`,
                      }}
                    />
                  </div>

                  <small>{percent}%</small>
                </div>
              );
            })}

            {warehouseSummary.length === 0 && (
              <EmptyPanel text="No warehouse summary available." />
            )}
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}

function DashboardKpi({ icon, label, value, trend, tone, spark }: any) {
  const sparkPaths: Record<string, string> = {
    products: "2,20 12,17 22,19 32,13 42,15 52,9 62,11 72,5 82,8 94,2",

    quantity: "2,17 12,19 22,14 32,16 42,10 52,12 62,7 72,10 82,4 94,7",

    value: "2,19 12,16 22,17 32,11 42,14 52,7 62,10 72,5 82,7 94,2",

    "stock-in": "2,18 12,15 22,17 32,10 42,12 52,8 62,9 72,4 82,6 94,2",

    "stock-out": "2,4 12,8 22,6 32,12 42,10 52,15 62,12 72,18 82,14 94,20",
  };
  return (
    <article className={`erp-kpi-card tone-${tone}`}>
      <div className="erp-kpi-top">
        <span className="erp-kpi-icon">{icon}</span>

        <div>
          <p>{label}</p>

          <strong>{value}</strong>

          <small>{trend}</small>
        </div>
      </div>

      <svg
  className="erp-kpi-spark"
  viewBox="0 0 96 24"
  preserveAspectRatio="none"
  aria-hidden="true"
>
  <defs>
    <linearGradient
      id={`spark-gradient-${spark}`}
      x1="0"
      y1="0"
      x2="0"
      y2="1"
    >
      <stop
        offset="0%"
        stopColor="currentColor"
        stopOpacity="0.42"
      />
      <stop
        offset="65%"
        stopColor="currentColor"
        stopOpacity="0.16"
      />
      <stop
        offset="100%"
        stopColor="currentColor"
        stopOpacity="0"
      />
    </linearGradient>
  </defs>

  <polygon
    points={`${sparkPaths[spark]} 94,24 2,24`}
    fill={`url(#spark-gradient-${spark})`}
  />

  <polyline
    points={sparkPaths[spark]}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>
    </article>
  );
}

function DashboardCard({
  title,
  action,
  badge,
  children,
  className = "",
}: any) {
  return (
    <article className={`erp-dashboard-card ${className}`}>
      <header>
        <div>
          <h2>
            {title}

            {badge !== undefined && (
              <span className="erp-card-badge">{badge}</span>
            )}
          </h2>
        </div>

        {action && (
          <button type="button" className="erp-card-action">
            {action}
          </button>
        )}
      </header>

      {children}
    </article>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="erp-empty-panel">
      <Search size={16} />
      {text}
    </div>
  );
}

export default Dashboard;
