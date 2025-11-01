import axios from "axios";
import { create } from "zustand";
import { type User } from "../../../schemas/users";
import { setSession } from "../services/jwt.service";

const useAuthStore = create<{
  user: User | null;
  authLoading: boolean;
  tokenLoading: boolean;
  setUser: (args: User) => void;
  logoutService: () => void;
  loginService: (unit: string, password: string) => void;
}>((set, get) => ({
  user: null,
  authLoading: false,
  tokenLoading: true,
  setUser: (args) => set({ user: args }),
  logoutService: () => {
    setSession(null);
    set({ user: null, authLoading: false, tokenLoading: false });
  },
  loginService: async (unit, password) => {
    set({ authLoading: true });
    try {
      const res = await axios.post(`http://localhost:3333/api/v0/user/login`, {
        unit,
        password,
      });
      if (res.data.result?.user && res.data.result?.token) {
        setSession(res.data.result?.token);
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
      const res = await axios.post(
        `https://millenium-issue-tracker-production.up.railway.app/api/v0/user/validation`
      );
      if (res.data.result?.user && res.data.result?.token) {
        setSession(res.data.result?.token);
        set({ user: res.data.result?.user, tokenLoading: false });
      } else {
        set({ tokenLoading: false, user: null });
      }
    } catch (err) {
      console.log(err);
      get().logoutService();
    }
  },
}));

export default useAuthStore;
