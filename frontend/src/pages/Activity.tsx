import { useEffect, useState } from "react";

import HighlightText from "../components/HighlightText";

import { useDebounce } from "../hooks/useDebounce";

import { Activity as ActivityIcon, Clock3, User } from "lucide-react";

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
     LOAD
  ========================= */

  useEffect(() => {
    fetchActivities();
  }, []);

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
        icon={<ActivityIcon size={32} className="text-gray-800" />}
        title="Activity Logs"
        description="Review system activity logs and monitor user actions across inventory operations."
      />

      {/* SEARCH RESULTS */}

      {debouncedSearch && (
        <div className="mb-4 text-sm text-gray-500">
          Found
          <span className="font-semibold text-gray-900 mx-1">
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
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Search
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action or user..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* ACTIVITY TABLE */}

      <div className="erp-table-container">
        <div className="erp-table-scroll"></div>

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
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <User size={18} className="text-gray-700" />
                      </div>

                      <div>
                        <p className="font-semibold text-gray-900">
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
                    {new Date(activity.created_at).toLocaleDateString("en-GB")}
                  </td>

                  <td>
                    <div className="flex items-center gap-2 text-gray-600">
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
  );
}

export default Activity;
