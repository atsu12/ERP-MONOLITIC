import { create } from "zustand";

import { apiRequest } from "../services/api";

interface Activity {
  id: number;

  user_id: number;

  username?: string;

  action: string;

  created_at: string;
}

interface ActivityFilters {
  fromDate?: string;

  toDate?: string;
}

interface ActivityState {
  activities: Activity[];

  loading: boolean;

  error: string;

  fetchActivities: (filters?: ActivityFilters) => Promise<void>;
}

export const useActivityStore = create<ActivityState>((set) => ({
  activities: [],

  loading: false,

  error: "",

  fetchActivities: async (filters = {}) => {
    try {
      set({
        loading: true,

        error: "",
      });

      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const endpoint =
        params.toString().length > 0
          ? `/activity?${params.toString()}`
          : "/activity";

      const data = await apiRequest(endpoint, {
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