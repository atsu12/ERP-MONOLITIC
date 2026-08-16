import { useEffect, useState } from "react";

import DispatchDetailsModal from "../components/DispatchDetailsModal";

import { socket } from "../socket/socket";

import toast from "react-hot-toast";

import { useSettingsStore } from "../store/settingsStore";

const API_URL = import.meta.env.VITE_API_URL;

function Cashier() {
  const { settings, fetchSettings } = useSettingsStore();
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispatch, setSelectedDispatch] = useState<any>(null);
  const [dispatchItems, setDispatchItems] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const [editingPricing, setEditingPricing] = useState<number | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [vatInput, setVatInput] = useState("");

  const cancelDispatch = async (id: number) => {
    if (!confirm("Cancel this dispatch?")) return;

    try {
      const response = await fetch(`${API_URL}/dispatch/${id}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to cancel dispatch");
        return;
      }

      toast.success("Dispatch cancelled");

      await fetchDispatches();
    } catch {
      toast.error("Server connection failed");
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

  const fetchDispatches = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/dispatch/pending`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log("API returned:", data.dispatches);

      if (!response.ok) {
        toast.error(data.error || "Failed to load dispatches");

        return;
      }

      console.log("Updating state...");

      setDispatches(data.dispatches || []);
    } catch {
      toast.error("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (dispatchId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/dispatch/${dispatchId}/confirm-payment`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to confirm payment");

        return;
      }

      toast.success(data.message);

      fetchDispatches();
    } catch {
      toast.error("Server connection failed");
    }
  };

  const createSalesInvoice = async (dispatchId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/dispatch/${dispatchId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        let message = "Unable to create sales invoice.";

        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch {
          // Ignore JSON parsing errors
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Sales-Invoice-${dispatchId}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Sales Invoice generated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Unable to create sales invoice.");
    }
  };

  const adjustPricing = async (
    dispatchId: number,
    discount: number,
    vat: number,
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/dispatch/${dispatchId}/adjust-pricing`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            discount,
            vat,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update pricing");
        return;
      }

      toast.success("Pricing updated");

      await fetchDispatches();
    } catch {
      toast.error("Server connection failed");
    }
  };

  useEffect(() => {
    fetchDispatches();

    socket.connect();

    const refreshDispatches = () => {
      fetchDispatches();
    };

    socket.on("dispatch-updated", refreshDispatches);
    socket.on("dispatch-paid", refreshDispatches);
    socket.on("dispatch-completed", refreshDispatches);

    return () => {
      socket.off("dispatch-updated", refreshDispatches);
      socket.off("dispatch-paid", refreshDispatches);
      socket.off("dispatch-completed", refreshDispatches);
    };
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="erp-page-title">Cashier</h1>

        <p className="erp-page-description">
          Review pending dispatches and confirm payments.
        </p>
      </div>

      <div className="erp-card erp-section">
        <div className="space-y-4">
          {dispatches.length === 0 && (
            <p className="text-gray-500">No pending payments.</p>
          )}

          {dispatches.map((dispatch) => (
            <div
              key={dispatch.id}
              className="border border-gray-200 rounded-2xl p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-bold text-lg">
                    {dispatch.customer_name}
                  </h2>

                  <p className="text-sm text-gray-500">
                    Reference: {dispatch.reference}
                  </p>

                  {dispatch.contact && (
                    <p className="text-sm text-gray-500">
                      Contact: {dispatch.contact}
                    </p>
                  )}

                  {dispatch.location && (
                    <p className="text-sm text-gray-500">
                      Location: {dispatch.location}
                    </p>
                  )}

                  <p className="text-sm text-gray-500">
                    Staff: {dispatch.staff_name}
                  </p>
                </div>

                <div className="text-right">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-6">
                      <span className="text-sm text-gray-600">Subtotal:</span>

                      <span className="font-medium">
                        {settings?.currency_symbol}{" "}
                        {Number(dispatch.subtotal).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-6">
                      <span className="text-sm text-gray-600">Discount:</span>

                      {editingPricing === dispatch.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={discountInput}
                          onChange={(e) => setDiscountInput(e.target.value)}
                          className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-right"
                        />
                      ) : (
                        <span className="font-medium">
                          {settings?.currency_symbol}{" "}
                          {Number(dispatch.discount).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-6">
                      <span className="text-sm text-gray-600">VAT:</span>

                      {editingPricing === dispatch.id ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={vatInput}
                          onChange={(e) => setVatInput(e.target.value)}
                          className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-right"
                        />
                      ) : (
                        <span className="font-medium">
                          {settings?.currency_symbol}{" "}
                          {Number(dispatch.vat).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Grand Total:</span>

                        <span className="text-2xl font-bold">
                          {settings?.currency_symbol}{" "}
                          {(
                            Number(dispatch.subtotal) -
                            (editingPricing === dispatch.id
                              ? Number(discountInput || 0)
                              : Number(dispatch.discount || 0)) +
                            (editingPricing === dispatch.id
                              ? Number(vatInput || 0)
                              : Number(dispatch.vat || 0))
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    {editingPricing === dispatch.id ? (
                      <>
                        <button
                          onClick={async () => {
                            const discount = Number(discountInput);
                            const vat = Number(vatInput);

                            if (!Number.isFinite(discount) || discount < 0) {
                              toast.error("Enter a valid discount");
                              return;
                            }

                            if (!Number.isFinite(vat) || vat < 0) {
                              toast.error("Enter a valid VAT amount");
                              return;
                            }

                            if (discount > Number(dispatch.subtotal)) {
                              toast.error("Discount cannot exceed subtotal");
                              return;
                            }

                            await adjustPricing(dispatch.id, discount, vat);

                            setEditingPricing(null);
                          }}
                          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl"
                        >
                          Save Pricing
                        </button>

                        <button
                          onClick={() => {
                            setEditingPricing(null);
                            setDiscountInput("");
                            setVatInput("");
                          }}
                          className="border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-100"
                        >
                          Cancel Pricing
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPricing(dispatch.id);
                          setDiscountInput(
                            Number(dispatch.discount || 0).toFixed(2),
                          );
                          setVatInput(Number(dispatch.vat || 0).toFixed(2));
                        }}
                        className="border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-100"
                      >
                        Adjust Pricing
                      </button>
                    )}
                    <button
                      onClick={() => openDispatch(dispatch.id)}
                      className="border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-100"
                    >
                      View Products
                    </button>

                    <button
                      type="button"
                      onClick={() => createSalesInvoice(dispatch.id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Create Sales Invoice
                    </button>

                    <button
                      onClick={() => confirmPayment(dispatch.id)}
                      className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl"
                    >
                      Confirm Payment
                    </button>

                    <button
                      onClick={() => cancelDispatch(dispatch.id)}
                      className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDispatch && (
        <DispatchDetailsModal
          dispatch={selectedDispatch}
          items={dispatchItems}
          showCompleteButton={false}
          onClose={() => {
            setSelectedDispatch(null);
            setDispatchItems([]);
          }}
          onComplete={() => {}}
        />
      )}
    </div>
  );
}

export default Cashier;
