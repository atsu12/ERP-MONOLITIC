import { create } from "zustand";

import toast from "react-hot-toast";

import { apiRequest } from "../services/api";

export interface Warehouse {
  id: number;
  name: string;
  code: string;
  location: string | null;
  status: string;
  created_at: string;
  products: number;
  quantity: number;
}

interface WarehouseState {
  warehouses: Warehouse[];

  loading: boolean;

  creating: boolean;

  updating: boolean;

  deletingIds: number[];

  fetchWarehouses: () => Promise<void>;

  createWarehouse: (data: {
    name: string;
    code: string;
    location?: string | null;
  }) => Promise<boolean>;

  updateWarehouse: (
    id: number,
    data: {
      name: string;
      code: string;
      location?: string | null;
      status: string;
    },
  ) => Promise<boolean>;

  deleteWarehouse: (id: number) => Promise<boolean>;

  setDeleting: (id: number, deleting: boolean) => void;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  warehouses: [],

  loading: false,

  creating: false,

  updating: false,

  deletingIds: [],

  fetchWarehouses: async () => {
    try {
      set({
        loading: true,
      });

      const data = await apiRequest("/warehouses", {
        auth: true,
      });

      set({
        warehouses: data.warehouses || [],
        loading: false,
      });
    } catch (error) {
      console.log(error);

      set({
        loading: false,
      });
    }
  },

  createWarehouse: async (warehouseData) => {
    try {
      set({
        creating: true,
      });

      await apiRequest("/warehouses", {
        method: "POST",
        auth: true,
        body: warehouseData,
      });

      await get().fetchWarehouses();

      set({
        creating: false,
      });

      toast.success("Warehouse created successfully");

      return true;
    } catch (error: any) {
      console.log(error);

      set({
        creating: false,
      });

      toast.error(
        error?.message || "Failed to create warehouse",
      );

      return false;
    }
  },

  updateWarehouse: async (id, warehouseData) => {
    try {
      set({
        updating: true,
      });

      await apiRequest(`/warehouses/${id}`, {
        method: "PUT",
        auth: true,
        body: warehouseData,
      });

      await get().fetchWarehouses();

      set({
        updating: false,
      });

      toast.success("Warehouse updated successfully");

      return true;
    } catch (error: any) {
      console.log(error);

      set({
        updating: false,
      });

      toast.error(
        error?.message || "Failed to update warehouse",
      );

      return false;
    }
  },

  setDeleting: (id, deleting) => {
    set((state) => ({
      deletingIds: deleting
        ? [...state.deletingIds, id]
        : state.deletingIds.filter((itemId) => itemId !== id),
    }));
  },

  deleteWarehouse: async (id) => {
    try {
      get().setDeleting(id, true);

      await apiRequest(`/warehouses/${id}`, {
        method: "DELETE",
        auth: true,
      });

      await get().fetchWarehouses();

      get().setDeleting(id, false);

      toast.success("Warehouse deleted successfully");

      return true;
    } catch (error: any) {
      console.log(error);

      get().setDeleting(id, false);

      toast.error(
        error?.message || "Failed to delete warehouse",
      );

      return false;
    }
  },
}));