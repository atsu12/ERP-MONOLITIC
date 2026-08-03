import { create } from "zustand";

import { apiRequest } from "../services/api";

interface Settings {
  id?: number;

  // Templates

  quotation_template_path?: string;

  purchase_order_template_path?: string;

  delivery_note_template_path?: string;

  // Currency & Pricing
  display_currency: string;
  currency_symbol: string;
  usd_exchange_rate: number;
  company_multiplier: number;

  // Company Information
  company_name: string | null;
  company_address: string | null;
  company_phone: string | null;
  company_email: string | null;
  company_website: string | null;
  company_vat: string | null;

  // Branding
  company_logo_path: string | null;
  company_header: string | null;
  company_footer: string | null;

  // Invoice Numbering
  invoice_prefix: string;
  invoice_next_number: number;
  invoice_number_length: number;

  // Templates
  invoice_template_path: string | null;
}

interface SettingsStore {
  settings: Settings | null;

  loading: boolean;

  fetchSettings: () => Promise<void>;

  updateSettings: (data: Partial<Settings>) => Promise<boolean>;
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
