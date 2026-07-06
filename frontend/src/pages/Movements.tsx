import { useDebounce } from "../hooks/useDebounce";

import { useEffect, useMemo, useState } from "react";

import { exportMovementsToExcel } from "../utils/exportMovements";

import { ArrowLeftRight } from "lucide-react";

import { useMovementStore } from "../store/movementStore";

import PageHeader from "../components/PageHeader";

import { DatePicker } from "antd";
import dayjs from "dayjs";

import PageLoader from "../components/PageLoader";

import EmptyState from "../components/EmptyState";

import ErrorMessage from "../components/ErrorMessage";

function Movements() {
  const {
    movements,

    loading,

    error,

    fetchMovements,
  } = useMovementStore();

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    fetchMovements();
  }, []);

  /* =========================
     FILTERED MOVEMENTS
  ========================= */

  // For future enhancement: Add date range filter and user filter options
  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [filterType, setFilterType] = useState("all");

  const [filterValue, setFilterValue] = useState("");

  const [selectedMovements, setSelectedMovements] = useState<number[]>([]);

  const movementLabels: Record<string, string> = {
    RECEIVED: "Received",
    STOCK_OUT: "Stock Out",
    RETURNED: "Returned",
    DAMAGED: "Damaged",
    TRANSFERRED: "Transferred",
    ADJUSTMENT_IN: "Adjustment In",
    ADJUSTMENT_OUT: "Adjustment Out",
  };

  const filteredMovements = useMemo(() => {
    const term = debouncedSearch.toLowerCase();

    return movements.filter((movement) => {
      const matchesSearch =
        !term ||
        movement.product_name?.toLowerCase().includes(term) ||
        movement.serial_number?.toLowerCase().includes(term) ||
        movement.reference?.toLowerCase().includes(term) ||
        movement.username?.toLowerCase().includes(term) ||
        movementLabels[movement.type].toLowerCase().includes(term);

      const movementDate = movement.created_at.slice(0, 10);

      const matchesDate =
        (!fromDate || movementDate >= fromDate) &&
        (!toDate || movementDate <= toDate);

      const matchesType =
        filterType !== "type" || !filterValue || movement.type === filterValue;

      return matchesSearch && matchesDate && matchesType;
    });
  }, [movements, debouncedSearch, fromDate, toDate, filterType, filterValue]);
  const allSelected =
    filteredMovements.length > 0 &&
    filteredMovements.every((movement) =>
      selectedMovements.includes(movement.id),
    );

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <PageLoader text="Loading inventory movements..." />;
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      {/* HEADER */}

      <PageHeader
        icon={<ArrowLeftRight size={32} className="text-gray-800" />}
        title="Inventory Movements"
        description="Track stock movement operations and warehouse transactions."
      />

      {/* SEARCH RESULTS */}

      {debouncedSearch && (
        <div className="mb-4 text-sm text-gray-500">
          Found
          <span className="font-semibold text-gray-900 mx-1">
            {filteredMovements.length}
          </span>
          matching movement(s) for
          <span className="font-semibold text-black ml-1">
            "{debouncedSearch}"
          </span>
        </div>
      )}

      {/* SEARCH */}

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product, serial number, reference, user or movement..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* TOOL BAR */}

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700">
          Selected: {selectedMovements.length}
        </span>

        <button
          disabled={selectedMovements.length === 0}
          onClick={() => {
            const movementsToExport = filteredMovements.filter((movement) =>
              selectedMovements.includes(movement.id),
            );

            exportMovementsToExcel(movementsToExport);
          }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            selectedMovements.length === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Export
        </button>
        <span className="text-sm font-medium text-gray-700">Date From</span>

        <DatePicker
          format="DD/MM/YYYY"
          value={fromDate ? dayjs(fromDate) : null}
          onChange={(date) =>
            setFromDate(date ? date.format("YYYY-MM-DD") : "")
          }
        />

        <span className="text-sm font-medium text-gray-700">Date To</span>

        <DatePicker
          format="DD/MM/YYYY"
          value={toDate ? dayjs(toDate) : null}
          onChange={(date) => setToDate(date ? date.format("YYYY-MM-DD") : "")}
        />

        <span className="text-sm font-medium text-gray-700">Movement</span>

        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setFilterValue("");
          }}
          className="px-3 py-2 rounded-xl border border-gray-300"
        >
          <option value="all">All Movements</option>
          <option value="type">Type</option>
        </select>

        {filterType === "type" && (
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-300"
          >
            <option value="">All Types</option>
            <option value="RECEIVED">Received</option>
            <option value="STOCK_OUT">Stock Out</option>
            <option value="RETURNED">Returned</option>
            <option value="DAMAGED">Damaged</option>
            <option value="ADJUSTMENT_IN">Adjustment In</option>
            <option value="ADJUSTMENT_OUT">Adjustment Out</option>
            <option value="TRANSFERRED">Transferred</option>
          </select>
        )}
      </div>
      {/* TABLE */}

      <div className="erp-table-container">
        <div className="erp-table-scroll"></div>

        <table className="erp-table">
          <thead>
            <tr>
              <th className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedMovements(
                        filteredMovements.map((movement) => movement.id),
                      );
                    } else {
                      setSelectedMovements([]);
                    }
                  }}
                />
              </th>

              <th>Product</th>
              <th>Serial No.</th>
              <th>Movement</th>
              <th>Reference</th>
              <th>User</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {filteredMovements.length === 0 && (
              <tr>
                <td colSpan={9}>
                  <EmptyState
                    title="No matching movements"
                    description="Try adjusting your search keywords."
                  />
                </td>
              </tr>
            )}

            {filteredMovements.map((movement) => (
              <tr key={movement.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedMovements.includes(movement.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMovements([
                          ...selectedMovements,
                          movement.id,
                        ]);
                      } else {
                        setSelectedMovements(
                          selectedMovements.filter((id) => id !== movement.id),
                        );
                      }
                    }}
                  />
                </td>

                <td>{movement.product_name}</td>

                <td>{movement.serial_number || "-"}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      movement.type === "RECEIVED"
                        ? "bg-green-100 text-green-700"
                        : movement.type === "STOCK_OUT"
                          ? "bg-red-100 text-red-700"
                          : movement.type === "RETURNED"
                            ? "bg-blue-100 text-blue-700"
                            : movement.type === "DAMAGED"
                              ? "bg-orange-100 text-orange-700"
                              : movement.type === "TRANSFERRED"
                                ? "bg-purple-100 text-purple-700"
                                : movement.type === "ADJUSTMENT_IN"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : movement.type === "ADJUSTMENT_OUT"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {movementLabels[movement.type] || movement.type}
                  </span>
                </td>

                <td>{movement.reference || "-"}</td>

                <td>{movement.username || "-"}</td>

                <td>{movement.quantity}</td>

                <td>
                  {new Date(movement.created_at).toLocaleDateString("en-GB")}
                </td>

                <td>
                  {new Date(movement.created_at).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Movements;
