import { create } from "zustand";

import { apiRequest } from "../services/api";

interface Activity {
  id: number;

  user_id: number;

  username?: string;

  action: string;

  created_at: string;
}

interface ActivityState {
  activities: Activity[];

  loading: boolean;

  error: string;

  fetchActivities: () => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],

  loading: false,

  error: "",

  fetchActivities: async () => {
    try {
      set({
        loading: true,

        error: "",
      });

      const data = await apiRequest("/activity", {
        auth: true,
      });

      set({
        activities: data.logs || [],

        loading: false,
      });
    } catch (error) {
      console.log(error);

      set({
        loading: false,

        error:
          error instanceof Error ? error.message : "Failed to load activities",
      });
    }
  },
}));
