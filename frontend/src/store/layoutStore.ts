import { create } from "zustand";

interface LayoutStore {
  sidebarCollapsed: boolean;

  toggleSidebar: () => void;
}

export const useLayoutStore =
  create<LayoutStore>((set) => ({
    sidebarCollapsed: false,

    toggleSidebar: () =>
      set((state) => ({
        sidebarCollapsed:
          !state.sidebarCollapsed,
      })),
  }));
