import { ArrowLeft, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import PageHeader from "../components/PageHeader";

function WarehouseInventory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [warehouse, setWarehouse] = useState<any>(null);

  const [showAllocateModal, setShowAllocateModal] = useState(false);

  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [allocatingProduct, setAllocatingProduct] = useState<any>(null);
  const [allocationQty, setAllocationQty] = useState("");

  const [adjustingItem, setAdjustingItem] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState("");

  useEffect(() => {
    fetchWarehouse();
    fetchProducts();
    fetchInventory();
  }, []);
  const fetchWarehouse = async () => {
    try {
      const data = await apiRequest("/warehouses", { auth: true });
      const current = data.warehouses.find((w: any) => String(w.id) === id);
      setWarehouse(current || null);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await apiRequest("/products", { auth: true });
      setProducts(data.products || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchInventory = async () => {
    try {
      const data = await apiRequest(`/warehouses/${id}/inventory`, {
        auth: true,
      });

      setInventory(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAllocate = async () => {
    if (!allocatingProduct || !allocationQty) {
      alert("Enter a quantity.");
      return;
    }

    try {
      await apiRequest("/warehouses/inventory", {
        method: "POST",
        auth: true,
        body: {
          warehouse_id: Number(id),
          product_id: allocatingProduct.id,
          quantity: Number(allocationQty),
        },
      });

      await fetchInventory();
      await fetchProducts();

      setShowAllocateModal(false);
      setAllocatingProduct(null);
      setAllocationQty("");

      alert("Inventory allocated successfully.");
    } catch (error: any) {
      console.log(error);

      alert(error?.message || "Allocation failed.");
    }
  };

  const handleAdjust = async () => {
    console.log("handleAdjust called");
    if (!adjustingItem || adjustQty === "") {
      alert("Enter a quantity.");
      return;
    }

    try {
      await apiRequest(`/warehouses/inventory/${adjustingItem.id}`, {
        method: "PUT",
        auth: true,
        body: {
          quantity: Number(adjustQty),
        },
      });

      setAdjustingItem(null);
      setAdjustQty("");

      fetchInventory();
      fetchProducts();

      alert("Allocation updated successfully.");
    } catch (error: any) {
      console.log(error);

      alert(error?.message || "Failed to update allocation.");
    }
  };

  const handleRemoveAllocation = async (item: any) => {
    const confirmed = window.confirm(
      `Remove the allocation for "${item.name}"?`,
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/warehouses/inventory/${item.id}`, {
        method: "DELETE",
        auth: true,
      });

      fetchInventory();
      fetchProducts();

      alert("Allocation removed successfully.");
    } catch (error: any) {
      console.log(error);

      alert(error?.message || "Failed to remove allocation.");
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.brand.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()),
  );

  console.log("adjustingItem:", adjustingItem);

  return (
    <div>
      <PageHeader
        icon={<Warehouse size={32} className="text-gray-800" />}
        title={warehouse?.name || "Warehouse Inventory"}
        description="Allocate company inventory and manage warehouse stock."
        actions={
          <button
            onClick={() => navigate("/warehouses")}
            className="erp-button-secondary flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        }
      />

      {/* WAREHOUSE INVENTORY */}
      <div className="erp-table-container mb-8">
        <div className="erp-section border-b border-gray-200">
          <h2 className="text-2xl font-bold">Warehouse Inventory</h2>
          <p className="text-gray-500 mt-1">
            Products currently allocated to this warehouse.
          </p>
        </div>
        <div className="erp-table-scroll">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Allocated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500">
                    No allocated inventory yet.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <p className="font-semibold">{item.name}</p>

                        <p className="text-xs text-gray-500">{item.brand}</p>
                      </div>
                    </td>

                    <td>{item.quantity}</td>

                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setAdjustingItem(item);
                            setAdjustQty(String(item.quantity));
                            setShowAdjustModal(true);
                          }}
                          className="erp-button-secondary py-2 px-4"
                        >
                          Adjust
                        </button>

                        <button
                          onClick={() => handleRemoveAllocation(item)}
                          className="erp-button-danger py-2 px-4"
                        >
                          Remove
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

      {/* WORKSPACE */}
      <div className="space-y-6">
        {/* =========================COMPANY INVENTORY========================= */}

        <div className="erp-table-container mb-8">
          <div className="erp-section border-b border-gray-200">
            <h2 className="text-2xl font-bold">Company Inventory</h2>

            <p className="text-gray-500 mt-1">
              Search products and allocate inventory to this warehouse.
            </p>

            <input
              type="text"
              placeholder="Search by product, brand or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="erp-input mt-4"
            />
          </div>

          <div className="erp-table-scroll">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Available Quantity</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-10 text-gray-500">
                      No matching products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div>
                          <p className="font-semibold">{product.name}</p>

                          <p className="text-xs text-gray-500">
                            {product.brand}
                          </p>
                        </div>
                      </td>

                      <td>{product.quantity}</td>

                      <td className="text-center">
                        <button
                          onClick={() => {
                            setAllocatingProduct(product);
                            setAllocationQty("");
                            setShowAllocateModal(true);
                          }}
                          className="erp-button-primary py-2 px-4"
                        >
                          Allocate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAllocateModal && allocatingProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="erp-card w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-6">Allocate Inventory</h2>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500">Product</p>

                <p className="font-semibold">{allocatingProduct.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Company Available Quantity
                </p>

                <p className="font-semibold">{allocatingProduct.quantity}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Quantity to Allocate</p>

                <input
                  type="number"
                  min="1"
                  max={allocatingProduct.quantity}
                  value={allocationQty}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (
                      value === "" ||
                      Number(value) <= allocatingProduct.quantity
                    ) {
                      setAllocationQty(value);
                    }
                  }}
                  className="erp-input mt-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAllocateModal(false);
                    setAllocatingProduct(null);
                    setAllocationQty("");
                  }}
                  className="erp-button-secondary"
                >
                  Cancel
                </button>

                <button onClick={handleAllocate} className="erp-button-primary">
                  Allocate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdjustModal && adjustingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="erp-card w-full max-w-xl">
            <h2 className="text-2xl font-bold mb-6">Adjust Allocation</h2>

            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500">Product</p>

                <p className="font-semibold">{adjustingItem.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Current Allocation</p>

                <p className="font-semibold">{adjustingItem.quantity}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">New Quantity</p>

                <input
                  type="number"
                  min="0"
                  max={adjustingItem.quantity}
                  value={adjustQty}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (
                      value === "" ||
                      Number(value) <= adjustingItem.quantity
                    ) {
                      setAdjustQty(value);
                    }
                  }}
                  className="erp-input mt-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustingItem(null);
                  }}
                  className="erp-button-secondary"
                >
                  Cancel
                </button>

                <button onClick={handleAdjust} className="erp-button-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WarehouseInventory;
