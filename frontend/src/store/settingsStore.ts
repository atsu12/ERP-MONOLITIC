import { create } from "zustand";

import { apiRequest } from "../services/api";

interface Settings {
  id?: number;
  display_currency: string;
  currency_symbol: string;
  usd_exchange_rate: number;
  company_multiplier: number;
}

interface SettingsStore {
  settings: Settings | null;

  loading: boolean;

  fetchSettings: () => Promise<void>;

  updateSettings: (data: Settings) => Promise<boolean>;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,

  loading: false,

  fetchSettings: async () => {
    try {
      set({ loading: true });

      const data = await apiRequest("/settings", {
        auth: true,
      });

      set({
        settings: data,
        loading: false,
      });
    } catch (error) {
      console.error(error);

      set({ loading: false });
    }
  },

  updateSettings: async (data) => {
    try {
      await apiRequest("/settings", {
        method: "PUT",
        auth: true,
        body: JSON.stringify(data),
      });

      const updatedSettings = await apiRequest("/settings", {
        auth: true,
      });

      set({
        settings: updatedSettings,
      });

      return true;
    } catch (error) {
      console.error(error);

      return false;
    }
  },
}));
