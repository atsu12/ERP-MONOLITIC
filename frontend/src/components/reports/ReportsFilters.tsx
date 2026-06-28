type Props = {
  period: string;
  search: string;
  warehouse: string;
  category: string;
  brand: string;

  onPeriodChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onWarehouseChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
};

function ReportsFilters({
  period,
  search,
  warehouse,
  category,
  brand,
  onPeriodChange,
  onSearchChange,
  onWarehouseChange,
  onCategoryChange,
  onBrandChange,
}: Props) {
  return (
    <div className="erp-card mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Period
          </label>

          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="today">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Warehouse
          </label>

          <select
            value={warehouse}
            onChange={(e) => onWarehouseChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">
              All Warehouses
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">
              All Categories
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Brand
          </label>

          <select
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">
              All Brands
            </option>
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
    </div>
  );
}

export default ReportsFilters;