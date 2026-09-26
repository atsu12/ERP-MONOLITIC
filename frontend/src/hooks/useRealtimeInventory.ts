import { useEffect } from "react";

import { socket } from "../socket/socket";

import { useProductStore } from "../store/productStore";
import { useMovementStore } from "../store/movementStore";
import { useActivityStore } from "../store/activityStore";

import { useNotificationStore } from "../store/notificationStore";

export function useRealtimeInventory() {
  const fetchProducts = useProductStore(
    (state) => state.fetchProducts,
  );

  const fetchMovements = useMovementStore(
    (state) => state.fetchMovements,
  );

  const fetchActivities = useActivityStore(
    (state) => state.fetchActivities,
  );

  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    socket.connect();

    const refreshERPData = async () => {
      await Promise.all([
        fetchProducts(),
        fetchMovements(),
        fetchActivities(),
      ]);
    };

    socket.on("dispatch-updated", async (data: { reference?: string }) => {
      await refreshERPData();

      addNotification({
        type: "info",
        title: "Dispatch Updated",
        message: `Dispatch ${data.reference} was updated.`,
      });
    });

    socket.on("dispatch-paid", async (data: { reference?: string }) => {
      await refreshERPData();

      addNotification({
        type: "success",
        title: "Payment Confirmed",
        message: `Payment confirmed for dispatch ${data.reference}.`,
      });
    });

    socket.on("dispatch-completed", async (data: { reference?: string }) => {
      await refreshERPData();

      addNotification({
        type: "success",
        title: "Dispatch Completed",
        message: `Dispatch ${data.reference} has been completed.`,
      });
    });

    return () => {
      socket.off("dispatch-updated");
      socket.off("dispatch-paid");
      socket.off("dispatch-completed");

      socket.disconnect();
    };
  }, []);
}
