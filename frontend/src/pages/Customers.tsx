import { Users } from "lucide-react";
import { useEffect } from "react";

import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

import { useCustomerStore } from "../store/customerStore";
import { exportCustomers } from "../utils/exportCustomers";

function Customers() {
  const {
    customers,
    loading,
    fetchCustomers,
  } = useCustomerStore();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div>
      {/* HEADER */}

      <PageHeader
        icon={<Users size={32} className="text-slate-800" />}
        title="Customers"
        description="View and manage customer records generated from completed sales."
      />

      {/* KPI CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="erp-card erp-section">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-2">
                Total Customers
              </p>

              <h2 className="text-4xl font-black text-slate-900">
                {customers.length}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Users size={28} className="text-blue-700" />
            </div>
          </div>
        </div>

      </div>

      {/* CUSTOMER TABLE */}

      <div className="erp-table-container">
        <div className="erp-section border-b border-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="erp-section-title">
                Customer Records
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Customer information captured from completed sales.
              </p>
            </div>

            <button
              onClick={() => exportCustomers(customers)}
              disabled={customers.length === 0}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                customers.length === 0
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Export
            </button>
          </div>
        </div>

        <div className="erp-table-scroll">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Contact Person</th>
                <th>Location</th>
                <th>Date Added</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10">
                    <EmptyState
                      title="No customers recorded"
                      description="Customer records will appear here after customer payments are confirmed."
                    />
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                          <Users size={18} className="text-slate-700" />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {customer.customer_name}
                          </p>

                          <p className="text-xs text-slate-500">
                            Customer #{customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      {customer.contact || (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td>
                      {customer.contact_person || (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td>
                      {customer.location || (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Customers;
