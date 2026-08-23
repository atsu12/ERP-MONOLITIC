import { useSettingsStore } from "../store/settingsStore";

import { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

import { useDebounce } from "../hooks/useDebounce";

import {
  Package,
  Boxes,
  Trash2,
  Pencil,
  Loader2,
  Plus,
  Upload,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useProductStore } from "../store/productStore";

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

  const [importing, setImporting] = useState(false);

  const [importReport, setImportReport] = useState<{
    type: "error" | "success";
    title: string;
    message: string;
    errors?: string[];
  } | null>(null);

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

  const [search, setSearch] = useState("");

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

    const handleProductUpdate = () => {
      fetchProducts();
    };

    socket.on("settings-updated", handleSettingsUpdate);
    socket.on("product-updated", handleProductUpdate);

    return () => {
      socket.off("settings-updated", handleSettingsUpdate);
      socket.off("product-updated", handleProductUpdate);
    };
  }, []);

  useEffect(() => {
    fetchProducts();

    fetchSettings();

    const params = new URLSearchParams(location.search);

    if (params.get("filter") === "lowstock") {
      setFilterType("lowstock");
    }
  }, []);

  const handleBulkImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setImportReport(null);
    setImporting(true);

    try {
      const XLSX = await import("xlsx");

      const buffer = await file.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      if (workbook.SheetNames.length === 0) {
        throw new Error("The Excel workbook contains no worksheets.");
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(
        worksheet,
        {
          header: 1,
          defval: null,
          raw: true,
        },
      );

      if (rows.length < 1) {
        throw new Error("The Excel file contains no product rows.");
      }

      const errors: string[] = [];

      /*
       * EXCEL FORMAT
       *
       * A = Product Name
       * B = Brand
       * C = Category
       * D = Price
       *
       * NO HEADER ROW.
       * Row 1 is the first product.
       */

      const importRows: {
        rowNumber: number;
        name: string;
        brand: string;
        category: string;
        price: number;
      }[] = [];

      const namesInFile = new Map<string, number>();

      /*
       * VALIDATE EVERY ROW
       */

      rows.forEach((row, index) => {
        const rowNumber = index + 1;

        const name = String(row[0] ?? "").trim();
        const brand = String(row[1] ?? "").trim();
        const category = String(row[2] ?? "").trim();
        const rawPrice = row[3];

        if (!name) {
          errors.push(`A${rowNumber} — Product name is empty.`);
        }

        if (!brand) {
          errors.push(`B${rowNumber} — Brand is empty.`);
        }

        if (!category) {
          errors.push(`C${rowNumber} — Category is empty.`);
        }

        if (
          rawPrice === null ||
          rawPrice === undefined ||
          String(rawPrice).trim() === ""
        ) {
          errors.push(`D${rowNumber} — Price is empty.`);
        } else {
          const price = Number(rawPrice);

          if (!Number.isFinite(price)) {
            errors.push(
              `D${rowNumber} — Price "${String(rawPrice)}" is not a valid number.`,
            );
          } else if (price <= 0) {
            errors.push(`D${rowNumber} — Price must be greater than 0.`);
          }
        }

        const normalizedName = name.toLowerCase();

        if (normalizedName) {
          if (namesInFile.has(normalizedName)) {
            errors.push(
              `A${rowNumber} — Duplicate product "${name}" also appears on row ${namesInFile.get(normalizedName)}.`,
            );
          } else {
            namesInFile.set(normalizedName, rowNumber);
          }
        }

        if (
          name &&
          brand &&
          category &&
          rawPrice !== null &&
          rawPrice !== undefined &&
          Number.isFinite(Number(rawPrice)) &&
          Number(rawPrice) > 0
        ) {
          importRows.push({
            rowNumber,
            name,
            brand,
            category,
            price: Number(rawPrice),
          });
        }
      });

      /*
       * CHECK AGAINST PRODUCTS ALREADY IN THE SYSTEM
       */

      const existingNames = new Map(
        products.map((product) => [
          product.name.trim().toLowerCase(),
          product.name,
        ]),
      );

      importRows.forEach((row) => {
        const existingName = existingNames.get(row.name.toLowerCase());

        if (existingName) {
          errors.push(
            `A${row.rowNumber} — Product "${row.name}" already exists in the system.`,
          );
        }
      });

      /*
       * ANY ERROR = ENTIRE IMPORT ABORTED
       */

      if (errors.length > 0) {
        setImportReport({
          type: "error",
          title: "Import aborted",
          message:
            "No products were imported because one or more validation rules were violated.",
          errors,
        });

        return;
      }

      /*
       * IMPORT
       */

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/products/import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            products: importRows.map((row) => ({
              name: row.name,
              brand: row.brand,
              category: row.category,
              price: row.price,
              track_serial: null,
              quantity: 0,
              stock_unit: "Unit",
              package_size: 1,
            })),
          }),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        setImportReport({
          type: "error",
          title: "Import aborted",
          message:
            responseData.error ||
            "The server rejected the bulk product import.",
          errors: responseData.errors || [],
        });

        return;
      }

      await fetchProducts();

      setImportReport({
        type: "success",
        title: "Import completed",
        message: `${importRows.length} product(s) were imported successfully.`,
      });
    } catch (error: any) {
      console.error(error);

      setImportReport({
        type: "error",
        title: "Import aborted",
        message: error?.message || "The Excel file could not be processed.",
      });
    } finally {
      setImporting(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = debouncedSearch.toLowerCase();

    const matchesSearch =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term) ||
      (product.category ?? "").toLowerCase().includes(term);

    if (!matchesSearch) {
      return false;
    }
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
      {importReport && (
        <div
          className={`mb-6 rounded-2xl border p-5 ${
            importReport.type === "error"
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <div className="flex items-start gap-3">
            {importReport.type === "error" ? (
              <AlertCircle size={22} className="mt-0.5 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2
                size={22}
                className="mt-0.5 text-green-600 shrink-0"
              />
            )}

            <div className="min-w-0">
              <h3
                className={`font-semibold ${
                  importReport.type === "error"
                    ? "text-red-800"
                    : "text-green-800"
                }`}
              >
                {importReport.title}
              </h3>

              <p
                className={`mt-1 text-sm ${
                  importReport.type === "error"
                    ? "text-red-700"
                    : "text-green-700"
                }`}
              >
                {importReport.message}
              </p>

              {importReport.errors && importReport.errors.length > 0 && (
                <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-red-200 bg-white p-3">
                  <div className="space-y-2">
                    {importReport.errors.map((error, index) => (
                      <div
                        key={`${error}-${index}`}
                        className="text-sm text-red-700"
                      >
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PageHeader
        icon={<Package size={32} className="text-gray-800" />}
        title="Products"
        description="Manage inventory products, stock quantities, and serialized inventory."
      />

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

      {/* SEARCH */}

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name, brand or category..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

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

          <div className="flex items-center gap-3">
            <label
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition cursor-pointer ${
                importing
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50"
              }`}
            >
              {importing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Upload size={18} />
              )}

              {importing ? "Importing..." : "Import Products"}

              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                disabled={importing}
                onChange={handleBulkImport}
              />
            </label>

            <button
              onClick={() => setOpenCreateModal(true)}
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 transition text-white px-5 py-3 rounded-2xl font-semibold"
            >
              <Plus size={18} />
              Create Product
            </button>
          </div>
        </div>
      </div>

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

                <th>Price ({settings?.display_currency ?? "GHS"})</th>

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
                        ? `${settings.currency_symbol} ${(
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

                              await deleteProduct(product.id);
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
