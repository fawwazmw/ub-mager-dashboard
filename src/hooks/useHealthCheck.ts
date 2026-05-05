"use client";

import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api";

export interface HealthStatus {
  status: "healthy" | "unhealthy" | "checking";
  latency: number | null;
  version?: string;
  time?: string;
}

async function checkApiHealth(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
    const latency = Date.now() - start;
    if (!res.ok) {
      return { status: "unhealthy", latency };
    }
    const data = await res.json();
    return {
      status: "healthy",
      latency,
      version: data.version,
      time: data.time,
    };
  } catch {
    return { status: "unhealthy", latency: Date.now() - start };
  }
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ["health-check"],
    queryFn: checkApiHealth,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}
