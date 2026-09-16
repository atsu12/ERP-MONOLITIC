import { create } from "zustand";

interface Notification {
  id: number;

  type: "success" | "error" | "warning" | "info";

  title: string;

  message: string;

  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];

  toneEnabled: boolean;

  toggleTone: () => void;

  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">,
    playTone?: boolean,
  ) => void;

  removeNotification: (id: number) => void;

  clearNotifications: () => void;
}

const MAX_NOTIFICATIONS = 20;
const NOTIFICATION_RETENTION_MS = 24 * 60 * 60 * 1000;
const NOTIFICATION_STORAGE_KEY = "business-mgt-notifications";
const NOTIFICATION_TONE_KEY = "business-mgt-notification-tone";

const loadToneEnabled = (): boolean => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_TONE_KEY);

    return stored !== "false";
  } catch {
    return true;
  }
};

const loadNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: Notification[] = JSON.parse(stored);

    const now = Date.now();

    return parsed
      .filter(
        (notification) =>
          now - new Date(notification.createdAt).getTime() <
          NOTIFICATION_RETENTION_MS,
      )
      .slice(0, MAX_NOTIFICATIONS);
  } catch {
    return [];
  }
};

const saveNotifications = (notifications: Notification[]) => {
  try {
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(notifications),
    );
  } catch {
    // Notification persistence is optional.
  }
};

export const playNotificationTone = () => {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;

    const audioContext = new AudioContext();
    const now = audioContext.currentTime;

    const playNote = (
      frequency: number,
      start: number,
      duration: number,
      volume: number,
    ) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + start);

      gainNode.gain.setValueAtTime(0.0001, now + start);

      gainNode.gain.exponentialRampToValueAtTime(volume, now + start + 0.012);

      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        now + start + duration,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(now + start);
      oscillator.stop(now + start + duration);
    };

    // Main ascending digital chime

    playNote(659, 0.16, 0.13, 0.1);
    playNote(784, 0.24, 0.18, 0.11);

    // Subtle electronic sparkle on the final note
    playNote(1568, 0.24, 0.1, 0.025);

    setTimeout(() => {
      audioContext.close();
    }, 600);
  } catch {
    // Audio is optional; notification must still work.
  }
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: loadNotifications(),

  toneEnabled: loadToneEnabled(),

  toggleTone: () => {
    set((state) => {
      const enabled = !state.toneEnabled;

      try {
        localStorage.setItem(NOTIFICATION_TONE_KEY, String(enabled));
      } catch {
        // Tone preference persistence is optional.
      }

      return {
        toneEnabled: enabled,
      };
    });
  },

  /* =========================
       ADD
    ========================= */

  addNotification: (notification, playTone = true) => {
    const id = Date.now();

    const newNotification = {
      ...notification,

      id,

      createdAt: new Date().toISOString(),
    };

    set((state) => {
      if (playTone && state.toneEnabled) {
        playNotificationTone();
      }
      const updated = [newNotification, ...state.notifications].slice(
        0,
        MAX_NOTIFICATIONS,
      );

      saveNotifications(updated);

      return {
        notifications: updated,
      };
    });
  },

  /* =========================
       REMOVE
    ========================= */

  removeNotification: (id) => {
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);

      saveNotifications(updated);

      return {
        notifications: updated,
      };
    });
  },

  /* =========================
       CLEAR
    ========================= */

  clearNotifications: () => {
    saveNotifications([]);

    set({
      notifications: [],
    });
  },
}));
