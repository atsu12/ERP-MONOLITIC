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

const playNotificationTone = () => {
  try {
    const AudioContext =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      880,
      audioContext.currentTime,
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      660,
      audioContext.currentTime + 0.12,
    );

    gainNode.gain.setValueAtTime(
      0.0001,
      audioContext.currentTime,
    );

    gainNode.gain.exponentialRampToValueAtTime(
      0.12,
      audioContext.currentTime + 0.01,
    );

    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      audioContext.currentTime + 0.18,
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(
      audioContext.currentTime + 0.18,
    );
  } catch {
    // Audio is optional; notification must still work.
  }
};

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

        playNotificationTone();

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