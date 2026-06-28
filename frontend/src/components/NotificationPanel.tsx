import {

  Bell,

  CheckCircle2,

  AlertTriangle,

  Info,

  XCircle,

  X,

} from "lucide-react";

import {
  useNotificationStore
} from "../store/notificationStore";

function NotificationPanel() {

  const {

    notifications,

    removeNotification,

    clearNotifications,

  } = useNotificationStore();

  /* =========================
     TYPE CONFIG
  ========================= */

  const getNotificationStyles =
    (type: string) => {

      switch (type) {

        case "success":

          return {

            icon:
              <CheckCircle2
                size={20}
                className="text-green-600"
              />,

            badge:
              "bg-green-100 text-green-700",

            border:
              "border-green-200",

          };

        case "warning":

          return {

            icon:
              <AlertTriangle
                size={20}
                className="text-yellow-600"
              />,

            badge:
              "bg-yellow-100 text-yellow-700",

            border:
              "border-yellow-200",

          };

        case "error":

          return {

            icon:
              <XCircle
                size={20}
                className="text-red-600"
              />,

            badge:
              "bg-red-100 text-red-700",

            border:
              "border-red-200",

          };

        default:

          return {

            icon:
              <Info
                size={20}
                className="text-blue-600"
              />,

            badge:
              "bg-blue-100 text-blue-700",

            border:
              "border-blue-200",

          };

      }

    };

  return (

    <div className="absolute right-0 top-14 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">

      {/* HEADER */}

      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">

        <div className="flex items-center gap-2">

          <Bell
            size={18}
            className="text-gray-700"
          />

          <h3 className="font-bold text-gray-900">

            Notifications

          </h3>

        </div>

        <div className="flex items-center gap-3">

          {notifications.length > 0 && (

            <button
              onClick={clearNotifications}
              className="text-xs text-gray-500 hover:text-red-600 transition"
            >

              Clear all

            </button>

          )}

          <span className="text-sm text-gray-500">

            {notifications.length}

          </span>

        </div>

      </div>

      {/* EMPTY */}

      {notifications.length === 0 && (

        <div className="p-8 text-center text-gray-500">

          No notifications available.

        </div>

      )}

      {/* LIST */}

      <div className="max-h-[420px] overflow-y-auto">

        {notifications.map((notification) => {

          const styles =
            getNotificationStyles(
              notification.type
            );

          return (

            <div
              key={notification.id}
              className={`p-4 border-b ${styles.border} hover:bg-gray-50 transition`}
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex gap-3">

                  {/* ICON */}

                  <div className="mt-1">

                    {styles.icon}

                  </div>

                  {/* CONTENT */}

                  <div>

                    <div className="flex items-center gap-2">

                      <h4 className="font-semibold text-gray-900">

                        {notification.title}

                      </h4>

                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${styles.badge}`}
                      >

                        {notification.type}

                      </span>

                    </div>

                    <p className="text-sm text-gray-600 mt-1">

                      {notification.message}

                    </p>

                    <p className="text-xs text-gray-400 mt-2">

                      {
                        new Date(
                          notification.createdAt
                        ).toLocaleString()
                      }

                    </p>

                  </div>

                </div>

                {/* CLOSE */}

                <button
                  onClick={() =>
                    removeNotification(
                      notification.id
                    )
                  }
                  className="text-gray-400 hover:text-red-500 transition"
                >

                  <X size={16} />

                </button>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}

export default NotificationPanel;