import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { useSettingsStore } from "../store/settingsStore";

import { socket } from "../socket/socket";

import { ArrowLeft, Package, Boxes } from "lucide-react";

import PageLoader from "../components/PageLoader";

import ErrorMessage from "../components/ErrorMessage";

const API_URL = import.meta.env.VITE_API_URL;

function ProductDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);

  const [movements, setMovements] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    socket.connect();

    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    socket.on("settings-updated", handleSettingsUpdate);

    return () => {
      socket.off("settings-updated", handleSettingsUpdate);
    };
  }, []);

  useEffect(() => {
    loadData();

    fetchSettings();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const [productResponse, movementsResponse] = await Promise.all([
        fetch(`${API_URL}/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/products/${id}/movements`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const productData = await productResponse.json();

      const movementData = await movementsResponse.json();

      if (!productResponse.ok) {
        throw new Error(productData.error || "Failed to load product");
      }

      if (!movementsResponse.ok) {
        throw new Error(movementData.error || "Failed to load movements");
      }

      setProduct(productData);

      setMovements(movementData.movements || []);
    } catch (err: any) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading product details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const effectiveRate = settings
    ? settings.usd_exchange_rate * settings.company_multiplier
    : 1;

  const displayPrice = product?.price ? product.price * effectiveRate : 0;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>
      </div>

      <div className="erp-card mb-8">
        <div className="flex items-center gap-3 mb-6">
          {product.track_serial ? (
            <Boxes size={28} className="text-gray-700" />
          ) : (
            <Package size={28} className="text-gray-700" />
          )}

          <h1 className="text-3xl font-bold">{product.name}</h1>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Product ID</p>

            <p className="font-semibold">{product.id}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Brand</p>
            <p className="font-semibold">{product.brand || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-semibold">{product.category || "-"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-semibold">
              {product.track_serial ? "Serialized" : "Standard"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="font-semibold">{product.quantity}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Price (USD)</p>

            <p className="font-semibold">
              {product.price ? `$${Number(product.price).toFixed(2)}` : "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Display Price</p>

            <p className="font-semibold">
              {settings
                ? `${settings.currency_symbol}${displayPrice.toFixed(2)}`
                : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="erp-card mb-8">
        <h2 className="text-xl font-bold mb-4">Inventory History</h2>

        <table className="erp-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Quantity</th>
            </tr>
          </thead>

          <tbody>
            {movements.length === 0 && (
              <tr>
                <td colSpan={3}>No movement history found</td>
              </tr>
            )}

            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>{new Date(movement.created_at).toLocaleString("en-GB")}</td>

                <td>{movement.type}</td>

                <td>{movement.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!!product.track_serial && Array.isArray(product.serials) && (
        <div className="erp-card">
          <h2 className="text-xl font-bold mb-4">
            Serialized Items ({product.serials?.length || 0})
          </h2>

          <table className="erp-table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {product.serials.length === 0 && (
                <tr>
                  <td colSpan={2}>No serialized items found</td>
                </tr>
              )}
              {product.serials.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.serial_number}</td>

                  <td>
                    <span
                      className={
                        item.status === "IN_STOCK"
                          ? "px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold"
                          : "px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold"
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
