import { useState } from "react";

import { Loader2 } from "lucide-react";

interface Props {
  loading: boolean;

  initialData?: any;

  mode?: "create" | "edit";

  onSubmit: (data: any) => Promise<void>;

  onCancel: () => void;
}

function ProductCreateEditForm({
  loading,
  initialData,
  mode = "create",
  onSubmit,
  onCancel,
}: Props) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",

    brand: initialData?.brand || "",

    category: initialData?.category || "",

    price: initialData?.price || "",

    stock_unit: initialData?.stock_unit || "Unit",

    package_size: initialData?.package_size || 1,
  });

  const [errors, setErrors] = useState<any>({});

  /* =========================
     CHANGE
  ========================= */

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================
     VALIDATION
  ========================= */

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (formData.price !== "" && Number(formData.price) < 0) {
      newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      ...formData,

      quantity: 0,

      price: formData.price === "" ? null : Number(formData.price),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* NAME */}

      <div>
        <label className="block text-sm font-semibold mb-2">Product Name</label>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="erp-input"
          placeholder="Enter product name"
        />

        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      {/* BRAND */}

      <div>
        <label className="block text-sm font-semibold mb-2">Brand</label>

        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          className="erp-input"
          placeholder="Enter brand"
        />

        {errors.brand && (
          <p className="text-sm text-red-500 mt-1">{errors.brand}</p>
        )}
      </div>

      {/* CATEGORY */}

      <div>
        <label className="block text-sm font-semibold mb-2">Category</label>

        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="erp-input"
          placeholder="Phones, Laptops, Accessories..."
        />
      </div>

      {/* PRICE */}

      <div>
        <label className="block text-sm font-semibold mb-2">Price</label>

        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="erp-input"
          placeholder="0.00"
        />

        {errors.price && (
          <p className="text-sm text-red-500 mt-1">{errors.price}</p>
        )}
      </div>

      {/* ACTIONS */}

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {mode === "edit" ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}

export default ProductCreateEditForm;
