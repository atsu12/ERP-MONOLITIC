import { useEffect, useState } from "react";

import HighlightText from "../components/HighlightText";

import { useDebounce } from "../hooks/useDebounce";

import { Activity as ActivityIcon, Clock3, User } from "lucide-react";

import { DatePicker } from "antd";
import dayjs from "dayjs";

import PageHeader from "../components/PageHeader";

import PageLoader from "../components/PageLoader";

import EmptyState from "../components/EmptyState";

import ErrorMessage from "../components/ErrorMessage";

import { useActivityStore } from "../store/activityStore";

function Activity() {
  const {
    activities,

    loading,

    error,

    fetchActivities,
  } = useActivityStore();

  /* =========================
     SEARCH
  ========================= */

  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search);

  /* =========================
     DATE FILTERS
  ========================= */

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const minimumAuditDate = dayjs().subtract(3, "year");

  const maximumAuditDate = dayjs();

  /* =========================
     LOAD
  ========================= */

  useEffect(() => {
    fetchActivities({
      fromDate,
      toDate,
    });
  }, [fromDate, toDate]);

  /* =========================
     FILTERED ACTIVITIES
  ========================= */

  const filteredActivities = activities.filter((activity) => {
    if (!debouncedSearch.trim()) {
      return true;
    }

    const term = debouncedSearch.toLowerCase();

    return (
      activity.action?.toLowerCase().includes(term) ||
      activity.username?.toLowerCase().includes(term) ||
      String(activity.user_id).includes(term)
    );
  });

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return <PageLoader text="Loading activity logs..." />;
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      {/* PAGE HEADER */}

      <PageHeader
        icon={<ActivityIcon size={32} className="text-slate-800" />}
        title="Activity Audit Logs"
        description="Review system activity logs and monitor user actions across inventory operations."
      />

      {/* AUDIT HISTORY RANGE */}

      <div className="erp-search-bar mb-5">
        <div className="w-full">
          <div className="mb-3">
            <p className="erp-section-title">
              Audit History
            </p>

            <p className="erp-page-description">
              Search activity history for up to 3 years.
            </p>
          </div>

          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="erp-label">
                Date From
              </label>

              <DatePicker
                format="DD/MM/YYYY"
                value={fromDate ? dayjs(fromDate) : null}
                minDate={minimumAuditDate}
                maxDate={maximumAuditDate}
                onChange={(date) =>
                  setFromDate(date ? date.format("YYYY-MM-DD") : "")
                }
              />
            </div>

            <div>
              <label className="erp-label">
                Date To
              </label>

              <DatePicker
                format="DD/MM/YYYY"
                value={toDate ? dayjs(toDate) : null}
                minDate={minimumAuditDate}
                maxDate={maximumAuditDate}
                onChange={(date) =>
                  setToDate(date ? date.format("YYYY-MM-DD") : "")
                }
              />
            </div>

            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="erp-secondary-button"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS */}

      {debouncedSearch && (
        <div className="mb-4 text-sm text-slate-500">
          Found
          <span className="font-semibold text-slate-900 mx-1">
            {filteredActivities.length}
          </span>
          matching activity log(s) for
          <span className="font-semibold text-black ml-1">
            "{debouncedSearch}"
          </span>
        </div>
      )}

      {/* SEARCH */}

      <div className="mb-5">
        <label className="erp-label">
          Search
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action or user..."
          className="erp-search w-full"
        />
      </div>

      {/* ACTIVITY TABLE */}

      <div className="erp-table-container">
        <div className="erp-table-scroll">
          <table className="erp-table">
          <thead>
            <tr>
              <th>User</th>

              <th>Action</th>

              <th>Date</th>

              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {filteredActivities.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    title="No activity logs"
                    description="User activity and operational logs will appear here."
                  />
                </td>
              </tr>
            )}

            {filteredActivities.map((activity) => {
              const action = activity.action.toLowerCase();

              const badgeClass =
                action.includes("delete") ||
                action.includes("removed") ||
                action.includes("stock out")
                  ? "erp-badge-danger"
                  : action.includes("update") || action.includes("edit")
                    ? "erp-badge-warning"
                    : "erp-badge-success";

              return (
                <tr key={activity.id}>
                  {/* USER */}

                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <User size={18} className="text-slate-700" />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-900">
                          {activity.username || `User #${activity.user_id}`}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ACTION */}

                  <td>
                    <span className={badgeClass}>
                      <HighlightText
                        text={activity.action}
                        highlight={debouncedSearch}
                      />
                    </span>
                  </td>

                  {/* DATE */}

                  <td>
                    {new Date(activity.created_at).toLocaleDateString(
                      "en-GB",
                    )}
                  </td>

                  {/* TIME */}

                  <td>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock3 size={16} />

                      <span>
                        {new Date(activity.created_at).toLocaleTimeString(
                          "en-GB",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Activity;