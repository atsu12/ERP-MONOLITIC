import {
  useEffect
} from "react";

import {
  socket
} from "../socket/socket";

import {
  useProductStore
} from "../store/productStore";

import {
  useMovementStore
} from "../store/movementStore";

import {
  useActivityStore
} from "../store/activityStore";

import {
  useNotificationStore
} from "../store/notificationStore";

export function useRealtimeInventory() {

  /* =========================
     PRODUCT STORE
  ========================= */

  const fetchProducts =
    useProductStore(
      (state) =>
        state.fetchProducts
    );

  /* =========================
     MOVEMENT STORE
  ========================= */

  const fetchMovements =
    useMovementStore(
      (state) =>
        state.fetchMovements
    );

  /* =========================
     ACTIVITY STORE
  ========================= */

  const fetchActivities =
    useActivityStore(
      (state) =>
        state.fetchActivities
    );

  /* =========================
     NOTIFICATIONS
  ========================= */

  const addNotification =
    useNotificationStore(
      (state) =>
        state.addNotification
    );

  useEffect(() => {

    /* =========================
       CONNECT SOCKET
    ========================= */

    socket.connect();

    /* =========================
       REFRESH ALL ERP DATA
    ========================= */

    const refreshERPData =
      async () => {

        await Promise.all([

          fetchProducts(),

          fetchMovements(),

          fetchActivities(),

        ]);

      };

    /* =========================
       PRODUCT CREATED
    ========================= */

    socket.on(
      "product-created",
      async () => {

        await refreshERPData();

        addNotification({

          type: "success",

          title:
            "New Product Added",

          message:
            "Inventory catalog updated successfully.",

        });

      }
    );

    /* =========================
       PRODUCT DELETED
    ========================= */

    socket.on(
      "product-deleted",
      async () => {

        await refreshERPData();

        addNotification({

          type: "warning",

          title:
            "Product Removed",

          message:
            "An inventory product was deleted.",

        });

      }
    );

    /* =========================
       PRODUCT UPDATED
    ========================= */

    socket.on(
      "product-updated",
      async () => {

        await refreshERPData();

        addNotification({

          type: "info",

          title:
            "Inventory Updated",

          message:
            "Stock levels or serial inventory changed.",

        });

      }
    );

    /* =========================
       CLEANUP
    ========================= */

    return () => {

      socket.off(
        "product-created"
      );

      socket.off(
        "product-deleted"
      );

      socket.off(
        "product-updated"
      );

      socket.disconnect();

    };

  }, []);

}