"use client";

import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
  id: string;
  phone: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (phone, password) => {
    try {
      const res = await api.login(phone, password);
      if (res.success && res.data) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, error: res.error?.message || "Login failed" };
    } catch {
      return { success: false, error: "Network error — is the API running?" };
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    }
    api.setToken(null);
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = api.getToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const res = await api.getProfile();
      if (res.success && res.data) {
        set({ user: res.data, isAuthenticated: true, isLoading: false });
      } else {
        // Token invalid/expired
        api.setToken(null);
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      // Network error — API might be down, but don't clear token
      // Show as not authenticated so user gets redirected to login
      set({ isLoading: false, isAuthenticated: false });
    }
  },
}));
