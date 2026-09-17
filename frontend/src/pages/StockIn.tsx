import { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { socket } from "../socket/socket";

import { useProductStore } from "../store/productStore";

import { PackagePlus, Boxes, ScanLine, Hash, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function StockIn() {
  const [trackSerial, setTrackSerial] = useState<boolean | null>(null);

  const [stockUnit, setStockUnit] = useState("Unit");

  const [packageSize, setPackageSize] = useState(1);
  const { fetchProducts: refreshProducts } = useProductStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [showProductModal, setShowProductModal] = useState(false);

  const [productSearch, setProductSearch] = useState("");

  const [quantity, setQuantity] = useState("");

  const [serialInput, setSerialInput] = useState("");

  const [serials, setSerials] = useState<string[]>([]);

  /* =========================
     LOAD PRODUCTS
  ========================= */

  const filteredProducts = products.filter((product) => {
    const search = productSearch.trim().toLowerCase();

    if (!search) return true;

    return (
      String(product.name || "")
        .toLowerCase()
        .includes(search) ||
      String(product.brand || "")
        .toLowerCase()
        .includes(search) ||
      String(product.category || "")
        .toLowerCase()
        .includes(search)
    );
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      setProducts(data.products || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    socket.connect();

    const handleProductUpdate = () => {
      fetchProducts();
    };

    fetchProducts();
    inputRef.current?.focus();

    socket.on("product-updated", handleProductUpdate);

    return () => {
      socket.off("product-updated", handleProductUpdate);
    };
  }, []);
  /* =========================
     PRODUCT SELECT
  ========================= */

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => String(p.id) === productId);

    setSelectedProduct(product || null);

    setTrackSerial(
      product?.track_serial === true || product?.track_serial === 1
        ? true
        : product?.track_serial === false || product?.track_serial === 0
          ? false
          : null,
    );

    setStockUnit("Unit");
    setPackageSize(1);

    setQuantity("");

    setSerialInput("");

    setSerials([]);

    inputRef.current?.focus();
  };

  /* =========================
     ADD SERIAL
  ========================= */

  const addSerial = () => {
    const cleaned = serialInput.trim();

    if (!cleaned) {
      return;
    }

    if (serials.includes(cleaned)) {
      toast.error("Duplicate serial in session");

      return;
    }

    setSerials((prev) => [cleaned, ...prev]);

    setSerialInput("");

    inputRef.current?.focus();
  };

  /* =========================
     SERIAL ENTER
  ========================= */

  const handleSerialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      addSerial();
    }
  };

  /* =========================
     SUBMIT
  ========================= */

  const submitStock = async () => {
    if (!selectedProduct) {
      toast.error("Select a product");

      return;
    }

    let payload: any = {
      product_id: selectedProduct.id,
      track_serial: trackSerial,
      stock_unit: stockUnit,
      package_size: packageSize,
    };

    /* =========================
       SERIALIZED
    ========================= */

    if (trackSerial === true) {
      if (serials.length === 0) {
        toast.error("Add at least one serial");

        return;
      }

      payload.serials = serials;
    } else {
      /* =========================
       STANDARD
    ========================= */
      if (!quantity || Number(quantity) <= 0) {
        toast.error("Enter valid quantity");

        return;
      }

      payload.quantity = Number(quantity) * (packageSize || 1);
    }

    try {
      const response = await fetch(`${API_URL}/stock/in`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Stock intake failed");

        return;
      }

      toast.success(data.message || "Stock added successfully");

      await refreshProducts();
      await fetchProducts();

      setQuantity("");

      setSerialInput("");

      setSerials([]);

      inputRef.current?.focus();
    } catch {
      toast.error("Server connection failed");
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <div className="text-slate-500">Loading products...</div>;
  }

  return (
    <div>
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="erp-page-title">Stock In</h1>

        <p className="erp-page-description">
          Receive inventory into warehouse stock using quantity intake or
          serialized scanning.
        </p>
      </div>

      {/* PANEL */}

      <div className="erp-card erp-section mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <PackagePlus size={28} className="text-slate-700" />
          </div>

          <div>
            <h2 className="erp-section-title">Inventory Receiving</h2>

            <p className="text-sm text-slate-500 mt-1">
              Add stock into inventory.
            </p>
          </div>
        </div>

        {/* PRODUCT */}

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-slate-700">
            Product
          </label>

          <button
            type="button"
            onClick={() => {
              setProductSearch("");
              setShowProductModal(true);
            }}
            className="erp-select flex w-full items-center justify-between text-left"
          >
            <span
              className={
                selectedProduct ? "truncate text-slate-900" : "text-slate-400"
              }
            >
              {selectedProduct ? selectedProduct.name : "Select Product"}
            </span>

            <span className="ml-3 shrink-0 text-slate-400">▼</span>
          </button>
        </div>

        {showProductModal && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
            onClick={() => setShowProductModal(false)}
          >
            <div
              className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Select Product
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Select a product for inventory receiving.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close product selector"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="border-b border-slate-200 px-6 py-4">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search product, brand or category..."
                  className="erp-input"
                  autoFocus
                />
              </div>

              {/* PRODUCT LIST */}
              <div className="max-h-[360px] overflow-y-auto">
                {filteredProducts.map((product) => {
                  const productType =
                    product.track_serial === true || product.track_serial === 1
                      ? "Serialized"
                      : product.track_serial === false ||
                          product.track_serial === 0
                        ? "Standard"
                        : "Not Set";

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        handleProductChange(String(product.id));
                        setShowProductModal(false);
                      }}
                      className={`flex w-full items-center gap-4 border-b border-slate-100 px-6 py-4 text-left transition hover:bg-slate-50 ${
                        selectedProduct?.id === product.id
                          ? "bg-blue-50"
                          : "bg-white"
                      }`}
                    >
                      {/* PRODUCT */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-slate-900">
                          {product.name}
                        </div>

                        <div className="mt-1 truncate text-xs text-slate-500">
                          {product.brand || "No brand"}
                          {product.category ? ` • ${product.category}` : ""}
                        </div>
                      </div>

                      {/* TYPE */}
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          productType === "Serialized"
                            ? "bg-blue-100 text-blue-700"
                            : productType === "Standard"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {productType}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
                <span className="text-xs font-medium text-slate-500">
                  {filteredProducts.length} of {products.length} product
                  {products.length === 1 ? "" : "s"}
                </span>

                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="erp-secondary-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TYPE */}

        {selectedProduct && trackSerial === null && (
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-slate-700">
              Inventory Type
            </label>

            <select
              className="erp-select"
              value=""
              onChange={(e) => {
                const value = e.target.value;

                if (value === "standard") {
                  setTrackSerial(false);
                }

                if (value === "serialized") {
                  setTrackSerial(true);
                }
              }}
            >
              <option value="">Select Inventory Type</option>
              <option value="standard">Standard</option>
              <option value="serialized">Serialized</option>
            </select>
          </div>
        )}

        {/* STANDARD PRODUCT */}

        {selectedProduct && trackSerial === false && (
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block mb-2 font-semibold text-slate-700">
                    Stock Unit
                  </label>

                  <select
                    className="erp-select"
                    value={stockUnit}
                    onChange={(e) => setStockUnit(e.target.value)}
                  >
                    <option value="Unit">Unit</option>
                    <option value="Piece">Piece</option>
                    <option value="Pair">Pair</option>
                    <option value="Bottle">Bottle</option>
                    <option value="Pack">Pack</option>
                    <option value="Box">Box</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-slate-700">
                    Package Size
                  </label>

                  <input
                    type="number"
                    min="1"
                    className="erp-input"
                    value={packageSize}
                    onChange={(e) => setPackageSize(Number(e.target.value))}
                  />
                </div>
              </div>
              Packages Received
            </label>

            <div className="relative">
              <Hash
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <div className="mb-4 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="font-semibold text-blue-900">
                  Packaging Information
                </p>

                <p className="text-sm text-blue-700 mt-1">
                  1 Package = {packageSize} {stockUnit}
                  {packageSize > 1 ? "s" : ""}
                </p>
              </div>

              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="erp-input pl-12"
              />
              {quantity && Number(quantity) > 0 && (
                <div className="mt-4 rounded-2xl bg-green-50 border border-green-100 p-4">
                  <p className="font-semibold text-green-900">
                    Inventory To Add
                  </p>

                  <p className="text-lg font-bold text-green-700">
                    {Number(quantity) * packageSize} {stockUnit}
                    {Number(quantity) * packageSize > 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SERIALIZED PRODUCT */}

        {selectedProduct && trackSerial === true && (
          <div>
            <label className="block mb-2 font-semibold text-slate-700">
              Serial Scanner
            </label>

            <div className="relative mb-4">
              <ScanLine
                size={22}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                ref={inputRef}
                type="text"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onKeyDown={handleSerialKeyDown}
                placeholder="Scan serial number..."
                className="erp-input pl-14 text-xl font-semibold tracking-wide"
              />
            </div>

            <div className="space-y-2 max-h-72 overflow-auto">
              {serials.map((serial, index) => (
                <div
                  key={index}
                  className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center gap-3"
                >
                  <Boxes size={18} className="text-slate-600" />

                  <span className="font-medium text-slate-800 break-all">
                    {serial}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIONS */}

        <div className="pt-8 flex justify-end">
          <button
            onClick={submitStock}
            className="bg-black hover:bg-gray-800 transition-all duration-200 text-white px-6 py-3 rounded-2xl font-semibold"
          >
            Add Stock
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockIn;
