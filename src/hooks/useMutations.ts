"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";

export function useVerifyDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (driverId: string) => api.verifyDriver(driverId).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useBulkVerifyDrivers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (driverIds: string[]) => {
      let success = 0;
      for (const id of driverIds) {
        const res = await api.verifyDriver(id);
        if (res.success) success++;
      }
      return success;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useToggleDriverOnline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, isOnline }: { driverId: string; isOnline: boolean }) =>
      api.toggleDriverOnline(driverId, isOnline).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useAdminCancelRide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rideId, reason }: { rideId: string; reason?: string }) =>
      api.adminCancelRide(rideId, reason).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rides"] });
      queryClient.invalidateQueries({ queryKey: ["ride-detail"] });
      queryClient.invalidateQueries({ queryKey: ["ride-counts-by-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

export function useBulkCancelStuckRides() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.bulkCancelStuckRides().then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rides"] });
      queryClient.invalidateQueries({ queryKey: ["ride-counts-by-status"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
