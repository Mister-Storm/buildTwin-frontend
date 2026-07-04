"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { toProjectSummary } from "@/features/domain/mappers/project.mapper";
import type { ProjectSummary } from "@/features/domain/models/project";
import { ProjectListCard } from "@/features/project/project-list-card";
import { ProjectsPageActions } from "@/features/project/projects-page-actions";
import { getStoredToken } from "@/services/auth.service";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = getStoredToken();
      if (!token) {
        const { DEMO_ENABLED, DEMO_PROJECT_ID } = await import("@/features/demo/demo-seed");
        if (DEMO_ENABLED) {
          setProjects([{
            id: DEMO_PROJECT_ID,
            name: "Obra Integração",
            locationLabel: "São Paulo, SP",
            startDate: new Date("2026-01-15"),
            status: "active",
            statusLabel: "Ativo",
          }]);
          setLoading(false);
          return;
        }
        if (!cancelled) {
          setLoadError("Autenticação necessária.");
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/v1/projects", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const msg = res.status === 401 ? "Autenticação necessária." : `HTTP ${res.status}`;
          throw new Error(msg);
        }

        const dtos = await res.json();
        const summaries = Array.isArray(dtos) ? dtos.map(toProjectSummary) : [];

        if (!cancelled) setProjects(summaries);
      } catch (error) {
        if (!cancelled) {
          // Demo mode fallback: use demo project when API is unavailable
          const { DEMO_ENABLED, DEMO_PROJECT_ID } = await import(
            "@/features/demo/demo-seed"
          );
          if (DEMO_ENABLED) {
            setProjects([
              {
                id: DEMO_PROJECT_ID,
                name: "Obra Integração",
                locationLabel: "São Paulo, SP",
                startDate: new Date("2026-01-15"),
                status: "active",
                statusLabel: "Ativo",
              },
            ]);
            setLoading(false);
            return;
          }
          setLoadError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as obras.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppShell
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos" },
      ]}
    >
      <div className="space-y-8">
        <PageHeader
          title="Projetos"
          description="Obras monitoradas pela plataforma BuildTwin."
          actions={<ProjectsPageActions />}
        />

        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <span className="inline-block size-5 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
            <span className="ml-2 text-sm">Carregando...</span>
          </div>
        )}

        {loadError && !loading ? (
          <ErrorState title="Backend indisponível" message={loadError} />
        ) : null}

        {!loadError && !loading && projects.length === 0 ? (
          <EmptyState
            title="Nenhuma obra encontrada"
            message="Crie sua primeira obra para iniciar uma demonstração."
          />
        ) : null}

        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectListCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
