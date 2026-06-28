import ProductCreateEditForm from "./ProductCreateEditForm";

interface Props {
  open: boolean;

  loading: boolean;

  mode?: "create" | "edit";

  initialData?: any;

  onClose: () => void;

  onSubmit: (data: any) => Promise<void>;
}

function AddEditProductModal({
  open,
  loading,
  mode = "create",
  initialData,
  onClose,
  onSubmit,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "edit" ? "Edit Product" : "Create Product"}
          </h2>

          <p className="text-gray-500 mt-1">Add a new inventory product.</p>
        </div>

        <ProductCreateEditForm
          loading={loading}
          mode={mode}
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}

export default AddEditProductModal;
