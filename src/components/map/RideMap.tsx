"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const OSRM_URL = process.env.NEXT_PUBLIC_OSRM_URL || "https://osrm.wardaya.my.id";

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

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, points]);

  return null;
}

export default function RideMap({ pickupLat, pickupLng, pickupAddress, dropoffLat, dropoffLng, dropoffAddress }: RideMapProps) {
  const [routePoints, setRoutePoints] = useState<[number, number][]>([
    [pickupLat, pickupLng],
    [dropoffLat, dropoffLng],
  ]);

  useEffect(() => {
    async function fetchRoute() {
      try {
        const url = `${OSRM_URL}/route/v1/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}?overview=full&geometries=polyline`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.code === "Ok" && data.routes?.[0]?.geometry) {
          const decoded = decodePolyline(data.routes[0].geometry);
          if (decoded.length > 0) {
            setRoutePoints(decoded);
          }
        }
      } catch {
      }
    }

    fetchRoute();
  }, [pickupLat, pickupLng, dropoffLat, dropoffLng]);

  const centerLat = (pickupLat + dropoffLat) / 2;
  const centerLng = (pickupLng + dropoffLng) / 2;

  return (
    <div className="h-48 rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
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
          pathOptions={{ color: "hsl(42, 65%, 55%)", weight: 4, opacity: 0.9 }}
        />
        <Polyline
          positions={routePoints}
          pathOptions={{ color: "hsl(42, 65%, 55%)", weight: 10, opacity: 0.1 }}
        />
        <FitBounds points={routePoints} />
      </MapContainer>
    </div>
  );
}
