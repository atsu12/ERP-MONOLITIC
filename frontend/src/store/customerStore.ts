import { create } from "zustand";

import { apiRequest } from "../services/api";

export interface Customer {
  id: number;
  customer_name: string;
  contact: string | null;
  contact_person: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

interface CustomerState {
  customers: Customer[];
  loading: boolean;

  fetchCustomers: () => Promise<void>;

  getCustomerById: (id: number) => Promise<Customer | null>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],

  loading: false,

  fetchCustomers: async () => {
    try {
      set({
        loading: true,
      });

      const data = await apiRequest("/customers", {
        auth: true,
      });

      set({
        customers: data.customers || [],
        loading: false,
      });
    } catch (error) {
      console.log(error);

      set({
        loading: false,
      });
    }
  },

  getCustomerById: async (id) => {
    try {
      const data = await apiRequest(`/customers/${id}`, {
        auth: true,
      });

      return data.customer || null;
    } catch (error) {
      console.log(error);

      return null;
    }
  },
}));
