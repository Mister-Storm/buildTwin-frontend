"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DroneMissionMap } from "@/features/drone-mission/DroneMissionMap";
import { planMission } from "@/features/drone-mission/drone-mission.service";
import { getProject } from "@/services/projects.service";
import type {
  GeoPoint,
  PlanMissionResponse,
} from "@/features/drone-mission/drone-mission.api";

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
  const [flightDate, setFlightDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  // Resolve projectId and fetch project location
  useEffect(() => {
    params.then(async (p) => {
      setProjectId(p.projectId);
      try {
        const project = await getProject(p.projectId);
        setProjectName(project.name ?? "");
        const loc = project.location;
        const lat = loc?.latitude;
        const lon = loc?.longitude;
        if (typeof lat === "number" && typeof lon === "number" && isFinite(lat) && isFinite(lon)) {
          setProjectCenter({ lat, lon });
        }
      } catch {
        // project fetch failed — map stays at default center
      }
    });
  }, [params]);

  const handlePlan = async () => {
    if (boundary.length < 3) return;
    setLoading(true);
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

  const handleBoundaryChange = (points: GeoPoint[]) => {
    setBoundary(points);
    setMission(null);
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
          {mission && (
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
                <div className="pt-2 border-t mt-2">
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
                <p className="text-xs text-gray-400 text-center pt-1">
                  Para salvar a missão permanentemente, tire um print ou exporte o JSON.
                  A funcionalidade de salvar no servidor estará disponível em breve.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
