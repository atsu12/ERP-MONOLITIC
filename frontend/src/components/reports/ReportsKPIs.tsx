import type { ReactNode } from "react";

type ProductSummary = {
  name: string;
  totalOut: number;
};

type Settings = {
  currency_symbol: string;
  usd_exchange_rate: number;
  company_multiplier: number;
};

type Props = {
  totalProducts: number;
  totalQuantity: number;
  inventoryValue: number;
  stockIn: number;
  stockOut: number;
  lowStockProducts: number;
  fastMovingProduct?: ProductSummary;
  slowMovingProduct?: ProductSummary;
  settings: Settings | null;
  onLowStockClick: () => void;
};

function ReportsKPIs({
  totalProducts,
  totalQuantity,
  inventoryValue,
  stockIn,
  stockOut,
  lowStockProducts,
  fastMovingProduct,
  slowMovingProduct,
  settings,
  onLowStockClick,
}: Props): ReactNode {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <div className="erp-card">
        <p className="text-sm text-gray-500">Total Products</p>

        <h2 className="text-2xl font-black break-words">
          {totalProducts}
        </h2>
      </div>

      <div className="erp-card">
        <p className="text-sm text-gray-500">Total Quantity</p>

        <h2 className="text-3xl font-black">{totalQuantity}</h2>
      </div>

      <div className="erp-card">
        <p className="text-sm text-gray-500">Inventory Value</p>

        <h2 className="text-3xl font-black text-emerald-700 break-words">
          {settings
            ? `${settings.currency_symbol}${(
                Number(inventoryValue) *
                settings.usd_exchange_rate *
                settings.company_multiplier
              ).toFixed(2)}`
            : "-"}
        </h2>
      </div>

      <div className="erp-card">
        <p className="text-sm text-gray-500">Stock In</p>

        <h2 className="text-3xl font-black text-green-600">
          {stockIn}
        </h2>
      </div>

      <div className="erp-card">
        <p className="text-sm text-gray-500">Stock Out</p>

        <h2 className="text-3xl font-black text-red-600">
          {stockOut}
        </h2>
      </div>

      <div
        className="erp-card cursor-pointer hover:shadow-lg transition"
        onClick={onLowStockClick}
      >
        <p className="text-sm text-gray-500">
          Low Stock Products
        </p>

        <h2 className="text-3xl font-black text-orange-600">
          {lowStockProducts}
        </h2>

        <p className="text-xs text-gray-400 mt-2">
          Click to view products
        </p>
      </div>

      <div className="erp-card">
        <p className="text-sm text-gray-500">
          Top Fast Mover
        </p>

        <h2 className="font-black text-lg">
          {fastMovingProduct?.name || "-"}
        </h2>

        <p className="text-green-600 font-semibold">
          {fastMovingProduct?.totalOut || 0} OUT
        </p>
      </div>

      <div className="erp-card">
        <p className="text-sm text-gray-500">
          Top Slow Mover
        </p>

        <h2 className="font-black text-lg">
          {slowMovingProduct?.name || "-"}
        </h2>

        <p className="text-orange-600 font-semibold">
          {slowMovingProduct?.totalOut || 0} OUT
        </p>
      </div>
    </div>
  );
}

export default ReportsKPIs;
