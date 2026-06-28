import {
  create
} from "zustand";

interface SearchState {

  searches:
    Record<string, string>;

  getSearch:
    (page: string) => string;

  setSearch:
    (
      page: string,
      value: string
    ) => void;

  clearSearch:
    (page: string) => void;

}

/* =========================
   LOAD SAVED SEARCHES
========================= */

const savedSearches =
  JSON.parse(
    localStorage.getItem(
      "erp-searches"
    ) || "{}"
  );

export const useSearchStore =
  create<SearchState>((set, get) => ({

    searches: savedSearches,

    /* =========================
       GET
    ========================= */

    getSearch:
      (page) => {

        return (
          get().searches[
            page
          ] || ""
        );

      },

    /* =========================
       SET
    ========================= */

    setSearch:
      (
        page,
        value
      ) => {

        const updated = {

          ...get().searches,

          [page]: value,

        };

        localStorage.setItem(
          "erp-searches",
          JSON.stringify(
            updated
          )
        );

        set({
          searches: updated
        });

      },

    /* =========================
       CLEAR
    ========================= */

    clearSearch:
      (page) => {

        const updated = {

          ...get().searches,

          [page]: "",

        };

        localStorage.setItem(
          "erp-searches",
          JSON.stringify(
            updated
          )
        );

        set({
          searches: updated
        });

      },

  }));