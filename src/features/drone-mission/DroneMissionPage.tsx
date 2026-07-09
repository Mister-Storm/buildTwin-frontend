"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DroneMissionMap } from "@/features/drone-mission/DroneMissionMap";
import { planMission } from "@/features/drone-mission/drone-mission.service";
import { getProject } from "@/services/projects.service";
import { getStoredToken } from "@/services/auth.service";
import {
  saveMission,
  listMissions,
  updateMissionStatus,
  getMissionById,
  type DroneMissionListItem,
  type DroneMissionDetail,
} from "@/features/drone-mission/drone-mission-persistence.service";
import type {
  GeoPoint,
  PlanMissionResponse,
} from "@/features/drone-mission/drone-mission.api";

async function geoCodeAddress(
  location: { address: string; city: string; state: string; country: string },
  signal: AbortSignal,
): Promise<{ lat: number; lon: number } | null> {
  const TIMEOUT_MS = 3000;
  const queries = [
    [location.address, location.city, location.state, location.country].filter(Boolean).join(", "),
    [location.city, location.state, location.country].filter(Boolean).join(", "),
    [location.state, location.country].filter(Boolean).join(", "),
    location.country,
  ].filter(Boolean);

  for (const q of queries) {
    if (!q) continue;
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);
    const combinedSignal: AbortSignal = signal.aborted
      ? timeoutController.signal
      : (() => {
          const c = new AbortController();
          signal.addEventListener("abort", () => c.abort(), { once: true });
          timeoutController.signal.addEventListener("abort", () => c.abort(), { once: true });
          return c.signal;
        })();
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
      const res = await fetch(url, { signal: combinedSignal });
      clearTimeout(timeoutId);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.length > 0) {
        return { lat: Number(data[0].lat), lon: Number(data[0].lon) };
      }
    } catch {
      clearTimeout(timeoutId);
      continue;
    }
  }
  return null;
}

type DroneMissionPageProps = {
  params: Promise<{ projectId: string }>;
};

