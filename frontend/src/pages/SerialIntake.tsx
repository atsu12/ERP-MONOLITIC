import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Boxes,
  Barcode,
  ScanLine,
  PackagePlus
} from "lucide-react";

import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL;

function SerialIntake() {

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [products, setProducts] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedProduct, setSelectedProduct] =
    useState("");

  const [registered, setRegistered] =
    useState<string[]>([]);

  const fetchProducts = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/products`
      );

      const data =
        await response.json();

      const serializedProducts =
        data.products.filter(
          (p: any) => p.track_serial
        );

      setProducts(
        serializedProducts
      );

    } catch (error) {

      console.log(
        "Error loading products:",
        error
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchProducts();

    inputRef.current?.focus();

  }, []);

  const registerSerial = async () => {

    const serial =
      inputRef.current?.value.trim() || "";

    if (
      !serial ||
      !selectedProduct
    ) {

      return;

    }

    let toastId = "";

    try {

      toastId =
        toast.loading(
          "Registering serial..."
        );

      const response = await fetch(
        `${API_URL}/serials`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },

          body: JSON.stringify({
            product_id:
              selectedProduct,

            serial_number:
              serial,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {

        toast.dismiss(toastId);

        toast.error(
          data.message ||
          "Registration failed"
        );

        if (inputRef.current) {

          inputRef.current.value = "";

          inputRef.current.focus();

        }

        return;

      }

      toast.dismiss(toastId);

      toast.success(
        "Serial registered successfully"
      );

      setRegistered((prev) => [
        serial,
        ...prev.slice(0, 19),
      ]);

      if (inputRef.current) {

        inputRef.current.value = "";

        inputRef.current.focus();

      }

    } catch (err) {

      toast.dismiss(toastId);

      toast.error(
        "Server connection failed"
      );

      console.log(err);

    }

  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (e.key === "Enter") {

      e.preventDefault();

      registerSerial();

    }

  };

  if (loading) {

    return (

      <div className="text-gray-500">

        Loading serialized products...

      </div>

    );

  }

  return (

    <div>

      {/* PAGE HEADER */}

      <div className="mb-8">

        <h1 className="erp-page-title">

          Serial Intake

        </h1>

        <p className="erp-page-description">

          Register incoming serialized inventory by scanning or entering serial numbers.

        </p>

      </div>

      {/* INTAKE PANEL */}

      <div className="erp-card erp-section mb-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">

            <PackagePlus
              size={28}
              className="text-gray-700"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-gray-900">

              Inventory Intake

            </h2>

            <p className="text-sm text-gray-500 mt-1">

              Register serialized inventory into stock.

            </p>

          </div>

        </div>

        {/* PRODUCT SELECT */}

        <div className="mb-6">

          <label className="block mb-2 font-semibold text-gray-700">

            Serialized Product

          </label>

          <select
            value={selectedProduct}
            onChange={(e) =>
              setSelectedProduct(
                e.target.value
              )
            }
            className="erp-select"
          >

            <option value="">
              Select Product
            </option>

            {products.map((product) => (

              <option
                key={product.id}
                value={product.id}
              >

                {product.name}

              </option>

            ))}

          </select>

        </div>

        {/* SCAN INPUT */}

        <div>

          <label className="block mb-2 font-semibold text-gray-700">

            Serial Scanner

          </label>

          <div className="relative">

            <ScanLine
              size={22}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              ref={inputRef}
              type="text"
              placeholder="Scan serial number..."
              onKeyDown={handleKeyDown}
              autoFocus
              className="erp-input pl-14 text-2xl font-semibold tracking-wide"
            />

          </div>

        </div>

      </div>

      {/* RECENTLY REGISTERED */}

      <div className="erp-card erp-section">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">

            <Boxes
              size={24}
              className="text-gray-700"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-gray-900">

              Recently Registered

            </h2>

            <p className="text-sm text-gray-500 mt-1">

              Latest serialized inventory registered during this session.

            </p>

          </div>

        </div>

        <div className="space-y-3">

          {registered.length === 0 && (

            <div className="text-gray-500 bg-gray-50 border border-gray-200 rounded-2xl p-5">

              No serials registered in this session yet.

            </div>

          )}

          {registered.map(
            (serial, index) => (

              <div
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-3"
              >

                <Barcode
                  size={20}
                  className="text-gray-600"
                />

                <span className="font-medium text-gray-800 break-all">

                  {serial}

                </span>

              </div>

            )
          )}

        </div>

      </div>

    </div>

  );

}

export default SerialIntake;