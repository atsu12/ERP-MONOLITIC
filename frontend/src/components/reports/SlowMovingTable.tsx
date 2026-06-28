import { TrendingDown } from "lucide-react";

type Product = {
  id: number;
  name: string;
  totalOut: number;
};

type Props = {
  products: Product[];
};

function SlowMovingTable({ products }: Props) {
  return (
    <div className="erp-card">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown size={20} />

        <h2 className="font-bold text-lg">
          Slow Moving Products
        </h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Product</th>

            <th className="text-right py-2">
              OUT Qty
            </th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b">
              <td className="py-2">
                {product.name}
              </td>

              <td className="py-2 text-right">
                {product.totalOut}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SlowMovingTable;


