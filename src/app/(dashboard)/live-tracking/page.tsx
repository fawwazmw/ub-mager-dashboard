"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { api } from "@/lib/api";
import type { DriverListItem, DriverLocation } from "@/lib/types";
import { Wifi, WifiOff, Radio, Users, Car, Activity, ChevronRight, ChevronLeft } from "lucide-react";
import { clsx } from "clsx";

const LiveMap = dynamic(() => import("@/components/map/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-12rem)] bg-card border border-border rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

export default function LiveTrackingPage() {
  usePageTitle("Live Tracking");
  const [driverLocations, setDriverLocations] = useState<Map<string, DriverLocation>>(new Map());
  const [messageCount, setMessageCount] = useState(0);
  const [mapFilter, setMapFilter] = useState<"all" | "online" | "offline">("all");
  const [showDriverList, setShowDriverList] = useState(false);

  const { data: statsData, dataUpdatedAt } = useDashboardStats();
  const liveStats = {
    online: statsData?.online_drivers ?? 0,
    total: statsData?.total_drivers ?? 0,
    active_rides: statsData?.active_rides ?? 0,
  };
  const lastSync = dataUpdatedAt ? new Date(dataUpdatedAt) : null;

  const { data: driverList = [] } = useQuery({
    queryKey: ["drivers-list-tracking", 1, 50],
    queryFn: async () => {
      const res = await api.getDrivers(1, 50, "");
      if (!res.success || !res.data) return [];
      return res.data;
    },
    refetchInterval: 15_000,
  });

  const handleMessage = useCallback((msg: { type: string; payload?: unknown; target_user_id?: string }) => {
    if (msg.type === "LOCATION_UPDATE" && msg.payload) {
      const payload = typeof msg.payload === "string" ? JSON.parse(msg.payload) : msg.payload;
      setDriverLocations((prev) => {
        const next = new Map(prev);
        next.set(payload.user_id || msg.target_user_id, payload);
        return next;
      });
      setMessageCount((c) => c + 1);
    }
  }, []);

  const { status } = useWebSocket({ onMessage: handleMessage });

  const statusConfig = {
    connected: { icon: Wifi, label: "Live", color: "text-green-400" },
    connecting: { icon: Radio, label: "Connecting...", color: "text-yellow-400" },
    reconnecting: { icon: Radio, label: "Reconnecting...", color: "text-yellow-400" },
    disconnected: { icon: WifiOff, label: "Disconnected", color: "text-muted-foreground" },
  };

  const { icon: StatusIcon, label: statusLabel, color: statusColor } = statusConfig[status];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Tracking</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time driver positions</p>
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-[10px] text-muted-foreground tabular-nums hidden sm:inline">
              Synced {lastSync.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          {messageCount > 0 && (
            <span className="text-[10px] text-muted-foreground tabular-nums bg-muted px-2 py-0.5 rounded">
              {messageCount} ws
            </span>
          )}
          <div className={clsx("flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-border", statusColor)}>
            <StatusIcon size={14} className={status === "connected" ? "animate-pulse" : ""} />
            {statusLabel}
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
          <Activity size={16} className="text-green-400" />
          <div>
            <p className="text-lg font-bold tabular-nums">{liveStats.online}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Online Drivers</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
          <Car size={16} className="text-blue-400" />
          <div>
            <p className="text-lg font-bold tabular-nums">{liveStats.total}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Total Drivers</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
          <Users size={16} className="text-warning" />
          <div>
            <p className="text-lg font-bold tabular-nums">{liveStats.active_rides}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Active Rides</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 mb-3">
        {(["all", "online", "offline"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setMapFilter(f)}
            className={clsx(
              "px-2.5 py-1.5 text-xs rounded-lg border transition-colors capitalize",
              mapFilter === f
                ? "bg-primary/10 border-primary/20 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <LiveMap wsDriverLocations={driverLocations} filter={mapFilter} />
          <button
            onClick={() => setShowDriverList(!showDriverList)}
            className="absolute top-3 right-3 z-[1000] bg-card/90 backdrop-blur border border-border rounded-lg p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDriverList ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {showDriverList && (
          <div className="w-72 bg-card border border-border rounded-xl overflow-hidden shrink-0 h-[calc(100vh-12rem)]">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-medium">Drivers ({driverList.length})</span>
              <span className="text-[10px] text-muted-foreground">{driverList.filter((d) => d.is_online).length} online</span>
            </div>
            <div className="overflow-y-auto h-[calc(100%-40px)]">
              {driverList
                .filter((d) => mapFilter === "all" || (mapFilter === "online" ? d.is_online : !d.is_online))
                .map((driver) => (
                <div key={driver.id} className="px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={clsx("w-2 h-2 rounded-full shrink-0", driver.is_online ? "bg-green-400" : "bg-muted-foreground/40")} />
                    <span className="text-xs font-medium truncate">{driver.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 ml-4">
                    <span className="text-[10px] text-muted-foreground">{driver.vehicle_type}</span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{driver.license_plate}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-4">
                    <span className="text-[10px] text-muted-foreground">⭐ {driver.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-muted-foreground">{driver.total_trips} trips</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
