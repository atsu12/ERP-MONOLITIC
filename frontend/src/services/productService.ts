import {
  apiRequest
} from "./api";

// GET PRODUCTS

export async function getProducts() {

  const data =
    await apiRequest(
      "/products"
    );

  return data.products || [];

}

// CREATE PRODUCT

export async function createProduct(
  productData: any
) {

  return await apiRequest(
    "/products",
    {
      method: "POST",

      auth: true,

      body: productData,
    }
  );

}

// DELETE PRODUCT

export async function deleteProduct(
  productId: number
) {

  return await apiRequest(
    `/products/${productId}`,
    {
      method: "DELETE",

      auth: true,
    }
  );

}

// GET PRODUCT ITEMS

export async function getProductItems(
  productId: number
) {

  const data =
    await apiRequest(
      `/products/${productId}/items`,
      {
        auth: true,
      }
    );

  return data.items || [];

}
