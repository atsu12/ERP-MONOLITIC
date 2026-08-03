import { ChangeEvent, useRef, useState } from "react";
import toast from "react-hot-toast";

import { apiRequest } from "../../services/api";
import { useSettingsStore } from "../../store/settingsStore";

const API_URL = import.meta.env.VITE_API_URL.replace("/api", "");

type FileUploadFieldProps = {
  label: string;
  value: string;
  type: "logo" | "invoice" | "quotation" | "purchase_order" | "delivery_note";
  accept: string;
  onUploaded: (path: string) => void;
};

function FileUploadField({
  label,
  value,
  type,
  accept,
  onUploaded,
}: FileUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fetchSettings } = useSettingsStore();

  const displayName = value
    ? value.split("/").pop()?.replace(/^\d+-/, "")
    : "";

  const handleChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      const result = await apiRequest(
        `/upload/settings-asset/${type}`,
        {
          method: "POST",
          auth: true,
          body: formData,
        },
      );

      await fetchSettings();

      onUploaded(result.path);

      toast.success("Upload successful");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);

      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this ${label.toLowerCase()}?`)) {
      return;
    }

    try {
      setUploading(true);

      await apiRequest(
        `/upload/settings-asset/${type}`,
        {
          method: "DELETE",
          auth: true,
        },
      );

      await fetchSettings();

      onUploaded("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success("Asset deleted successfully");
    } catch (error) {
      console.error(error);

      toast.error("Delete failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        disabled={uploading}
        onChange={handleChange}
        className="hidden"
      />

      <h3 className="text-base font-semibold text-gray-900">
        {label}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {type === "logo"
          ? "Upload your company logo. It will appear on invoices, quotations, purchase orders, delivery notes and reports."
          : "Upload an Excel template (.xlsx or .xlsm). This template will be used when printing documents."}
      </p>

      {value && (
        <div className="mt-6">
          {type === "logo" ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8">
              <img
                src={`${API_URL}/${value}`}
                alt="Company Logo"
                className="mx-auto max-h-48 object-contain"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <span className="text-2xl">📄</span>
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Current file
            </p>

            <p className="mt-1 break-all font-medium text-green-700">
              {displayName}
            </p>
          </div>
        </div>
      )}

      {uploading && (
        <p className="mt-4 text-sm font-medium text-blue-600">
          Uploading...
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {value ? "Replace" : "Upload"}
        </button>

        {value && (
          <button
            type="button"
            disabled={uploading}
            onClick={handleDelete}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default FileUploadField;