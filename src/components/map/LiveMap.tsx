"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "@/lib/api";

// Green marker for online drivers
const onlineIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
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

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  vehicle_type: string;
  license_plate: string;
  is_online: boolean;
  is_verified: boolean;
  rating: number;
  total_trips: number;
}

interface DriverLocation {
  user_id: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
}

interface LiveMapProps {
  wsDriverLocations?: Map<string, DriverLocation>;
}

export default function LiveMap({ wsDriverLocations }: LiveMapProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    async function fetchDrivers() {
      const res = await api.getDrivers(1, 100, "");
      if (res.success && res.data) {
        setDrivers(res.data);
        setOnlineCount(res.data.filter((d: Driver) => d.is_online).length);
      }
    }
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 15000);
    return () => clearInterval(interval);
  }, []);

  // Generate deterministic positions for drivers (demo mode)
  // In production, use actual lat/lng from driver profile or WS updates
  function getDriverPosition(driver: Driver): [number, number] {
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
      <div className="absolute top-3 left-3 z-[1000] bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium">{onlineCount} online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-xs text-muted-foreground">{drivers.length - onlineCount} offline</span>
        </div>
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
            pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.05, weight: 1 }}
          />

          {/* Driver markers */}
          {drivers.map((driver) => {
            const position = getDriverPosition(driver);
            const icon = driver.is_online ? onlineIcon : offlineIcon;

            return (
              <Marker key={driver.id} position={position} icon={icon}>
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${driver.is_online ? "bg-green-500" : "bg-gray-400"}`} />
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
