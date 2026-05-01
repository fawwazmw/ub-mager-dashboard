"use client";

import dynamic from "next/dynamic";

const LiveMap = dynamic(() => import("@/components/map/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-8rem)] bg-card border border-border rounded-xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  ),
});

export default function LiveTrackingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Live Tracking</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time driver positions on map</p>
      </div>
      <LiveMap />
    </div>
  );
}
