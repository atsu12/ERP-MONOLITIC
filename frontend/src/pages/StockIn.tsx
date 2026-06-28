import { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { useProductStore } from "../store/productStore";

import { PackagePlus, Boxes, ScanLine, Hash } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function StockIn() {
  const { fetchProducts: refreshProducts } = useProductStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [quantity, setQuantity] = useState("");

  const [serialInput, setSerialInput] = useState("");

  const [serials, setSerials] = useState<string[]>([]);

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
    };

    /* =========================
       SERIALIZED
    ========================= */

    if (selectedProduct.track_serial) {
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

      payload.quantity = Number(quantity) * (selectedProduct.package_size || 1);
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

      setQuantity("");

      setSerialInput("");

      setSerials([]);

      inputRef.current?.focus();
    } catch (error) {
      console.log(error);

      toast.error("Server connection failed");
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
        <h1 className="erp-page-title">Stock In</h1>

        <p className="erp-page-description">
          Receive inventory into warehouse stock using quantity intake or
          serialized scanning.
        </p>
      </div>

      {/* PANEL */}

      <div className="erp-card erp-section mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <PackagePlus size={28} className="text-gray-700" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Inventory Receiving
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Add stock into inventory.
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

        {/* STANDARD PRODUCT */}

        {selectedProduct && !selectedProduct.track_serial && (
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Packages Received
            </label>

            <div className="relative">
              <Hash
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <div className="mb-4 rounded-2xl bg-blue-50 border border-blue-100 p-4">
                <p className="font-semibold text-blue-900">
                  Packaging Information
                </p>

                <p className="text-sm text-blue-700 mt-1">
                  1 Package = {selectedProduct.package_size}{" "}
                  {selectedProduct.stock_unit}
                  {selectedProduct.package_size > 1 ? "s" : ""}
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
                    {Number(quantity) * selectedProduct.package_size}{" "}
                    {selectedProduct.stock_unit}
                    {Number(quantity) * selectedProduct.package_size > 1
                      ? "s"
                      : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SERIALIZED PRODUCT */}

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

            <div className="space-y-2 max-h-72 overflow-auto">
              {serials.map((serial, index) => (
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

        {/* ACTIONS */}

        <div className="pt-8 flex justify-end">
          <button
            onClick={submitStock}
            className="bg-black hover:bg-gray-800 transition text-white px-6 py-3 rounded-2xl font-semibold"
          >
            Add Stock
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockIn;
