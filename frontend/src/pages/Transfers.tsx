import {
  ArrowLeftRight,
  Package,
  Truck,
  Clock3
} from "lucide-react";

import {
  useState
} from "react";

import PageHeader
  from "../components/PageHeader";

import EmptyState
  from "../components/EmptyState";

function Transfers() {

  /* =========================
     MOCK DATA
  ========================= */

  const [transfers] =
    useState([
      {
        id: 1,
        product: "HP EliteBook 840",
        from: "Main Warehouse",
        to: "Branch A",
        quantity: 5,
        status: "IN TRANSIT",
        created_at:
          new Date().toISOString(),
      },

      {
        id: 2,
        product: "Dell Latitude 5420",
        from: "Main Warehouse",
        to: "Branch B",
        quantity: 3,
        status: "COMPLETED",
        created_at:
          new Date().toISOString(),
      },
    ]);

  return (

    <div>

      {/* HEADER */}

      <PageHeader
        icon={
          <ArrowLeftRight
            size={32}
            className="text-gray-800"
          />
        }
        title="Transfers"
        description="Manage inventory transfers between warehouses and operational locations."
      />

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* TOTAL */}

        <div className="erp-card erp-section">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500 mb-2">

                Total Transfers

              </p>

              <h2 className="text-4xl font-black text-gray-900">

                {transfers.length}

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

              <ArrowLeftRight
                size={28}
                className="text-blue-700"
              />

            </div>

          </div>

        </div>

        {/* IN TRANSIT */}

        <div className="erp-card erp-section">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500 mb-2">

                In Transit

              </p>

              <h2 className="text-4xl font-black text-gray-900">

                {
                  transfers.filter(
                    (t) =>
                      t.status ===
                      "IN TRANSIT"
                  ).length
                }

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">

              <Truck
                size={28}
                className="text-yellow-700"
              />

            </div>

          </div>

        </div>

        {/* COMPLETED */}

        <div className="erp-card erp-section">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500 mb-2">

                Completed

              </p>

              <h2 className="text-4xl font-black text-gray-900">

                {
                  transfers.filter(
                    (t) =>
                      t.status ===
                      "COMPLETED"
                  ).length
                }

              </h2>

            </div>

            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">

              <Package
                size={28}
                className="text-green-700"
              />

            </div>

          </div>

        </div>

      </div>

      {/* TRANSFER TABLE */}

      <div className="erp-table-container">

        <div className="erp-section border-b border-gray-200">

          <h2 className="text-2xl font-bold text-gray-900">

            Warehouse Transfers

          </h2>

          <p className="text-sm text-gray-500 mt-1">

            Monitor operational inventory movement between warehouse locations.

          </p>

        </div>

        <div className="erp-table-scroll">

          <table className="erp-table">

            <thead>

              <tr>

                <th>Product</th>

                <th>From</th>

                <th>To</th>

                <th>Quantity</th>

                <th>Status</th>

                <th>Date</th>

              </tr>

            </thead>

            <tbody>

              {transfers.length === 0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="py-10"
                  >

                    <EmptyState
                      title="No transfer activity"
                      description="Warehouse transfer operations will appear here."
                    />

                  </td>

                </tr>

              )}

              {transfers.map(
                (transfer) => (

                  <tr
                    key={transfer.id}
                  >

                    <td>

                      {transfer.product}

                    </td>

                    <td>

                      {transfer.from}

                    </td>

                    <td>

                      {transfer.to}

                    </td>

                    <td>

                      {transfer.quantity}

                    </td>

                    <td>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transfer.status ===
                          "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >

                        {transfer.status}

                      </span>

                    </td>

                    <td>

                      <div className="flex items-center gap-2 text-gray-600">

                        <Clock3
                          size={16}
                        />

                        <span>

                          {
                            new Date(
                              transfer.created_at
                            ).toLocaleString()
                          }

                        </span>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default Transfers;