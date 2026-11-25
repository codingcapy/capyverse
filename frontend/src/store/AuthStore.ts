import { create } from "zustand";
import { type PublicUser } from "@server/schemas/users";
import { API_BASE, refreshSession, setSession } from "../services/jwt.service";

const useAuthStore = create<{
  user: PublicUser | null;
  authLoading: boolean;
  tokenLoading: boolean;
  setUser: (args: PublicUser) => void;
  logoutService: () => Promise<void>;
  loginService: (email: string, password: string) => Promise<void>;
  loginWithToken: () => Promise<void>;
}>((set) => ({
  user: null,
  authLoading: false,
  tokenLoading: true,
  setUser: (args) => set({ user: args }),
  logoutService: async () => {
    setSession(null);
    set({ user: null, authLoading: false, tokenLoading: false });
    try {
      await fetch(`${API_BASE}/api/v0/user/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.log(err);
    }
  },
  loginService: async (email, password) => {
    set({ authLoading: true });
    try {
      const res = await fetch(`${API_BASE}/api/v0/user/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.result?.user && data.result?.token) {
        setSession(data.result.token);
        set({ user: data.result.user, authLoading: false });
      } else {
        set({ authLoading: false, user: null });
      }
    } catch (err) {
      console.log(err);
      set({ authLoading: false });
    }
  },
  loginWithToken: async () => {
    const result = await refreshSession();
    if (result) {
      set({ user: result.user, tokenLoading: false });
    } else {
      setSession(null);
      set({ user: null, tokenLoading: false });
    }
  },
}));

export default useAuthStore;
