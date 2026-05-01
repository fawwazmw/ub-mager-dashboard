"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Wifi, WifiOff, Radio } from "lucide-react";
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

interface DriverLocation {
  user_id: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
}

export default function LiveTrackingPage() {
  const [driverLocations, setDriverLocations] = useState<Map<string, DriverLocation>>(new Map());
  const [messageCount, setMessageCount] = useState(0);

  const handleMessage = useCallback((msg: any) => {
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
        <div className="flex items-center gap-4">
          {/* WS Messages counter */}
          <div className="text-xs text-muted-foreground tabular-nums">
            {messageCount > 0 && `${messageCount} updates`}
          </div>

          {/* Connection status */}
          <div className={clsx("flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-border", statusColor)}>
            <StatusIcon size={14} className={status === "connected" ? "animate-pulse" : ""} />
            {statusLabel}
          </div>
        </div>
      </div>

      <LiveMap wsDriverLocations={driverLocations} />
    </div>
  );
}
