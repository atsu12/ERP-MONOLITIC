import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { useSettingsStore } from "../store/settingsStore";

import { FileText } from "lucide-react";

import PageHeader from "../components/PageHeader";

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
  const [search, setSearch] = useState("");
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
    loading,
    fetchDashboard,
    fetchInventoryValuation,
  } = useReportStore();

  const { settings, fetchSettings } = useSettingsStore();

  const refreshReports = () => {
    const filters = {
      period,
      warehouse,
      category,
      brand,
      search,
    };

    fetchDashboard(filters);

    fetchInventoryValuation(filters);
  };

  useEffect(() => {
    refreshReports();
    fetchSettings();
  }, []);

  return (
    <div>
      <PageHeader
        icon={<FileText size={32} className="text-gray-800" />}
        title="Reports"
        description="Generate operational reports and inventory analytics."
      />

      <div className="flex justify-end mb-4">
        <button
          onClick={refreshReports}
          className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100"
        >
          Refresh Refresh
        </button>
      </div>

      {loading ? (
        <div className="erp-card">Loading reports...</div>
      ) : (
        <>
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
            onPeriodChange={setPeriod}
            onSearchChange={setSearch}
            onWarehouseChange={setWarehouse}
            onCategoryChange={setCategory}
            onBrandChange={setBrand}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FastMovingTable products={fastMovingProducts} />

            <SlowMovingTable products={slowMovingProducts} />

            <RecentMovementsTable movements={recentMovements} />

            <InventoryValuationTable items={inventoryValuation} />
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
