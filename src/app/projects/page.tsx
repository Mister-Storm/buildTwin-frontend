import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { EmptyState } from "@/components/shared/States";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { toProjectSummary } from "@/features/domain/mappers/project.mapper";
import { listProjects } from "@/services/projects.service";
import { DEMO_ENABLED } from "@/features/demo/demo-seed";

export default async function ProjectsPage() {
  const dtos = await listProjects();
  const projects = dtos.map(toProjectSummary);

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
        />

        {DEMO_ENABLED ? <DemoBanner /> : null}

        {projects.length === 0 ? (
          <EmptyState
            title="Nenhuma obra encontrada"
            message="Cadastre um projeto no backend BuildTwin para iniciar a demonstração."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