export default function DroneMissionPage({ params }: DroneMissionPageProps) {
  const [projectId, setProjectId] = useState<string>("");
  const [projectCenter, setProjectCenter] = useState<{ lat: number; lon: number } | undefined>(undefined);
  const [projectName, setProjectName] = useState("");
  const [boundary, setBoundary] = useState<GeoPoint[]>([]);
  const [mission, setMission] = useState<PlanMissionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [photosPerM2, setPhotosPerM2] = useState(0.01);
  const [altitudeM, setAltitudeM] = useState(80);
  const [autoAltitude, setAutoAltitude] = useState(true);
  const [speedMps, setSpeedMps] = useState(10);
  const [saving, setSaving] = useState(false);
  const [missionName, setMissionName] = useState("");
  const [savedMissions, setSavedMissions] = useState<DroneMissionListItem[]>([]);
  const [loadedMission, setLoadedMission] = useState<DroneMissionDetail | null>(null);
  const [loadingMission, setLoadingMission] = useState(false);
  const [flightDate, setFlightDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  // Resolve projectId and fetch project location
  useEffect(() => {
    const controller = new AbortController();
    params.then(async (p) => {
      setProjectId(p.projectId);
      // Load saved missions
      listMissions(p.projectId).then(setSavedMissions).catch(() => {});
      try {
        const project = await getProject(p.projectId);
        setProjectName(project.name ?? "");
        const loc = project.location;
        const lat = loc?.latitude;
        const lon = loc?.longitude;
        const hasValidCoords =
          typeof lat === "number" && typeof lon === "number" && isFinite(lat) && isFinite(lon) && (lat !== 0 || lon !== 0);
        if (hasValidCoords) {
          setProjectCenter({ lat, lon });
        } else if (loc) {
          // Fallback: geoCode from address fields
          const result = await geoCodeAddress(
            { address: loc.address, city: loc.city, state: loc.state, country: loc.country },
            controller.signal,
          );
          if (result) {
            setProjectCenter(result);
          }
        }
      } catch {
        // project fetch failed — map stays at default center
      }
    });
    return () => controller.abort();
  }, [params]);

  // Load saved missions
  useEffect(() => {
    if (!projectId) return;
    listMissions(projectId).then(setSavedMissions).catch(() => {});
  }, [projectId]);

  const handlePlan = async () => {
    if (boundary.length < 3) return;
    setLoading(true);
    setLoadedMission(null);
    try {
      const result = await planMission(projectId, {
        projectId,
        boundary,
        photosPerM2,
        altitudeM: autoAltitude ? null : altitudeM,
        speedMps,
      });
      setMission(result);
    } catch (err) {
      console.error("Failed to plan mission:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMission = async () => {
    if (!mission || !boundary.length) return;
    if (!getStoredToken()) return;
    setSaving(true);
    try {
      const saved = await saveMission({
        projectId,
        name: missionName || `Voo ${new Date().toLocaleDateString("pt-BR")}`,
        flightDate,
        boundary,
        waypoints: mission.waypoints,
        stats: mission.stats,
        parameters: mission.parameters,
        camera: mission.camera,
      });
      setSavedMissions((prev) => [saved, ...prev]);
      setMission(null);
      setMissionName("");
    } catch (err) {
      console.error("Failed to save mission:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadMission = async (id: string) => {
    if (!getStoredToken()) return;
    setLoadingMission(true);
    try {
      const detail = await getMissionById(id);
      setLoadedMission(detail);
      if (detail.boundary && detail.boundary.length > 0) {
        setBoundary(detail.boundary);
      } else {
        setBoundary([]);
      }
      if (detail.flightDate) {
        setFlightDate(detail.flightDate);
      }
      if (detail.waypoints && detail.waypoints.length > 0) {
        setMission({
          waypoints: detail.waypoints,
          stats: detail.stats,
          camera: detail.camera,
          parameters: detail.parameters,
        });
      }
    } catch (err) {
      console.error("Failed to load mission:", err);
    } finally {
      setLoadingMission(false);
    }
  };

  const handleCancelMission = async (id: string) => {
    if (!getStoredToken()) return;
    try {
      const updated = await updateMissionStatus(id, "CANCELLED");
      setSavedMissions((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      console.error("Failed to cancel mission:", err);
    }
  };

  const handleBoundaryChange = (points: GeoPoint[]) => {
    setBoundary(points);
    setLoadedMission(null);
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const formatArea = (m2: number) => {
    if (m2 > 10000) return `${(m2 / 10000).toFixed(2)} ha`;
    return `${m2.toFixed(0)} m²`;
  };

  return (
    <AppShell breadcrumbs={[{ label: "Navegação de Drone" }]}>
      <PageHeader
        title={`Planejamento de Voo${projectName ? ` — ${projectName}` : ""}`}
        description="Defina a área, configure os parâmetros e planeje a rota do drone"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <DroneMissionMap
            onBoundaryChange={handleBoundaryChange}
            mission={mission}
            loading={loading}
            {...(projectCenter ? { center: projectCenter } : {})}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parâmetros da Missão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Flight date */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data do Voo
                </label>
                <input
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fotos por m²
                </label>
                <input
                  type="number"
                  value={photosPerM2}
                  onChange={(e) => setPhotosPerM2(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  step={0.005}
                  min={0.001}
                  max={1}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <input
                    type="checkbox"
                    checked={autoAltitude}
                    onChange={(e) => setAutoAltitude(e.target.checked)}
                  />
                  Altitude automática
                </label>
                {!autoAltitude && (
                  <input
                    type="number"
                    value={altitudeM}
                    onChange={(e) => setAltitudeM(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    min={10}
                    max={500}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Velocidade (m/s)
                </label>
                <input
                  type="number"
                  value={speedMps}
                  onChange={(e) => setSpeedMps(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  min={1}
                  max={30}
                />
              </div>

              <button
                onClick={handlePlan}
                disabled={boundary.length < 3 || loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "⏳ Calculando..." : "🚁 Planejar Rota"}
              </button>
            </CardContent>
          </Card>

          {/* Results */}
          {mission && !loadedMission && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Área</span>
                  <span className="font-medium">{formatArea(mission.stats.areaSquareMeters)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Altitude</span>
                  <span className="font-medium">{mission.stats.altitudeMeters.toFixed(0)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Distância</span>
                  <span className="font-medium">
                    {(mission.stats.totalDistanceMeters / 1000).toFixed(1)} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duração</span>
                  <span className="font-medium">
                    {formatDuration(mission.stats.estimatedTimeSeconds)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fotos</span>
                  <span className="font-medium">{mission.stats.photoCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GSD</span>
                  <span className="font-medium">{mission.stats.gsdCmPerPixel.toFixed(2)} cm/px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data do Voo</span>
                  <span className="font-medium">
                    {flightDate
                      ? new Date(flightDate + "T12:00:00").toLocaleDateString("pt-BR")
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Câmera</span>
                  <span className="font-medium">{mission.camera.model}</span>
                </div>
                <div className="pt-2 border-t mt-2 space-y-2">
                  {/* Mission name input */}
                  <input
                    type="text"
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    placeholder="Nome da missão (opcional)"
                    aria-label="Nome da missão"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleSaveMission}
                    disabled={saving}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? "💾 Salvando..." : "💾 Salvar Missão"}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob(
                        [JSON.stringify(mission.waypoints, null, 2)],
                        { type: "application/json" },
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `mission-${projectId}-waypoints.json`;
                      a.click();
                    }}
                    className="w-full px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    📥 Exportar Waypoints (JSON)
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loaded mission details */}
          {loadedMission && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Missão Carregada: {loadedMission.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Área</span>
                  <span className="font-medium">{formatArea(loadedMission.stats.areaSquareMeters)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Altitude</span>
                  <span className="font-medium">{loadedMission.stats.altitudeMeters.toFixed(0)} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Distância</span>
                  <span className="font-medium">
                    {(loadedMission.stats.totalDistanceMeters / 1000).toFixed(1)} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duração</span>
                  <span className="font-medium">
                    {formatDuration(loadedMission.stats.estimatedTimeSeconds)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fotos</span>
                  <span className="font-medium">{loadedMission.stats.photoCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">GSD</span>
                  <span className="font-medium">{loadedMission.stats.gsdCmPerPixel.toFixed(2)} cm/px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Data do Voo</span>
                  <span className="font-medium">
                    {loadedMission.flightDate
                      ? new Date(loadedMission.flightDate + "T12:00:00").toLocaleDateString("pt-BR")
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Câmera</span>
                  <span className="font-medium">{loadedMission.camera.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Overlap frontal</span>
                  <span className="font-medium">{loadedMission.parameters.overlapFront * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Overlap lateral</span>
                  <span className="font-medium">{loadedMission.parameters.overlapSide * 100}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Margem</span>
                  <span className="font-medium">{loadedMission.parameters.marginMeters} m</span>
                </div>
                <button
                  onClick={() => {
                    setLoadedMission(null);
                    setMission(null);
                    setBoundary([]);
                  }}
                  className="w-full mt-2 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  ✕ Limpar Missão Carregada
                </button>
              </CardContent>
            </Card>
          )}

          {/* Saved Missions */}
          {savedMissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Missões Anteriores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {savedMissions.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{m.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {m.flightDate
                          ? new Date(m.flightDate + "T12:00:00").toLocaleDateString("pt-BR")
                          : "Sem data"}
                        {" · "}
                        {m.areaSquareMeters
                          ? `${(m.areaSquareMeters / 10000).toFixed(2)} ha`
                          : "—"}
                        {" · "}
                        {m.photoCount ?? "—"} fotos
                      </p>
                    </div>
                    <span
                      className={cn(
                        "ml-3 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        m.status === "PLANNED"
                          ? "bg-blue-100 text-blue-700"
                          : m.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500",
                      )}
                    >
                      {m.status === "PLANNED"
                        ? "Planejado"
                        : m.status === "COMPLETED"
                          ? "Concluído"
                          : "Cancelado"}
                    </span>
                    <button
                      onClick={() => handleLoadMission(m.id)}
                      disabled={loadingMission}
                      type="button"
                      aria-label="Carregar missão no mapa"
                      className="ml-2 shrink-0 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      title="Carregar missão no mapa"
                    >
                      📂
                    </button>
                    {m.status === "PLANNED" && (
                      <button
                        onClick={() => handleCancelMission(m.id)}
                        className="ml-2 shrink-0 text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
