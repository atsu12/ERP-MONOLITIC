import {
  create
} from "zustand";

import {
  apiRequest
} from "../services/api";

interface Movement {

  id: number;

  product_name: string;

  type: string;

  quantity: number;

  user_id: number;

  created_at: string;

}

interface MovementState {

  movements: Movement[];

  loading: boolean;

  error: string;

  fetchMovements:
    () => Promise<void>;

}

export const useMovementStore =
  create<MovementState>((set) => ({

    movements: [],

    loading: false,

    error: "",

    /* =========================
       FETCH MOVEMENTS
    ========================= */

    fetchMovements:
      async () => {

        try {

          set({

            loading: true,

            error: "",

          });

          const data =
            await apiRequest(
              "/movements",
              {
                auth: true,
              }
            );

          set({

            movements:
              data.movements || [],

            loading: false,

          });

        } catch (error) {

          console.log(error);

          set({

            loading: false,

            error:
              error instanceof Error
                ? error.message
                : "Failed to load movements",

          });

        }

      },

  }));