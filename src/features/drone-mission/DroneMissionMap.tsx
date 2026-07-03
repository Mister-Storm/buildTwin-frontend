"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoPoint, PlanMissionResponse } from "@/features/drone-mission/drone-mission.api";

type DroneMissionMapProps = {
  onBoundaryChange: (points: GeoPoint[]) => void;
  mission: PlanMissionResponse | null;
  loading: boolean;
};

export function DroneMissionMap({ onBoundaryChange, mission, loading }: DroneMissionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawnPolygonRef = useRef<any>(null);
  const waypointLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let L: any;
    const initMap = async () => {
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([-23.5505, -46.6333], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = { L, map };
      setMapReady(true);
    };
    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle polygon drawing
  const startDrawing = useCallback(() => {
    const { L, map } = mapInstanceRef.current || {};
    if (!L || !map) return;

    // Remove existing polygon
    if (drawnPolygonRef.current) {
      map.removeLayer(drawnPolygonRef.current);
      drawnPolygonRef.current = null;
    }

    const points: GeoPoint[] = [];
    const markers: any[] = [];

    const onMapClick = (e: any) => {
      const { lat, lng } = e.latlng;
      points.push({ lat, lon: lng });

      const marker = L.marker([lat, lng]).addTo(map);
      markers.push(marker);

      if (points.length >= 3) {
        const polygon = L.polygon(points.map((p: GeoPoint) => [p.lat, p.lon]), {
          color: "#2563eb",
          fillColor: "#3b82f6",
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(map);
        drawnPolygonRef.current = polygon;
        onBoundaryChange(points);
      }
    };

    map.on("click", onMapClick);

    // Return cleanup
    return () => {
      map.off("click", onMapClick);
      markers.forEach((m: any) => map.removeLayer(m));
    };
  }, [onBoundaryChange]);

  // Draw mission waypoints
  useEffect(() => {
    const { L, map } = mapInstanceRef.current || {};
    if (!L || !map || !mission) return;

    // Remove existing waypoint layer
    if (waypointLayerRef.current) {
      map.removeLayer(waypointLayerRef.current);
    }

    const waypoints = mission.waypoints.filter((wp) => !wp.triggerCamera);
    const latlngs = waypoints.map((wp) => [wp.lat, wp.lon]);

    const polyline = L.polyline(latlngs, {
      color: "#10b981",
      weight: 2,
      opacity: 0.8,
      dashArray: "8, 4",
    }).addTo(map);
    waypointLayerRef.current = polyline;

    // Fit map to show the route
    map.fitBounds(polyline.getBounds().pad(0.1));

    // Add start/end markers
    if (waypoints.length > 0) {
      const first = waypoints[0];
      const last = waypoints[waypoints.length - 1];
      L.circleMarker([first.lat, first.lon], {
        color: "#10b981",
        fillColor: "#10b981",
        fillOpacity: 1,
        radius: 6,
      }).bindTooltip("Início").addTo(map);
      L.circleMarker([last.lat, last.lon], {
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 1,
        radius: 6,
      }).bindTooltip("Fim").addTo(map);
    }
  }, [mission]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
      <div ref={mapRef} className="w-full h-full" />
      {mapReady && !mission && (
        <button
          onClick={startDrawing}
          className="absolute top-3 left-3 z-[1000] px-4 py-2 bg-white rounded-lg shadow text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ✏️ Desenhar polígono
        </button>
      )}
      {loading && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg px-6 py-3 shadow-lg text-sm font-medium">
            ⏳ Calculando rota...
          </div>
        </div>
      )}
    </div>
  );
}
