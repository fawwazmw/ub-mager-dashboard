"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "@/lib/api";
import type { DriverListItem } from "@/lib/types";

const onlineIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Gray marker for offline drivers
const offlineIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

interface DriverLocation {
  user_id: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
}

interface LiveMapProps {
  wsDriverLocations?: Map<string, DriverLocation>;
  filter?: "all" | "online" | "offline";
}

export default function LiveMap({ wsDriverLocations, filter = "all" }: LiveMapProps) {
  const { data: drivers = [] } = useQuery({
    queryKey: ["drivers-map", 1, 100],
    queryFn: async () => {
      const res = await api.getDrivers(1, 100, "");
      if (!res.success || !res.data) return [];
      return res.data;
    },
    refetchInterval: 10_000,
  });

  const onlineCount = useMemo(() => drivers.filter((d) => d.is_online).length, [drivers]);

  // Generate deterministic positions for drivers (demo mode)
  // In production, use actual lat/lng from driver profile or WS updates
  function getDriverPosition(driver: DriverListItem): [number, number] {
    // Check if we have a real-time WS position
    if (wsDriverLocations?.has(driver.id)) {
      const loc = wsDriverLocations.get(driver.id)!;
      return [loc.lat, loc.lng];
    }

    // Fallback: deterministic position around Malang based on driver ID
    const hash = driver.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const lat = -7.9526 + ((hash % 80) - 40) * 0.0008;
    const lng = 112.6060 + ((hash * 7) % 80 - 40) * 0.0008;
    return [lat, lng];
  }

  return (
    <div className="relative">
      {/* Stats overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-card/90 backdrop-blur border border-border rounded-lg px-4 py-2.5 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="relative w-2 h-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-primary animate-ping" />
          </div>
          <span className="text-xs font-medium tabular-nums">{onlineCount} online</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
          <span className="text-xs text-muted-foreground tabular-nums">{drivers.length - onlineCount} offline</span>
        </div>
        <div className="w-px h-3 bg-border" />
        <span className="text-xs text-muted-foreground tabular-nums">{drivers.length} total</span>
      </div>

      <div className="h-[calc(100vh-12rem)] rounded-xl overflow-hidden border border-border">
        <MapContainer
          center={[-7.9566, 112.6150]}
          zoom={14}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* UB Campus area indicator */}
          <Circle
            center={[-7.9526, 112.6060]}
            radius={500}
            pathOptions={{ color: "#D4A843", fillColor: "#D4A843", fillOpacity: 0.05, weight: 1 }}
          />

          {/* Driver markers */}
          {drivers.filter((d) => filter === "all" || (filter === "online" ? d.is_online : !d.is_online)).map((driver) => {
            const position = getDriverPosition(driver);
            const icon = driver.is_online ? onlineIcon : offlineIcon;

            return (
              <Marker key={driver.id} position={position} icon={icon}>
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${driver.is_online ? "bg-amber-500" : "bg-gray-400"}`} />
                      <p className="font-bold">{driver.full_name}</p>
                    </div>
                    <p className="text-gray-600">{driver.vehicle_type} • {driver.license_plate}</p>
                    <p className="text-gray-600">⭐ {driver.rating.toFixed(1)} • {driver.total_trips} trips</p>
                    <p className="text-gray-500 text-xs mt-1">{driver.phone}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
