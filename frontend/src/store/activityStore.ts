import {
  create
} from "zustand";

import {
  apiRequest
} from "../services/api";

interface ActivityState {

  activities: any[];

  loading: boolean;

  error: string;

  fetchActivities:
    () => Promise<void>;

}

export const useActivityStore =
  create<ActivityState>((set) => ({

    activities: [],

    loading: false,

    error: "",

    fetchActivities:
      async () => {

        try {

          set({

            loading: true,

            error: "",

          });

          const data =
            await apiRequest(
              "/activity",
              {
                auth: true,
              }
            );

          set({

            activities:
              data.activities || [],

            loading: false,

          });

        } catch (error) {

          console.log(error);

          set({

            loading: false,

            error:
              error instanceof Error
                ? error.message
                : "Failed to load activities",

          });

        }

      },

  }));