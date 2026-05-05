"use client";

import { create } from "zustand";

type AnalyticsPeriod = "today" | "week" | "month";

interface AnalyticsState {
  period: AnalyticsPeriod;
  setPeriod: (period: AnalyticsPeriod) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  period: "today",
  setPeriod: (period) => set({ period }),
}));
