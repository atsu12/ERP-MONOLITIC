import { exportRecentMovements } from "../../utils/exportRecentMovements";

import { Package } from "lucide-react";

type Movement = {
  id: number;
  product_name: string;
  type: string;
  quantity: number;
  created_at: string;
};

type Props = {
  movements: Movement[];
  filters?: Record<string, string>;
};

function movementType(type: string) {
  switch (type) {
    case "RECEIVED":
    case "SCANNED_IN":
      return "IN";

    case "SCANNED_OUT":
      return "OUT";

    default:
      return type;
  }
}

function RecentMovementsTable({ movements, filters = {} }: Props) {
  return (
    <div className="erp-card lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package size={20} />

          <div>
            <h2 className="font-bold text-lg">Recent Inventory Movements</h2>

            <p className="text-sm text-gray-500">
              Latest inventory transactions across the company.
            </p>
          </div>
        </div>

        <button
          onClick={() => exportRecentMovements(movements, filters)}
          disabled={movements.length === 0}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            movements.length === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Export
        </button>
      </div>

      <table className="min-w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Product</th>

            <th className="text-left py-2">Type</th>

            <th className="text-right py-2 px-4">Qty</th>

            <th className="text-left py-2 px-4 w-32">Date</th>
          </tr>
        </thead>

        <tbody>
          {movements.map((movement) => (
            <tr key={movement.id} className="border-b">
              <td className="py-2">{movement.product_name}</td>

              <td className="py-2">{movementType(movement.type)}</td>

              <td className="py-2 px-4 text-right">{movement.quantity}</td>

              <td className="py-2 px-4 w-32">
                {new Date(movement.created_at).toLocaleDateString("en-GB")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecentMovementsTable;
