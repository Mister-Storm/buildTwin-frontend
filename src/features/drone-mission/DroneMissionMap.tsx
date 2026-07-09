"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Polyline, CircleMarker } from "leaflet";
import type { GeoPoint, PlanMissionResponse } from "@/features/drone-mission/drone-mission.api";

type DroneMissionMapProps = {
  onBoundaryChange: (points: GeoPoint[]) => void;
  onDrawingChange?: (isDrawing: boolean) => void;
  mission: PlanMissionResponse | null;
  loading: boolean;
  center?: { lat: number; lon: number };
};

export function DroneMissionMap({
  onBoundaryChange,
  onDrawingChange,
  mission,
  loading,
  center,
}: DroneMissionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null);
  const drawnPolygonRef = useRef<Polyline | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeShape = (layer: any) => { drawnPolygonRef.current = layer; };
  const waypointLayerRef = useRef<Polyline | null>(null);
  const markersRef = useRef<CircleMarker[]>([]);
  const pointsRef = useRef<GeoPoint[]>([]);
  const drawingRef = useRef(false);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const clickHandlerRef = useRef<((e: { latlng: { lat: number; lng: number } }) => void) | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pointCount, setPointCount] = useState(0);

  // Initialize Leaflet map (one-time)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const defaultCenter: [number, number] = [-23.5505, -46.6333];
      const map = L.map(mapRef.current!, {
        center: defaultCenter,
        zoom: 15,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = { map };
      leafletRef.current = L;
      setMapReady(true);
    };
    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.map.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter map when project center is fetched asynchronously
  useEffect(() => {
    if (!center || !mapInstanceRef.current) return;
    mapInstanceRef.current.map.setView([center.lat, center.lon], 15);
  }, [center]);

  // Stop drawing and restore cursor
  const stopDrawing = useCallback(() => {
    drawingRef.current = false;
    setIsDrawing(false);
    onDrawingChange?.(false);
    const { map } = mapInstanceRef.current ?? {};
    if (map && clickHandlerRef.current) {
      map.off("click", clickHandlerRef.current);
      clickHandlerRef.current = null;
    }
    if (map) {
      (map.getContainer() as HTMLElement).style.cursor = "";
    }
  }, [onDrawingChange]);

  // Clear all drawn points
  const clearAll = useCallback(() => {
    const { map } = mapInstanceRef.current ?? {};
    if (!map) return;
    pointsRef.current = [];
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (drawnPolygonRef.current) {
      map.removeLayer(drawnPolygonRef.current);
      drawnPolygonRef.current = null;
    }
    onBoundaryChange([]);
    setPointCount(0);
  }, [onBoundaryChange]);

  // Undo last point
  const undoLastPoint = useCallback(() => {
    const { map } = mapInstanceRef.current ?? {};
    if (!map || markersRef.current.length === 0) return;

    const lastMarker = markersRef.current.pop()!;
    map.removeLayer(lastMarker);
    pointsRef.current.pop();

    if (drawnPolygonRef.current) {
      map.removeLayer(drawnPolygonRef.current);
      drawnPolygonRef.current = null;
    }

    const Lmod = leafletRef.current;
    if (!Lmod) return;

    if (pointsRef.current.length >= 3) {
      storeShape(Lmod.polygon(
        pointsRef.current.map((p) => [p.lat, p.lon] as [number, number]),
        { color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.2, weight: 2 },
      ).addTo(map));
    } else if (pointsRef.current.length === 2) {
      storeShape(Lmod.polyline(
        pointsRef.current.map((p) => [p.lat, p.lon] as [number, number]),
        { color: "#2563eb", weight: 2, dashArray: "6, 3" },
      ).addTo(map));
    }

    onBoundaryChange([...pointsRef.current]);
    setPointCount(pointsRef.current.length);
  }, [onBoundaryChange]);

  // Handle polygon drawing
  const startDrawing = useCallback(() => {
    const instance = mapInstanceRef.current;
    if (!instance) return;

    const { map } = instance;

    // Stop previous drawing
    if (clickHandlerRef.current) {
      map.off("click", clickHandlerRef.current);
    }
    clearAll();

    const Lmod = leafletRef.current;
    if (!Lmod) return;

    drawingRef.current = true;
    setIsDrawing(true);
    onDrawingChange?.(true);
    (map.getContainer() as HTMLElement).style.cursor = "crosshair";

    const onMapClick = (e: { latlng: { lat: number; lng: number } }) => {
      if (!drawingRef.current) return;
      const { lat, lng } = e.latlng;
      pointsRef.current.push({ lat, lon: lng });

      const marker = Lmod.circleMarker([lat, lng], {
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 1,
        radius: 5,
        weight: 2,
      }).addTo(map);

      marker.bindTooltip(String(pointsRef.current.length), {
        permanent: true,
        direction: "top",
        offset: [0, -8],
        className: "text-xs font-medium",
      });

      markersRef.current.push(marker);

      if (drawnPolygonRef.current) {
        map.removeLayer(drawnPolygonRef.current);
      }

      if (pointsRef.current.length >= 3) {
        storeShape(Lmod.polygon(
          pointsRef.current.map((p) => [p.lat, p.lon] as [number, number]),
          { color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 0.2, weight: 2 },
        ).addTo(map));
      } else if (pointsRef.current.length === 2) {
        storeShape(Lmod.polyline(
          pointsRef.current.map((p) => [p.lat, p.lon] as [number, number]),
          { color: "#2563eb", weight: 2, dashArray: "6, 3" },
        ).addTo(map));
      }

      onBoundaryChange([...pointsRef.current]);
      setPointCount(pointsRef.current.length);
    };

    clickHandlerRef.current = onMapClick;
    map.on("click", onMapClick);
  }, [clearAll, onBoundaryChange, onDrawingChange]);

  // Draw mission waypoints
  useEffect(() => {
    const initWaypoints = async () => {
      const instance = mapInstanceRef.current;
      if (!instance || !mission) return;

      stopDrawing();
      clearAll();

      const L = (await import("leaflet")).default;
      const { map } = instance;

      if (waypointLayerRef.current) {
        map.removeLayer(waypointLayerRef.current);
      }

      const waypoints = mission.waypoints.filter((wp) => !wp.triggerCamera);
      const latlngs: [number, number][] = waypoints.map((wp) => [wp.lat, wp.lon]);

      const polyline = L.polyline(latlngs, {
        color: "#10b981",
        weight: 2,
        opacity: 0.8,
        dashArray: "8, 4",
      }).addTo(map);
      waypointLayerRef.current = polyline;

      map.fitBounds(polyline.getBounds().pad(0.1));

      if (waypoints.length > 0) {
        const first = waypoints[0]!;
        const last = waypoints[waypoints.length - 1]!;
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
    };
    initWaypoints();
  }, [mission, stopDrawing, clearAll]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
      <div ref={mapRef} className="w-full h-full" />
      {mapReady && !mission && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5">
          {!isDrawing ? (
            <button
              onClick={startDrawing}
              className="px-4 py-2 bg-card text-foreground border border-border rounded-lg shadow-sm text-sm font-medium hover:bg-accent transition-colors"
            >
              ✏️ Desenhar polígono
            </button>
          ) : (
            <>
              <div className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow text-sm font-medium">
                🖱️ Clique no mapa para marcar pontos
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => undoLastPoint()}
                  disabled={pointCount === 0}
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg shadow text-xs font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ↩️ Desfazer
                </button>
                <button
                  onClick={() => { clearAll(); stopDrawing(); }}
                  className="flex-1 px-3 py-1.5 bg-white rounded-lg shadow text-xs font-medium hover:bg-red-50 transition-colors"
                >
                  🗑️ Limpar
                </button>
              </div>
            </>
          )}
        </div>
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

type MapInstance = {
  map: LeafletMap;
};
