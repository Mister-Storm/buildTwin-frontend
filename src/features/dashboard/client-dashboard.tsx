"use client";

import { useEffect, useState } from "react";
import { Building2, Calendar, CheckCircle2, Activity } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { ErrorState } from "@/components/shared/States";
import { getStoredToken } from "@/services/auth.service";
import { getApiBaseUrl } from "@/services/api-client";

type Metric = {
  label: string;
  value: string;
  subtitle: string;
};

type DashboardData = {
  activeProjects: Metric;
  lastCaptureSession: Metric;
  processedCaptureSessions: Metric;
  completedProcessings: Metric;
};

export function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        const base = getApiBaseUrl();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${base}/api/v1/projects`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const projects = await res.json();
        const activeProjects = Array.isArray(projects)
          ? projects.filter((p: { archivedAt: string | null }) => p.archivedAt === null)
          : [];

        if (cancelled) return;
        setData({
          activeProjects: {
            label: "Obras Ativas",
            value: String(activeProjects.length),
            subtitle: `${activeProjects.length} obras no total`,
          },
          lastCaptureSession: {
            label: "Última Captura Realizado",
            value: "—",
            subtitle: "Nenhuma captura registrado",
          },
          processedCaptureSessions: {
            label: "Capturas Processadas",
            value: "0",
            subtitle: "Com ortomosaico concluído",
          },
          completedProcessings: {
            label: "Processamentos Concluídos",
            value: "0",
            subtitle: "Jobs finalizados com sucesso",
          },
        });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="inline-block size-5 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
        <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Backend indisponível"
        message="Não foi possível carregar os indicadores. Verifique se o backend está acessível e tente novamente."
      />
    );
  }

  const d = data!;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label={d.activeProjects.label}
        value={d.activeProjects.value}
        subtitle={d.activeProjects.subtitle}
        icon={Building2}
      />
      <MetricCard
        label={d.lastCaptureSession.label}
        value={d.lastCaptureSession.value}
        subtitle={d.lastCaptureSession.subtitle}
        icon={Calendar}
      />
      <MetricCard
        label={d.processedCaptureSessions.label}
        value={d.processedCaptureSessions.value}
        subtitle={d.processedCaptureSessions.subtitle}
        icon={CheckCircle2}
      />
      <MetricCard
        label={d.completedProcessings.label}
        value={d.completedProcessings.value}
        subtitle={d.completedProcessings.subtitle}
        icon={Activity}
      />
    </div>
  );
}
