import { Warehouse, Package, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useWarehouseStore } from "../store/warehouseStore";

import PageHeader from "../components/PageHeader";

import EmptyState from "../components/EmptyState";

function Warehouses() {
  const navigate = useNavigate();

  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const {
    warehouses,
    loading,
    fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  } = useWarehouseStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [name, setName] = useState("");
  const totalUnits = warehouses.reduce(
    (total, warehouse) => total + Number(warehouse.quantity || 0),
    0,
  );

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleCreateWarehouse = async () => {
    let success = false;

    if (editingWarehouse) {
      success = await updateWarehouse(editingWarehouse.id, {
        name,
        code: name,
        location: null,
        status: editingWarehouse.status,
      });
    } else {
      success = await createWarehouse({
        name,
        code: name,
        location: null,
      });
    }

    if (success) {
      setShowCreateModal(false);

      setEditingWarehouse(null);

      setName("");
    }
  };

  const handleDeleteWarehouse = async (id: number, name: string) => {
    const confirmed = window.confirm(`Delete warehouse "${name}"?`);

    if (!confirmed) {
      return;
    }

    await deleteWarehouse(id);
  };

  return (
    <div>
      {/* HEADER */}

      <PageHeader
        icon={<Warehouse size={32} className="text-gray-800" />}
        title="Warehouses"
        description="Manage warehouse locations and inventory distribution centers."
        actions={
          <button
            onClick={() => {
              setEditingWarehouse(null);

              setName("");

              setShowCreateModal(true);
            }}
            className="erp-button-primary"
          >
            + Add Warehouse
          </button>
        }
      />
      {/* KPI CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* TOTAL */}

        <div className="erp-card erp-section">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Warehouses</p>

              <h2 className="text-4xl font-black text-gray-900">
                {warehouses.length}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Warehouse size={28} className="text-blue-700" />
            </div>
          </div>
        </div>

        {/* ACTIVE */}

        <div className="erp-card erp-section">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Active Warehouses</p>

              <h2 className="text-4xl font-black text-gray-900">
                {warehouses.filter((w) => w.status === "ACTIVE").length}
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
              <ShieldCheck size={28} className="text-green-700" />
            </div>
          </div>
        </div>

        {/* PRODUCTS */}

        <div className="erp-card erp-section">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Total Units Stored</p>

              <h2 className="text-4xl font-black text-gray-900">
                {totalUnits.toLocaleString()}
                <p className="text-sm text-gray-500 mt-2">
                  {warehouses.reduce(
                    (total, warehouse) =>
                      total + Number(warehouse.products || 0),
                    0,
                  )}{" "}
                  allocated product records
                </p>
              </h2>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
              <Package size={28} className="text-purple-700" />
            </div>
          </div>
        </div>
      </div>

      {/* WAREHOUSE TABLE */}

      <div className="erp-table-container">
        <div className="erp-section border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Warehouse Locations
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Operational warehouse infrastructure and inventory distribution
            overview.
          </p>
        </div>

        <div className="erp-table-scroll">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Warehouse</th>

                <th>Products</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center">
                    Loading warehouses...
                  </td>
                </tr>
              ) : warehouses.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10">
                    <EmptyState
                      title="No warehouses configured"
                      description="Warehouse infrastructure will appear here."
                    />
                  </td>
                </tr>
              ) : (
                warehouses.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Warehouse size={18} className="text-gray-700" />
                        </div>

                        <button
                          onClick={() =>
                            navigate(`/warehouses/${warehouse.id}/inventory`)
                          }
                          className="font-semibold text-gray-900 hover:text-blue-600 hover:underline"
                        >
                          {warehouse.name}
                        </button>
                      </div>
                    </td>

                    <td>
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {warehouse.products}{" "}
                          {warehouse.products === 1 ? "product" : "products"}
                        </span>

                        <span className="text-xs text-gray-500">
                          {warehouse.quantity}{" "}
                          {warehouse.quantity === 1 ? "unit" : "units"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setName(warehouse.name);

                            setEditingWarehouse(warehouse);

                            setShowCreateModal(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteWarehouse(warehouse.id, warehouse.name)
                          }
                          className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>

                        
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-5">
              {editingWarehouse ? "Edit Warehouse" : "Create Warehouse"}
            </h2>

            <div className="grid gap-4">
              <input
                type="text"
                placeholder="Warehouse Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="erp-input"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);

                  setEditingWarehouse(null);

                  setName("");
                }}
                className="erp-button-secondary"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateWarehouse}
                className="erp-button-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Warehouses;
