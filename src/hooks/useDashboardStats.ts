"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.getDashboardStats().then(unwrap),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}
