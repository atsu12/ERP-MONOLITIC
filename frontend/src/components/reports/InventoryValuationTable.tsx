import { exportInventoryValuation } from "../../utils/exportInventoryValuation";

type InventoryValuation = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
  inventoryValue: number;
};

type Props = {
  items: InventoryValuation[];
  filters?: Record<string, string>;
};

function InventoryValuationTable({ items, filters = {} }: Props) {
  return (
    <div className="erp-card lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold">Inventory Valuation</h2>

          <p className="text-sm text-gray-500">
            Current inventory value by product.
          </p>
        </div>

        <button
          onClick={() => exportInventoryValuation(items, filters)}
          disabled={items.length === 0}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            items.length === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Export
        </button>
      </div>

      <div className="erp-table-container">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Product</th>

              <th className="text-left py-2">Brand</th>

              <th className="text-left py-2">Category</th>

              <th className="text-right py-2">Qty</th>

              <th className="text-right py-2">Unit Price</th>

              <th className="text-right py-2">Total Value</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.name}</td>

                <td>{item.brand}</td>

                <td>{item.category}</td>

                <td className="text-right">{item.quantity}</td>

                <td className="text-right">{Number(item.price).toFixed(2)}</td>

                <td className="text-right font-semibold">
                  {Number(item.inventoryValue).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryValuationTable;
