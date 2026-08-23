import { exportWarehouseReport } from "../../utils/exportWarehouseReport";
import { useSettingsStore } from "../../store/settingsStore";

interface WarehouseSummary {
  id: number;
  name: string;
  totalProducts: number;
  totalQuantity: number;
  inventoryValue: number;
}

interface Props {
  warehouses: WarehouseSummary[];
  filters?: Record<string, string>;
}

function WarehouseReportTable({ warehouses, filters = {} }: Props) {
  const { settings } = useSettingsStore();

  const effectiveRate = settings
    ? settings.usd_exchange_rate * settings.company_multiplier
    : 1;

  return (
    <div className="erp-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Warehouse Summary</h2>

        <button
          onClick={() => exportWarehouseReport(warehouses, filters)}
          disabled={warehouses.length === 0}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            warehouses.length === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Export
        </button>
      </div>

      <div className="erp-table-container">
        <div className="erp-table-scroll">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Warehouse</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>Inventory Value ({settings?.display_currency ?? "GHS"})</th>
              </tr>
            </thead>

            <tbody>
              {warehouses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No warehouse data available.
                  </td>
                </tr>
              ) : (
                warehouses.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td>{warehouse.name}</td>

                    <td>{warehouse.totalProducts}</td>

                    <td>{warehouse.totalQuantity}</td>

                    <td>
                      {settings?.currency_symbol}{" "}
                      {(
                        Number(warehouse.inventoryValue) * effectiveRate
                      ).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WarehouseReportTable;
