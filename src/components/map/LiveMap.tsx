"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "@/lib/api";

// Fix Leaflet default icon issue in Next.js
const driverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

export default function LiveMap() {
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    async function fetchDrivers() {
      const res = await api.getDrivers(1, 100, "");
      if (res.success && res.data) {
        setDrivers(res.data);
      }
    }
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[calc(100vh-10rem)] rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={[-7.9666, 112.6326]}
        zoom={14}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {drivers.map((driver) => {
          // Use a deterministic position based on driver ID for demo
          // In production, this would come from the driver's actual lat/lng
          const hash = driver.id.charCodeAt(0) + driver.id.charCodeAt(1);
          const lat = -7.9526 + (hash % 50) * 0.001;
          const lng = 112.6060 + (hash % 70) * 0.001;

          return (
            <Marker key={driver.id} position={[lat, lng]} icon={driverIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{driver.full_name}</p>
                  <p className="text-gray-600">{driver.vehicle_type} • {driver.license_plate}</p>
                  <p className="text-gray-600">⭐ {driver.rating} • {driver.total_trips} trips</p>
                  <p className={driver.is_online ? "text-green-600" : "text-gray-400"}>
                    {driver.is_online ? "● Online" : "○ Offline"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
