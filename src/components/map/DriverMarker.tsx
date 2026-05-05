"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { DriverListItem } from "@/lib/types";

const onlineIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const offlineIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

interface DriverMarkerProps {
  driver: DriverListItem;
  position: [number, number];
}

export function DriverMarker({ driver, position }: DriverMarkerProps) {
  const icon = driver.is_online ? onlineIcon : offlineIcon;

  return (
    <Marker position={position} icon={icon}>
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
}
