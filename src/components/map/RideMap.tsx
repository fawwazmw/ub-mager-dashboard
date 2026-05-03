"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pickupIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropoffIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RideMapProps {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
}

function generateCurvedRoute(
  startLat: number, startLng: number,
  endLat: number, endLng: number,
  segments: number = 20
): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;

  const dLat = endLat - startLat;
  const dLng = endLng - startLng;
  const perpLat = -dLng * 0.15;
  const perpLng = dLat * 0.15;

  const ctrlLat = midLat + perpLat;
  const ctrlLng = midLng + perpLng;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * ctrlLat + t * t * endLat;
    const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * ctrlLng + t * t * endLng;
    points.push([lat, lng]);
  }

  return points;
}

export default function RideMap({ pickupLat, pickupLng, pickupAddress, dropoffLat, dropoffLng, dropoffAddress }: RideMapProps) {
  const centerLat = (pickupLat + dropoffLat) / 2;
  const centerLng = (pickupLng + dropoffLng) / 2;
  const routePoints = generateCurvedRoute(pickupLat, pickupLng, dropoffLat, dropoffLng);

  return (
    <div className="h-48 rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
          <Popup><span className="text-xs">{pickupAddress}</span></Popup>
        </Marker>
        <Marker position={[dropoffLat, dropoffLng]} icon={dropoffIcon}>
          <Popup><span className="text-xs">{dropoffAddress}</span></Popup>
        </Marker>
        <Polyline
          positions={routePoints}
          pathOptions={{ color: "hsl(42, 65%, 55%)", weight: 3, opacity: 0.8 }}
        />
        <Polyline
          positions={routePoints}
          pathOptions={{ color: "hsl(42, 65%, 55%)", weight: 8, opacity: 0.15 }}
        />
      </MapContainer>
    </div>
  );
}
