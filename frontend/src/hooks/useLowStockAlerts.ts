import { useEffect, useRef } from "react";

import { useProductStore } from "../store/productStore";

import {
  playNotificationTone,
  useNotificationStore,
} from "../store/notificationStore";

export function useLowStockAlerts() {
  const products = useProductStore((state) => state.products);

  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  /* =========================
     TRACK ALERTED PRODUCTS
  ========================= */

  const alertedProducts = useRef<Set<number>>(new Set());

  useEffect(() => {
    /* =========================
       LOW STOCK CHECK
    ========================= */

    const lowStockProducts = products.filter(
      (product) => !product.track_serial && Number(product.quantity) <= 5,
    );

    let addedLowStockNotification = false;

    lowStockProducts.forEach((product) => {
      // PREVENT DUPLICATES

      if (alertedProducts.current.has(product.id)) {
        return;
      }

      alertedProducts.current.add(product.id);

      addNotification(
        {
          type: "warning",
          title: "Low Stock Alert",
          message: `${product.name} inventory is running low (${product.quantity} remaining).`,
        },
        false,
      );

      addedLowStockNotification = true;
    });

    /* =========================
       PLAY ONE TONE FOR BATCH
    ========================= */

    if (addedLowStockNotification) {
      playNotificationTone();
    }

    /* =========================
       RESET IF STOCK RECOVERS
    ========================= */

    products.forEach((product) => {
      if (Number(product.quantity) > 5) {
        alertedProducts.current.delete(product.id);
      }
    });
  }, [products]);
}