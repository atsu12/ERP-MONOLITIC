import { exportSlowMovingProducts } from "../../utils/exportSlowMovingProducts";

import { TrendingDown } from "lucide-react";

type Product = {
  id: number;
  name: string;
  totalOut: number;
};

type Props = {
  products: Product[];
  filters?: Record<string, string>;
};

function SlowMovingTable({ products, filters = {} }: Props) {
  return (
    <div className="erp-card">
      <div className="flex items-center justify-between mb-4">
  <div className="flex items-center gap-2">
    <TrendingDown size={20} />

    <h2 className="font-bold text-lg">
      Slow Moving Products
    </h2>
  </div>

  <button
    onClick={() =>
      exportSlowMovingProducts(
        products,
        filters,
      )
    }
    disabled={products.length === 0}
    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
      products.length === 0
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "bg-green-600 text-white hover:bg-green-700"
    }`}
  >
    Export
  </button>
</div>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Product</th>

            <th className="text-right py-2">OUT Qty</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="py-2">{product.name}</td>

              <td className="py-2 text-right">{product.totalOut}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SlowMovingTable;
