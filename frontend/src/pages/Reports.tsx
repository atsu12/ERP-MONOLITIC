import { useWarehouseStore } from "../store/warehouseStore";

import { useProductStore } from "../store/productStore";

import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useSettingsStore } from "../store/settingsStore";

import { FileText } from "lucide-react";

import { useDebounce } from "../hooks/useDebounce";

import PageHeader from "../components/PageHeader";

import WarehouseReportTable from "../components/reports/WarehouseReportTable";

import InventoryValuationTable from "../components/reports/InventoryValuationTable";

import { useState } from "react";
import ReportsFilters from "../components/reports/ReportsFilters";

import RecentMovementsTable from "../components/reports/RecentMovementsTable";

import FastMovingTable from "../components/reports/FastMovingTable";
import SlowMovingTable from "../components/reports/SlowMovingTable";

import ReportsKPIs from "../components/reports/ReportsKPIs";

import { useReportStore } from "../store/reportStore";

function Reports() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("30");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const [warehouse, setWarehouse] = useState("");
  const [category, setCategory] = useState("");

  const [brand, setBrand] = useState("");

  const {
    totalProducts,
    totalQuantity,
    inventoryValue,
    stockIn,
    stockOut,
    fastMovingProducts,
    lowStockProducts,
    slowMovingProducts,
    recentMovements,
    inventoryValuation,
    warehouseSummary,
    loading,
    fetchDashboard,
    fetchInventoryValuation,
    fetchWarehouseSummary,
  } = useReportStore();

  const { warehouses, fetchWarehouses } = useWarehouseStore();

  const { products, fetchProducts } = useProductStore();

  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort();

  const brands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean)),
  ).sort();

  const { settings, fetchSettings } = useSettingsStore();

  const refreshReports = () => {
    const filters: any = {
      warehouse,
      category,
      brand,
      search: debouncedSearch,
    };

    if (period === "custom") {
      filters.fromDate = fromDate;
      filters.toDate = toDate;
    } else {
      filters.period = period;
    }

    fetchDashboard(filters);
    fetchInventoryValuation(filters);
    fetchWarehouseSummary(filters);
  };

  useEffect(() => {
    refreshReports();
  }, [period, warehouse, category, brand, debouncedSearch, fromDate, toDate]);

  useEffect(() => {
    fetchSettings();

    fetchProducts();

    fetchWarehouses();
  }, []);

  return (
    <div>
      <PageHeader
        icon={<FileText size={32} className="text-gray-800" />}
        title="Reports"
        description="Generate operational reports and inventory analytics."
      />

      {loading && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Updating reports...
        </div>
      )}

      <ReportsKPIs
        totalProducts={totalProducts}
        totalQuantity={totalQuantity}
        inventoryValue={inventoryValue}
        stockIn={stockIn}
        stockOut={stockOut}
        lowStockProducts={lowStockProducts}
        fastMovingProduct={fastMovingProducts[0]}
        slowMovingProduct={slowMovingProducts[0]}
        settings={settings}
        onLowStockClick={() => navigate("/products?filter=lowstock")}
      />

      <ReportsFilters
        period={period}
        search={search}
        warehouse={warehouse}
        category={category}
        brand={brand}
        warehouses={warehouses}
        categories={categories}
        brands={brands}
        onPeriodChange={setPeriod}
        onSearchChange={setSearch}
        onWarehouseChange={setWarehouse}
        onCategoryChange={setCategory}
        onBrandChange={setBrand}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FastMovingTable
          products={fastMovingProducts}
          filters={{
            Period: period,
            Warehouse: warehouse,
            Category: category,
            Brand: brand,
            Search: debouncedSearch,
          }}
        />

        <SlowMovingTable
          products={slowMovingProducts}
          filters={{
            Period: period,
            Warehouse: warehouse,
            Category: category,
            Brand: brand,
            Search: debouncedSearch,
          }}
        />

        <RecentMovementsTable
          movements={recentMovements}
          filters={{
            Period: period,
            Warehouse: warehouse,
            Category: category,
            Brand: brand,
            Search: debouncedSearch,
          }}
        />

        <InventoryValuationTable
          items={inventoryValuation}
          filters={{
            Period: period,
            Warehouse: warehouse,
            Category: category,
            Brand: brand,
            Search: debouncedSearch,
          }}
        />

        <div className="lg:col-span-2">
          <WarehouseReportTable
            warehouses={warehouseSummary}
            filters={{
              Period: period,
              Warehouse: warehouse,
              Category: category,
              Brand: brand,
              Search: debouncedSearch,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Reports;
