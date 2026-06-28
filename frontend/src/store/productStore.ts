import {
  create
} from "zustand";

import toast from "react-hot-toast";

import {
  apiRequest
} from "../services/api";

interface Product {

  id: number;

  name: string;

  brand: string;

  category?: string;

  quantity: number;

  track_serial: boolean;

  price?: number;

}

interface ProductState {

  products: Product[];

  loading: boolean;

  creating: boolean;

  updating: boolean;

  deletingIds: number[];

  fetchProducts:
  (search?: string) => Promise<void>;

  createProduct:
    (
      data: any
    ) => Promise<boolean>;

    updateProduct:
  (
    id: number,
    data: any
  ) => Promise<boolean>;

  setDeleting:
    (
      id: number,
      deleting: boolean
    ) => void;

  deleteProduct:
    (
      id: number
    ) => Promise<boolean>;

}

export const useProductStore =
  create<ProductState>((set, get) => ({

    products: [],

    loading: false,

    creating: false,

    updating: false,

    deletingIds: [],

    fetchProducts:
  async (search = "") => {

    try {

      set({
        loading: true
      });

      const endpoint =
        search.trim()

          ? `/products?search=${encodeURIComponent(search)}`

          : "/products";

      const data =
        await apiRequest(
          endpoint,
          {
            auth: true,
          }
        );

      set({

        products:
          data.products || [],

        loading: false,

      });

    } catch (error) {

      console.log(error);

      set({
        loading: false
      });

    }

  },

    createProduct:
      async (productData) => {

        try {

          set({
            creating: true
          });

          await apiRequest(
            "/products",
            {
              method: "POST",

              auth: true,

              body: productData,
            }
          );

          await get().fetchProducts();

          set({
            creating: false
          });

          toast.success(
            "Product created successfully"
          );

          return true;

        } catch (error: any) {

          console.log(error);

          set({
            creating: false
          });

          toast.error(
            error?.message ||
            "Failed to create product"
          );

          return false;

        }

      },

          updateProduct:
      async (
        id,
        productData
      ) => {

        try {

          set({
            updating: true
          });

          await apiRequest(
            `/products/${id}`,
            {
              method: "PUT",

              auth: true,

              body: productData,
            }
          );

          await get().fetchProducts();

          set({
            updating: false
          });

          toast.success(
            "Product updated successfully"
          );

          return true;

        } catch (error: any) {

          console.log(error);

          set({
            updating: false
          });

          toast.error(
            error?.message ||
            "Failed to update product"
          );

          return false;

        }

      },

    setDeleting:
      (
        id,
        deleting
      ) => {

        set((state) => ({

          deletingIds:
            deleting

              ? [
                  ...state.deletingIds,
                  id
                ]

              : state.deletingIds.filter(
                  (itemId) =>
                    itemId !== id
                ),

        }));

      },

    deleteProduct:
      async (id) => {

        try {

          get().setDeleting(
            id,
            true
          );

          await apiRequest(
            `/products/${id}`,
            {
              method: "DELETE",

              auth: true,
            }
          );

          set((state) => ({

            products:
              state.products.filter(
                (p) =>
                  p.id !== id
              ),

          }));

          get().setDeleting(
            id,
            false
          );

          toast.success(
            "Product deleted successfully"
          );

          return true;

        } catch (error) {

          console.log(error);

          get().setDeleting(
            id,
            false
          );

          toast.error(
            "Failed to delete product"
          );

          return false;

        }

      },

    }));
