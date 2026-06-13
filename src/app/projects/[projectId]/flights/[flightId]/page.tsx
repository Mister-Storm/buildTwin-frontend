import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { FlightDetailWorkspace } from "@/features/flight/components/flight-detail-workspace";
import { getFlight, getLatestFlightJob, listFlightImages } from "@/services/flights.service";
import { getJob } from "@/services/jobs.service";
import { getProject } from "@/services/projects.service";
import { getProgressReport } from "@/services/reports.service";
import { ApiError } from "@/types/api/common.api";
import { formatDate, jobStatusLabel, jobStatusVariant } from "@/lib/formatters";

type FlightDetailPageProps = {
  params: Promise<{ projectId: string; flightId: string }>;
};

export default async function FlightDetailPage({
  params,
}: FlightDetailPageProps) {
  const { projectId, flightId } = await params;

  let projectName = "Obra";
  try {
    const project = await getProject(projectId);
    projectName = project.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  let flight;
  try {
    flight = await getFlight(flightId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  if (flight.projectId !== projectId) notFound();

  const images = await listFlightImages(flightId).catch(() => []);

  let initialJob = null;
  try {
    initialJob = await getLatestFlightJob(flightId);
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }

  let initialJobDetail = null;
  if (initialJob?.status === "COMPLETED") {
    try {
      initialJobDetail = await getJob(initialJob.jobId);
    } catch {
      // ignore
    }
  }

  let initialReport = null;
  if (initialJob?.status === "COMPLETED") {
    try {
      initialReport = await getProgressReport(flightId);
    } catch {
      // report optional
    }
  }

  const processingStatus = initialJob?.status ?? null;

  return (
    <AppShell
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos", href: "/projects" },
        { label: projectName, href: `/projects/${projectId}` },
        { label: `Voo ${formatDate(new Date(flight.flightDate))}` },
      ]}
    >
      <div className="space-y-8">
        <PageHeader
          title={`Voo — ${formatDate(new Date(flight.flightDate))}`}
          description={`Operador: ${flight.operatorName} · ${flight.imageCount} imagens`}
          actions={
            processingStatus ? (
              <StatusBadge
                label={jobStatusLabel(processingStatus)}
                variant={jobStatusVariant(processingStatus)}
              />
            ) : undefined
          }
        />

        <FlightDetailWorkspace
          projectId={projectId}
          flight={flight}
          initialImages={images}
          initialJob={initialJob}
          initialJobDetail={initialJobDetail}
          initialReport={initialReport}
        />
      </div>
    </AppShell>
  );
}
