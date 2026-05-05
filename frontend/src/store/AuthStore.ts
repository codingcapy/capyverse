import axios from "axios";
import { create } from "zustand";
import { type PublicUser } from "../../../schemas/users";

axios.defaults.withCredentials = true;

const BASE_URL = "https://capyverse.up.railway.app";

const useAuthStore = create<{
  user: PublicUser | null;
  authLoading: boolean;
  tokenLoading: boolean;
  setUser: (args: PublicUser) => void;
  logoutService: () => Promise<void>;
  loginService: (email: string, password: string) => void;
}>((set, get) => ({
  user: null,
  authLoading: false,
  tokenLoading: true,
  setUser: (args) => set({ user: args }),
  logoutService: async () => {
    try {
      await axios.post(`${BASE_URL}/api/v0/user/logout`);
    } catch {
      // ignore — clear local state regardless
    }
    set({ user: null, authLoading: false, tokenLoading: false });
  },
  loginService: async (email, password) => {
    set({ authLoading: true });
    try {
      const res = await axios.post(`${BASE_URL}/api/v0/user/login`, {
        email,
        password,
      });
      if (res.data.result?.user) {
        set({ user: res.data.result?.user, authLoading: false });
      } else {
        set({ authLoading: false, user: null });
      }
    } catch (err) {
      console.log(err);
      set({ authLoading: false });
    }
  },
  loginWithToken: async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/v0/user/validation`);
      if (res.data.result?.user) {
        set({ user: res.data.result?.user, tokenLoading: false });
      } else {
        set({ tokenLoading: false, user: null });
      }
    } catch {
      // Validation failed (no cookie / expired) — just mark as not logged in
      set({ tokenLoading: false, user: null });
    }
  },
}));

export default useAuthStore;
