import {
  create
} from "zustand";

import {
  loginUser,
  logoutUser,
  getCurrentUser,
  isAuthenticated
} from "../services/authService";

interface AuthState {

  user: any;

  authenticated: boolean;

  loading: boolean;

  login: (
    username: string,
    password: string
  ) => Promise<void>;

  logout: () => void;

}

export const useAuthStore =
  create<AuthState>((set) => ({

    user:
      getCurrentUser(),

    authenticated:
      isAuthenticated(),

    loading: false,

    login: async (
      username,
      password
    ) => {

      try {

        set({
          loading: true
        });

        const user =
          await loginUser(
            username,
            password
          );

        set({

          user,

          authenticated: true,

          loading: false,

        });

      } catch (error) {

        set({
          loading: false
        });

        throw error;

      }

    },

    logout: () => {

      logoutUser();

      set({

        user: null,

        authenticated: false,

      });

    },

  }));
