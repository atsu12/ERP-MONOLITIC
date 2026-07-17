import { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import { socket } from "../socket/socket";

import DispatchDetailsModal from "../components/DispatchDetailsModal";

import { useProductStore } from "../store/productStore";

import { PackageMinus, Boxes, ScanLine, Hash } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function StockOut() {
  const { fetchProducts: refreshProducts } = useProductStore();

  const inputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<any[]>([]);

  const [paidDispatches, setPaidDispatches] = useState<any[]>([]);

  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);

  const [dispatchItems, setDispatchItems] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [quantity, setQuantity] = useState("");

  const [serialInput, setSerialInput] = useState("");

  const [recentScans, setRecentScans] = useState<string[]>([]);

  const [customerName, setCustomerName] = useState("");

  const [customerContact, setCustomerContact] = useState("");

  const [contactPerson, setContactPerson] = useState("");

  const [customerLocation, setCustomerLocation] = useState("");

  /* =========================
     LOAD PRODUCTS
  ========================= */

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
    } catch (error) {
      console.log(error);

      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaidDispatches = async () => {
    try {
      const response = await fetch(`${API_URL}/dispatch/paid`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to load dispatches");

        return;
      }

      setPaidDispatches(data.dispatches || []);
    } catch {
      toast.error("Failed to load dispatches");
    }
  };

  const openDispatch = async (dispatchId: number) => {
    try {
      const response = await fetch(`${API_URL}/dispatch/${dispatchId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to load dispatch");

        return;
      }

      setSelectedDispatch(data.dispatch);

      setDispatchItems(data.items || []);
    } catch {
      toast.error("Failed to load dispatch");
    }
  };

  const completeDispatch = async () => {
    if (!selectedDispatch) return;

    try {
      const response = await fetch(
        `${API_URL}/dispatch/${selectedDispatch.id}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to complete dispatch");

        return;
      }

      toast.success("Dispatch completed");

      setSelectedDispatch(null);

      setDispatchItems([]);

      fetchProducts();

      fetchPaidDispatches();
    } catch {
      toast.error("Failed to complete dispatch");
    }
  };

  useEffect(() => {
    socket.connect();

    fetchProducts();

    fetchPaidDispatches();

    socket.on("dispatch-paid", fetchPaidDispatches);

    socket.on("dispatch-completed", fetchPaidDispatches);

    inputRef.current?.focus();

    return () => {
      socket.off("dispatch-paid", fetchPaidDispatches);

      socket.off("dispatch-completed", fetchPaidDispatches);
    };
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
   SUBMIT DISPATCH
========================= */

  const submitDispatch = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");

      return;
    }

    if (!customerContact.trim()) {
      toast.error("Contact is required");

      return;
    }

    if (!selectedProduct) {
      toast.error("Select a product");

      return;
    }

    if (!selectedProduct.track_serial && (!quantity || Number(quantity) <= 0)) {
      toast.error("Enter valid quantity");

      return;
    }

    try {
      const payload = {
        customer_name: customerName,

        contact: customerContact,

        contact_person: contactPerson,

        location: customerLocation,

        items: selectedProduct.track_serial
          ? []
          : [
            {
              product_id: selectedProduct.id,

              quantity: Number(quantity),
            },
          ],

        serials: [],
      };

      const response = await fetch(`${API_URL}/dispatch`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create dispatch");

        return;
      }

      toast.success(`Submitted for payment (${data.reference})`);

      setCustomerName("");

      setCustomerContact("");

      setContactPerson("");

      setCustomerLocation("");

      setQuantity("");

      setSelectedProduct(null);
    } catch {
      toast.error("Server connection failed");
    }
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

      await fetchProducts();

      setQuantity("");

      setSelectedProduct(null);

      inputRef.current?.focus();
    } catch {
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
      await refreshProducts();

      setRecentScans((prev) => [cleaned, ...prev.slice(0, 19)]);

      setSerialInput("");

      inputRef.current?.focus();
    } catch {
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

      {paidDispatches.length > 0 && (
        <div className="erp-card erp-section mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Pending Deliveries ({paidDispatches.length})
          </h2>

          <div className="space-y-3">
            {paidDispatches.map((dispatch) => (
              <div
                key={dispatch.id}
                onClick={() => openDispatch(dispatch.id)}
                className="
                  border border-green-200
                  bg-green-50
                  rounded-2xl
                  p-4
                  cursor-pointer
                  hover:bg-green-100
                  transition
                  "
              >
                <p className="font-bold">{dispatch.reference}</p>

                <p className="text-sm text-gray-600">
                  {dispatch.customer_name}
                </p>

                <p className="text-sm text-gray-500">
                  {dispatch.contact_person}
                </p>

                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Contact:</span>{" "}
                    {dispatch.contact || "-"}
                  </p>

                  <p>
                    <span className="font-semibold">Location:</span>{" "}
                    {dispatch.location || "-"}
                  </p>

                  <p>
                    <span className="font-semibold">Total:</span>{" "}
                    {dispatch.currency} {dispatch.grand_total}
                  </p>

                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(dispatch.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>



              </div>
            ))}



          </div>
        </div>
      )}

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

        {/* CUSTOMER INFORMATION */}

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Customer Information
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Customer Name *
              </label>

              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="erp-input"
                placeholder="Customer name"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Contact
              </label>

              <input
                type="text"
                value={customerContact}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value)) {
                    setCustomerContact(e.target.value);
                  }
                }}
                className="erp-input"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Contact Person
              </label>

              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="erp-input"
                placeholder="Contact person"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Location
              </label>

              <input
                type="text"
                value={customerLocation}
                onChange={(e) => setCustomerLocation(e.target.value)}
                className="erp-input"
                placeholder="Location"
              />
            </div>
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
                className="erp-input pl-14 indent-7"
              />
            </div>
          </div>
        )}

        {/* SERIALIZED */}

        {selectedProduct && !!selectedProduct.track_serial && (
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
              onClick={submitDispatch}
              className="bg-black hover:bg-gray-800 transition text-white px-6 py-3 rounded-2xl font-semibold"
            >
              Submit for Payment
            </button>
          )}
        </div>
      </div>

      {/* RECENT SCANS */}

      {Boolean(selectedProduct?.track_serial) && (
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

      {selectedDispatch && (
        <DispatchDetailsModal
          dispatch={selectedDispatch}
          items={dispatchItems}
          onClose={() => {
            setSelectedDispatch(null);
            setDispatchItems([]);
          }}
          onComplete={completeDispatch}
        />
      )}
    </div>
  );
}

export default StockOut;
