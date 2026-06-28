import { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { useProductStore } from "../store/productStore";

import { PackageMinus, Boxes, ScanLine, Hash } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function StockOut() {

  const { fetchProducts: refreshProducts } = useProductStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [quantity, setQuantity] = useState("");

  const [serialInput, setSerialInput] = useState("");

  const [recentScans, setRecentScans] = useState<string[]>([]);

  /* =========================
     LOAD PRODUCTS
  ========================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/products`);

      const data = await response.json();

      setProducts(data.products || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    inputRef.current?.focus();
  }, []);

  /* =========================
     PRODUCT SELECT
  ========================= */

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => String(p.id) === productId);

    setSelectedProduct(product || null);

    setQuantity("");

    setSerialInput("");

    inputRef.current?.focus();
  };

  /* =========================
     STANDARD STOCK OUT
  ========================= */

  const removeBulkStock = async () => {
    if (!selectedProduct) {
      toast.error("Select a product");

      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      toast.error("Enter valid quantity");

      return;
    }

    try {
      const response = await fetch(`${API_URL}/stock/out`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: JSON.stringify({
          product_id: selectedProduct.id,

          quantity: Number(quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Stock removal failed");

        return;
      }

      toast.success(data.message);

      await refreshProducts();

      setQuantity("");
    } catch (error) {
      console.log(error);

      toast.error("Server connection failed");
    }
  };

  /* =========================
     SERIALIZED SCAN OUT
  ========================= */

  const scanOutSerial = async () => {
    const cleaned = serialInput.trim();

    if (!cleaned) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/scan`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: JSON.stringify({
          serial_number: cleaned,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Scan failed");

        return;
      }

      toast.success(`${data.product} scanned out`);

      setRecentScans((prev) => [cleaned, ...prev.slice(0, 19)]);

      setSerialInput("");

      inputRef.current?.focus();
    } catch (error) {
      console.log(error);

      toast.error("Server connection failed");
    }
  };

  /* =========================
     SERIAL ENTER
  ========================= */

  const handleSerialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      scanOutSerial();
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <div className="text-gray-500">Loading products...</div>;
  }

  return (
    <div>
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="erp-page-title">Stock Out</h1>

        <p className="erp-page-description">
          Remove inventory from stock using quantity deduction or serialized
          scanning.
        </p>
      </div>

      {/* PANEL */}

      <div className="erp-card erp-section mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <PackageMinus size={28} className="text-gray-700" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Inventory Dispatch
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Remove inventory from warehouse stock.
            </p>
          </div>
        </div>

        {/* PRODUCT */}

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">
            Product
          </label>

          <select
            className="erp-select"
            value={selectedProduct?.id || ""}
            onChange={(e) => handleProductChange(e.target.value)}
          >
            <option value="">Select Product</option>

            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}

                {" — "}

                {product.track_serial ? "Serialized" : "Standard"}
              </option>
            ))}
          </select>
        </div>

        {/* STANDARD */}

        {selectedProduct && !selectedProduct.track_serial && (
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Quantity
            </label>

            <div className="relative">
              <Hash
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="erp-input pl-12"
              />
            </div>
          </div>
        )}

        {/* SERIALIZED */}

        {selectedProduct && selectedProduct.track_serial && (
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Serial Scanner
            </label>

            <div className="relative mb-4">
              <ScanLine
                size={22}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
          </div>
        )}

        {/* ACTIONS */}

        <div className="pt-8 flex justify-end">
          {!selectedProduct?.track_serial && (
            <button
              onClick={removeBulkStock}
              className="bg-black hover:bg-gray-800 transition text-white px-6 py-3 rounded-2xl font-semibold"
            >
              Remove Stock
            </button>
          )}
        </div>
      </div>

      {/* RECENT SCANS */}

      {selectedProduct?.track_serial && (
        <div className="erp-card erp-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Boxes size={24} className="text-gray-700" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Scans</h2>

              <p className="text-sm text-gray-500 mt-1">
                Recently scanned serialized inventory.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {recentScans.map((serial, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3"
              >
                <Boxes size={18} className="text-gray-600" />

                <span className="font-medium text-gray-800 break-all">
                  {serial}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StockOut;
