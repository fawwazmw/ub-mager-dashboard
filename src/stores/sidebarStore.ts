"use client";

import { create } from "zustand";
import { STORAGE_KEYS } from "@/lib/constants";

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (value: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true" : false,

  toggle: () => {
    set((state) => {
      const next = !state.collapsed;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      return { collapsed: next };
    });
  },

  setCollapsed: (value) => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(value));
    set({ collapsed: value });
  },
}));
