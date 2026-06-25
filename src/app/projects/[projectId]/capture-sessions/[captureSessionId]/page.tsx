import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CaptureSessionDetailWorkspace } from "@/features/capture-session/components/capture-session-detail-workspace";
import { getCaptureSession, getLatestCaptureSessionJob, listCaptureSessionImages } from "@/services/capture-sessions.service";
import { getJob } from "@/services/jobs.service";
import { getProject } from "@/services/projects.service";
import { getProgressReport } from "@/services/reports.service";
import { ApiError } from "@/types/api/common.api";
import { formatDate, jobStatusLabel, jobStatusVariant } from "@/lib/formatters";

type CaptureSessionDetailPageProps = {
  params: Promise<{ projectId: string; captureSessionId: string }>;
};

export default async function CaptureSessionDetailPage({
  params,
}: CaptureSessionDetailPageProps) {
  const { projectId, captureSessionId } = await params;

  let projectName = "Obra";
  try {
    const project = await getProject(projectId);
    projectName = project.name;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  let captureSession;
  try {
    captureSession = await getCaptureSession(captureSessionId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  if (captureSession.projectId !== projectId) notFound();

  const images = await listCaptureSessionImages(captureSessionId).catch(() => []);

  let initialJob = null;
  try {
    initialJob = await getLatestCaptureSessionJob(captureSessionId);
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
      initialReport = await getProgressReport(captureSessionId);
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
        { label: `Captura ${formatDate(new Date(captureSession.captureDate))}` },
      ]}
    >
      <div className="space-y-8">
        <PageHeader
          title={`Captura — ${formatDate(new Date(captureSession.captureDate))}`}
          description={`Operador: ${captureSession.operatorName} · ${captureSession.imageCount} imagens`}
          actions={
            processingStatus ? (
              <StatusBadge
                label={jobStatusLabel(processingStatus)}
                variant={jobStatusVariant(processingStatus)}
              />
            ) : undefined
          }
        />

        <CaptureSessionDetailWorkspace
          projectId={projectId}
          captureSession={captureSession}
          initialImages={images}
          initialJob={initialJob}
          initialJobDetail={initialJobDetail}
          initialReport={initialReport}
        />
      </div>
    </AppShell>
  );
}
