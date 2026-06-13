import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState } from "@/components/shared/States";
import { ProjectCard } from "@/components/shared/ProjectCard";
import { toProjectSummary } from "@/features/domain/mappers/project.mapper";
import type { ProjectSummary } from "@/features/domain/models/project";
import { listProjects } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";

export default async function ProjectsPage() {
  let projects: ProjectSummary[] = [];
  let loadError: string | null = null;

  try {
    const dtos = await listProjects();
    projects = dtos.map(toProjectSummary);
  } catch (error) {
    projects = [];
    if (error instanceof ApiError) {
      loadError = error.message;
    } else {
      loadError = "Não foi possível carregar as obras.";
    }
  }

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

        {loadError ? (
          <ErrorState
            title="Backend indisponível"
            message={loadError}
          />
        ) : null}

        {!loadError && projects.length === 0 ? (
          <EmptyState
            title="Nenhuma obra encontrada"
            message="Cadastre um projeto no backend BuildTwin para iniciar."
          />
        ) : null}

        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
