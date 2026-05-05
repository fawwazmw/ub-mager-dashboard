"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

interface HeatPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

interface HeatmapLayerProps {
  points: HeatPoint[];
  radius?: number;
  blur?: number;
  maxZoom?: number;
}

export function HeatmapLayer({ points, radius = 25, blur = 15, maxZoom = 17 }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    const heatData = points.map((p) => [p.lat, p.lng, p.intensity ?? 1] as [number, number, number]);

    const heat = (L as unknown as { heatLayer: (data: [number, number, number][], opts: object) => L.Layer }).heatLayer(heatData, {
      radius,
      blur,
      maxZoom,
      gradient: {
        0.2: "hsl(217, 91%, 60%)",
        0.4: "hsl(180, 70%, 50%)",
        0.6: "hsl(42, 65%, 55%)",
        0.8: "hsl(38, 92%, 50%)",
        1.0: "hsl(0, 84%, 60%)",
      },
    });

    heat.addTo(map);
    return () => { map.removeLayer(heat); };
  }, [map, points, radius, blur, maxZoom]);

  return null;
}
