"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";

export function useRevenueStats(period: string) {
  return useQuery({
    queryKey: ["revenue-stats", period],
    queryFn: () => api.getRevenueStats(period).then(unwrap),
    staleTime: 60_000,
  });
}

export function useRideStats(period: string) {
  return useQuery({
    queryKey: ["ride-stats", period],
    queryFn: () => api.getRideStats(period).then(unwrap),
    staleTime: 30_000,
  });
}

export function useDailyRevenue(days: number) {
  return useQuery({
    queryKey: ["daily-revenue", days],
    queryFn: () => api.getDailyRevenue(days).then(unwrap),
    staleTime: 60_000,
  });
}

export function usePeakHours(days: number) {
  return useQuery({
    queryKey: ["peak-hours", days],
    queryFn: () => api.getPeakHours(days).then(unwrap),
    staleTime: 60_000,
  });
}

export function useDriverLeaderboard(limit: number) {
  return useQuery({
    queryKey: ["driver-leaderboard", limit],
    queryFn: () => api.getDriverLeaderboard(limit).then(unwrap),
    staleTime: 60_000,
  });
}

export function useDrivers(page: number, perPage: number, filter: string, search: string) {
  return useQuery({
    queryKey: ["drivers", page, perPage, filter, search],
    queryFn: () => api.getDrivers(page, perPage, filter, search).then(unwrap),
    staleTime: 15_000,
  });
}

export function useDriverRides(driverId: string | null, limit: number) {
  return useQuery({
    queryKey: ["driver-rides", driverId, limit],
    queryFn: () => api.getDriverRides(driverId!, limit).then(unwrap),
    enabled: !!driverId,
    staleTime: 30_000,
  });
}

export function useRideDetail(rideId: string) {
  return useQuery({
    queryKey: ["ride-detail", rideId],
    queryFn: () => api.getAdminRideDetail(rideId).then(unwrap),
    enabled: !!rideId,
  });
}

export function useRideCountsByStatus() {
  return useQuery({
    queryKey: ["ride-counts-by-status"],
    queryFn: () => api.getRideCountsByStatus().then(unwrap),
    staleTime: 15_000,
  });
}

export function useAdminRides(page: number, perPage: number, status: string, search: string) {
  return useQuery({
    queryKey: ["admin-rides", page, perPage, status, search],
    queryFn: async () => {
      const res = await api.getAdminRides(page, perPage, status, search);
      if (!res.success) throw new Error(res.error?.message || "Failed");
      return { data: res.data || [], meta: res.meta };
    },
    staleTime: 15_000,
  });
}

export function useRecentActivity(limit: number) {
  return useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: () => api.getRecentActivity(limit).then(unwrap),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}
