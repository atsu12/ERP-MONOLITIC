import {
  useRef,
  useState
} from "react";

import {
  Barcode,
  CheckCircle2,
  ScanLine,
  Package
} from "lucide-react";

import toast from "react-hot-toast";

const API_URL =
  import.meta.env.VITE_API_URL;

function Scan() {

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [result, setResult] =
    useState<any>(null);

  const handleScan = async () => {

    const serial =
      inputRef.current?.value.trim();

    if (!serial) {

      return;

    }

  

    const toastId =
      toast.loading(
        "Processing scan..."
      );

    setResult(null);

    try {

      const response = await fetch(
        `${API_URL}/scan`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },

          body: JSON.stringify({
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
          "Serial not found"
        );

        return;

      }

      setResult(data);

      toast.dismiss(toastId);

      toast.success(
        "Inventory item validated"
      );

      if (inputRef.current) {

        inputRef.current.value = "";

        inputRef.current.focus();

      }

    } catch (err) {

      console.log(err);

      toast.dismiss(toastId);

      toast.error(
        "Server connection failed"
      );

    } finally {

    }

  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (e.key === "Enter") {

      e.preventDefault();

      handleScan();

    }

  };

  return (

    <div>

      {/* PAGE HEADER */}

      <div className="mb-8">

        <h1 className="erp-page-title">

          Scan Inventory

        </h1>

        <p className="erp-page-description">

          Scan serialized items to validate inventory status and track product activity.

        </p>

      </div>

      {/* SCAN PANEL */}

      <div className="erp-card erp-section mb-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">

            <ScanLine
              size={28}
              className="text-gray-700"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold text-gray-900">

              Barcode Scanner

            </h2>

            <p className="text-sm text-gray-500 mt-1">

              Scan or enter serialized inventory numbers.

            </p>

          </div>

        </div>

        {/* INPUT */}

        <input
          ref={inputRef}
          type="text"
          placeholder="Scan serial number..."
          onKeyDown={handleKeyDown}
          autoFocus
          className="erp-input text-2xl font-semibold tracking-wide"
        />

      </div>

      {/* RESULT */}

      {result && (

        <div className="erp-card erp-section">

          <div className="flex items-center gap-3 mb-6">

            <CheckCircle2
              size={28}
              className="text-green-600"
            />

            <div>

              <h2 className="text-2xl font-bold text-gray-900">

                Scan Result

              </h2>

              <p className="text-sm text-gray-500 mt-1">

                Serialized inventory validation completed successfully.

              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* PRODUCT */}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">

              <div className="flex items-center gap-3 mb-4">

                <Package
                  size={22}
                  className="text-gray-700"
                />

                <p className="text-sm text-gray-500">

                  Product

                </p>

              </div>

              <h3 className="text-xl font-bold text-gray-900">

                {result.product_name}

              </h3>

            </div>

            {/* SERIAL */}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">

              <div className="flex items-center gap-3 mb-4">

                <Barcode
                  size={22}
                  className="text-gray-700"
                />

                <p className="text-sm text-gray-500">

                  Serial Number

                </p>

              </div>

              <h3 className="text-xl font-bold text-gray-900 break-all">

                {result.serial_number}

              </h3>

            </div>

            {/* STATUS */}

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">

              <div className="flex items-center gap-3 mb-4">

                <CheckCircle2
                  size={22}
                  className="text-gray-700"
                />

                <p className="text-sm text-gray-500">

                  Status

                </p>

              </div>

              <div>

                <span
                  className={
                    result.status === "IN_STOCK"
                      ? "erp-badge-success"
                      : "erp-badge-warning"
                  }
                >

                  {result.status}

                </span>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default Scan;