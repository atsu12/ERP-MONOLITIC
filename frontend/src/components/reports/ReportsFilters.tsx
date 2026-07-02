import type { Warehouse } from "../../store/warehouseStore";

type Props = {
  period: string;
  search: string;
  warehouse: string;
  category: string;
  brand: string;

  warehouses: Warehouse[];
  categories: string[];
  brands: string[];
  fromDate: string;
  toDate: string;

  onPeriodChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onWarehouseChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;

  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
};

function ReportsFilters({
  period,
  search,
  warehouse,
  category,
  brand,
  warehouses,
  categories,
  brands,
  onPeriodChange,
  onSearchChange,
  onWarehouseChange,
  onCategoryChange,
  onBrandChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: Props) {
  return (
    <div className="erp-card mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Period</label>

          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="1">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Warehouse</label>

          <select
            value={warehouse}
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">All Warehouses</option>

            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>

          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>

          <select
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">All Brands</option>

            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Product Search
          </label>

          <input
            type="text"
            value={search}
            placeholder="Search product..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>
      {period === "custom" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsFilters;
