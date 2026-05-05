"use client";

import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/constants";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark",

  toggleTheme: () => {
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
        localStorage.setItem(STORAGE_KEYS.THEME, next);
      }
      return { theme: next };
    });
  },

  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }
    set({ theme });
  },
}));

// Initialize theme from localStorage on load
if (typeof window !== "undefined") {
  const saved = localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
  const theme = saved || "dark";
  document.documentElement.classList.toggle("dark", theme === "dark");
  useThemeStore.setState({ theme });
}
