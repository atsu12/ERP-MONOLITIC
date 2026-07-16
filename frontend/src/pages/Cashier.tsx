import { socket } from "../socket/socket";

import { useEffect, useState } from "react";

import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

function Cashier() {
  const [dispatches, setDispatches] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchDispatches = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/dispatch/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to load dispatches");

        return;
      }

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

  useEffect(() => {
    socket.connect();

    fetchDispatches();

    socket.on("dispatch-updated", fetchDispatches);

    return () => {
      socket.off("dispatch-updated", fetchDispatches);
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

                  <p className="text-sm text-gray-500">{dispatch.reference}</p>

                  <p className="text-sm text-gray-500">
                    Staff: {dispatch.staff_name}
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
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold">
                    GH₵ {Number(dispatch.grand_total).toFixed(2)}
                  </p>

                  <button
                    onClick={() => confirmPayment(dispatch.id)}
                    className="mt-4 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl"
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Cashier;
