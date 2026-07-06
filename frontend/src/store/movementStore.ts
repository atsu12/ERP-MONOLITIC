import { create } from "zustand";

import { apiRequest } from "../services/api";

interface Movement {
  id: number;

  product_id: number;

  product_name: string;

  serial_number: string | null;

  type: string;

  quantity: number;

  reference: string | null;

  user_id: number | null;

  username: string | null;

  created_at: string;

  updated_at: string;
}

interface MovementState {
  movements: Movement[];

  loading: boolean;

  error: string;

  fetchMovements: () => Promise<void>;
}

export const useMovementStore = create<MovementState>((set) => ({
  movements: [],

  loading: false,

  error: "",

  /* =========================
       FETCH MOVEMENTS
    ========================= */

  fetchMovements: async () => {
    try {
      set({
        loading: true,

        error: "",
      });

      const data = await apiRequest("/movements", {
        auth: true,
      });

      set({
        movements: data.movements || [],

        loading: false,
      });
    } catch (error) {
      console.log(error);

      set({
        loading: false,

        error:
          error instanceof Error ? error.message : "Failed to load movements",
      });
    }
  },
}));
