import { create } from "zustand";

import { apiRequest } from "../services/api";

interface FastMovingProduct {
  id: number;
  name: string;
  totalOut: number;
}

interface RecentMovement {
  id: number;
  product_name: string;
  type: string;
  quantity: number;
  created_at: string;
}

interface InventoryValuation {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
  inventoryValue: number;
}

interface ReportFilters {
  period?: string;

  warehouse?: string;

  category?: string;

  brand?: string;

  search?: string;

  productType?: "SERIALIZED" | "STANDARD";

  lowStock?: boolean;

  outOfStock?: boolean;

  fromDate?: string;

  toDate?: string;
}

interface ReportState {
  totalProducts: number;
  totalQuantity: number;
  inventoryValue: number;
  stockIn: number;
  stockOut: number;
  lowStockProducts: number;

  fastMovingProducts: FastMovingProduct[];

  slowMovingProducts: FastMovingProduct[];

  recentMovements: RecentMovement[];

  inventoryValuation: InventoryValuation[];

  loading: boolean;

  fetchDashboard: (filters?: ReportFilters) => Promise<void>;

  fetchInventoryValuation: (filters?: ReportFilters) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  totalProducts: 0,

  totalQuantity: 0,

  inventoryValue: 0,

  stockIn: 0,

  stockOut: 0,

  lowStockProducts: 0,

  fastMovingProducts: [],

  slowMovingProducts: [],

  recentMovements: [],
  inventoryValuation: [],

  loading: false,

  fetchDashboard: async (filters = {}) => {
    try {
      set({
        loading: true,
      });

      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const endpoint =
        params.toString().length > 0
          ? `/reports/dashboard?${params.toString()}`
          : "/reports/dashboard";

      const data = await apiRequest(endpoint, {
        auth: true,
      });

      set({
        totalProducts: data.totalProducts || 0,

        totalQuantity: data.totalQuantity || 0,

        inventoryValue: data.inventoryValue || 0,

        stockIn: data.stockIn || 0,

        stockOut: data.stockOut || 0,

        lowStockProducts: data.lowStockProducts || 0,

        fastMovingProducts: data.fastMovingProducts || [],

        slowMovingProducts: data.slowMovingProducts || [],

        recentMovements: data.recentMovements || [],

        loading: false,
      });
    } catch (error) {
      console.log(error);

      set({
        loading: false,
      });
    }
  },

  fetchInventoryValuation: async (filters = {}) => {
    try {
      set({
        loading: true,
      });

      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const endpoint =
        params.toString().length > 0
          ? `/reports/inventory?${params.toString()}`
          : "/reports/inventory";

      const data = await apiRequest(endpoint, {
        auth: true,
      });

      set({
        inventoryValuation: data,
        loading: false,
      });
    } catch (error) {
      console.log(error);

      set({
        loading: false,
      });
    }
  },
}));
