import { useSettingsStore } from "../store/settingsStore";

import { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

import toast from "react-hot-toast";

import { useDebounce } from "../hooks/useDebounce";

import { Package, Boxes, Trash2, Pencil, Loader2, Plus } from "lucide-react";

import { useProductStore } from "../store/productStore";

import { useSearchStore } from "../store/searchStore";

import PageHeader from "../components/PageHeader";

import { exportProductsToExcel } from "../utils/exportProducts";

import PageLoader from "../components/PageLoader";

import { socket } from "../socket/socket";

import EmptyState from "../components/EmptyState";

import AddEditProductModal from "../components/AddEditProductModal";

function Products() {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const [filterType, setFilterType] = useState("all");

  const [filterValue, setFilterValue] = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [_editingProduct, setEditingProduct] = useState<any>(null);

  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const location = useLocation();

  const { settings, fetchSettings } = useSettingsStore();

  const {
    products,

    loading,

    creating,

    updating,

    deletingIds,

    fetchProducts,

    createProduct,

    updateProduct,

    deleteProduct,
  } = useProductStore();

  const search = useSearchStore((state) => state.getSearch("/products"));

  const debouncedSearch = useDebounce(search);

  const brands = [...new Set(products.map((p) => p.brand))].sort();

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ].sort();

  useEffect(() => {
    socket.connect();

    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    socket.on("settings-updated", handleSettingsUpdate);

    return () => {
      socket.off("settings-updated", handleSettingsUpdate);
    };
  }, []);

  useEffect(() => {
    fetchProducts(debouncedSearch);

    fetchSettings();
    const params = new URLSearchParams(location.search);

    if (params.get("filter") === "lowstock") {
      setFilterType("lowstock");
    }
  }, [debouncedSearch]);

  const filteredProducts = products.filter((product) => {
    if (filterType === "brand" && filterValue) {
      return product.brand === filterValue;
    }

    if (filterType === "category" && filterValue) {
      return product.category === filterValue;
    }

    if (filterType === "lowstock") {
      return Number(product.quantity) <= 10;
    }

    return true;
  });

  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((product) => selectedProducts.includes(product.id));

  if (loading) {
    return <PageLoader text="Loading inventory products..." />;
  }

  return (
    <div>
      <PageHeader
        icon={<Package size={32} className="text-gray-800" />}
        title="Products"
        description="Manage inventory products, stock quantities, and serialized inventory."
      />

      <div className="mb-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Selected: {selectedProducts.length}
            </span>

            <button
              disabled={selectedProducts.length === 0}
              onClick={() => {
                const productsToExport = filteredProducts.filter((product) =>
                  selectedProducts.includes(product.id),
                );

                exportProductsToExcel(productsToExport, settings);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                selectedProducts.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Export
            </button>

            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);

                setFilterValue("");
              }}
              className="px-3 py-2 rounded-xl border border-gray-300"
            >
              <option value="all">All</option>

              <option value="brand">Brand</option>

              <option value="category">Category</option>

              <option value="lowstock">Low Stock</option>
            </select>

            {filterType === "brand" && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300"
              >
                <option value="">All Brands</option>

                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            )}
            {filterType === "category" && (
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-300"
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={() => setOpenCreateModal(true)}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 transition text-white px-5 py-3 rounded-2xl font-semibold"
          >
            <Plus size={18} />
            Create Product
          </button>
        </div>
      </div>

      {debouncedSearch && (
        <div className="mb-4 text-sm text-gray-500">
          Found
          <span className="font-semibold text-gray-900 mx-1">
            {filteredProducts.length}
          </span>
          matching product(s) for
          <span className="font-semibold text-black ml-1">
            "{debouncedSearch}"
          </span>
        </div>
      )}

      <div className="erp-table-container">
        <div className="erp-table-scroll">
          <table className="erp-table">
            <thead>
              <tr>
                <th className="w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(
                          filteredProducts.map((product) => product.id),
                        );
                      } else {
                        setSelectedProducts([]);
                      }
                    }}
                  />
                </th>

                <th>ID</th>

                <th>Product</th>

                <th>Brand</th>

                <th>Category</th>

                <th>Quantity</th>

                <th>Price</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="No matching products"
                      description="Try adjusting your search keywords or add new inventory products."
                      action={
                        <button
                          onClick={() => setOpenCreateModal(true)}
                          className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 transition text-white px-5 py-3 rounded-2xl font-semibold"
                        >
                          Create Product
                        </button>
                      }
                    />
                  </td>
                </tr>
              )}

              {filteredProducts.map((product) => {
                const isDeleting = deletingIds.includes(product.id);

                return (
                  <tr key={product.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([
                              ...selectedProducts,
                              product.id,
                            ]);
                          } else {
                            setSelectedProducts(
                              selectedProducts.filter(
                                (id) => id !== product.id,
                              ),
                            );
                          }
                        }}
                      />
                    </td>

                    <td className="font-medium text-gray-700">{product.id}</td>

                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
                          {product.track_serial ? (
                            <Boxes size={20} className="text-gray-700" />
                          ) : (
                            <Package size={20} className="text-gray-700" />
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {product.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>{product.brand}</td>

                    <td>{product.category || "-"}</td>

                    <td>{product.quantity}</td>

                    <td>
                      {product.price && settings
                        ? `${settings.currency_symbol}${(
                            Number(product.price) *
                            settings.usd_exchange_rate *
                            settings.company_multiplier
                          ).toFixed(2)}`
                        : "-"}
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/products/${product.id}`)}
                          className="px-3 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 transition text-blue-700 text-sm font-medium"
                        >
                          View
                        </button>

                        <button
                          onClick={() => setEditingProduct(product)}
                          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
                        >
                          <Pencil size={18} className="text-gray-700" />
                        </button>

                        {user?.role === "ADMIN" && (
                          <button
                            disabled={isDeleting}
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Delete "${product.name}" ?`,
                              );

                              if (!confirmed) {
                                return;
                              }

                              const success = await deleteProduct(product.id);

                              if (success) {
                                toast.success("Product deleted successfully");
                              }
                            }}
                            className={`w-10 h-10 rounded-xl transition flex items-center justify-center ${
                              isDeleting
                                ? "bg-gray-200 cursor-not-allowed"
                                : "bg-red-50 hover:bg-red-100"
                            }`}
                          >
                            {isDeleting ? (
                              <Loader2
                                size={18}
                                className="animate-spin text-gray-600"
                              />
                            ) : (
                              <Trash2 size={18} className="text-red-600" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditProductModal
        open={openCreateModal || !!_editingProduct}
        mode={_editingProduct ? "edit" : "create"}
        initialData={_editingProduct}
        loading={_editingProduct ? updating : creating}
        onClose={() => {
          setOpenCreateModal(false);

          setEditingProduct(null);
        }}
        onSubmit={async (data) => {
          if (_editingProduct) {
            const success = await updateProduct(_editingProduct.id, data);

            if (success) {
              setEditingProduct(null);

              setOpenCreateModal(false);
            }

            return;
          }

          const success = await createProduct(data);

          if (success) {
            setOpenCreateModal(false);
          }
        }}
      />
    </div>
  );
}

export default Products;
