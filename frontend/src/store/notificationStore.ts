import {
  create
} from "zustand";

interface Notification {

  id: number;

  type:
    | "success"
    | "error"
    | "warning"
    | "info";

  title: string;

  message: string;

  createdAt: string;

}

interface NotificationState {

  notifications:
    Notification[];

  addNotification:
    (
      notification:
        Omit<
          Notification,
          "id" | "createdAt"
        >
    ) => void;

  removeNotification:
    (id: number) => void;

  clearNotifications:
    () => void;

}

const MAX_NOTIFICATIONS = 20;

export const useNotificationStore =
  create<NotificationState>((set) => ({

    notifications: [],

    /* =========================
       ADD
    ========================= */

    addNotification:
      (notification) => {

        const id =
          Date.now();

        const newNotification = {

          ...notification,

          id,

          createdAt:
            new Date().toISOString(),

        };

        set((state) => {

          const updated = [

            newNotification,

            ...state.notifications,

          ].slice(
            0,
            MAX_NOTIFICATIONS
          );

          return {
            notifications:
              updated
          };

        });

        /* =========================
           AUTO REMOVE
        ========================= */

        setTimeout(() => {

          set((state) => ({

            notifications:
              state.notifications.filter(
                (n) => n.id !== id
              ),

          }));

        }, 7000);

      },

    /* =========================
       REMOVE
    ========================= */

    removeNotification:
      (id) => {

        set((state) => ({

          notifications:
            state.notifications.filter(
              (n) => n.id !== id
            ),

        }));

      },

    /* =========================
       CLEAR
    ========================= */

    clearNotifications:
      () => {

        set({
          notifications: []
        });

      },

  }));