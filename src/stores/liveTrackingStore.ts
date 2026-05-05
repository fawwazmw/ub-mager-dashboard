"use client";

import { create } from "zustand";
import type { DriverLocation } from "@/lib/types";

interface TimestampedDriverLocation extends DriverLocation {
  updated_at: number;
}

interface LiveTrackingState {
  drivers: Map<string, TimestampedDriverLocation>;
  updateDriver: (location: DriverLocation) => void;
  removeDriver: (userId: string) => void;
  clear: () => void;
}

export const useLiveTrackingStore = create<LiveTrackingState>((set) => ({
  drivers: new Map(),

  updateDriver: (location) => {
    set((state) => {
      const next = new Map(state.drivers);
      next.set(location.user_id, { ...location, updated_at: Date.now() });
      return { drivers: next };
    });
  },

  removeDriver: (userId) => {
    set((state) => {
      const next = new Map(state.drivers);
      next.delete(userId);
      return { drivers: next };
    });
  },

  clear: () => set({ drivers: new Map() }),
}));
