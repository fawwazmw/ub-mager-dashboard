"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pickupIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
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

export default function RideMap({ pickupLat, pickupLng, pickupAddress, dropoffLat, dropoffLng, dropoffAddress }: RideMapProps) {
  const centerLat = (pickupLat + dropoffLat) / 2;
  const centerLng = (pickupLng + dropoffLng) / 2;

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
          positions={[[pickupLat, pickupLng], [dropoffLat, dropoffLng]]}
          pathOptions={{ color: "hsl(42, 65%, 55%)", weight: 3, dashArray: "8 8", opacity: 0.7 }}
        />
      </MapContainer>
    </div>
  );
}
