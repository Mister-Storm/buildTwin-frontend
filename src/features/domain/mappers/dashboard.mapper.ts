import type { CaptureSessionTimelineEntry, ProjectDashboardView } from "@/features/domain/models/capture-session";
import type { ProjectDashboardDto } from "@/types/api/dashboard.api";
import { jobStatusLabel, jobStatusVariant } from "@/lib/formatters";

function dashboardCaptureSessionToTimelineEntry(
  dto: ProjectDashboardDto["recentCaptureSessions"][number],
  hasOrthomosaic: boolean,
  isLatest: boolean,
): CaptureSessionTimelineEntry {
  return {
    id: dto.captureSessionId,
    date: new Date(dto.captureDate),
    operatorName: "—",
    statusLabel: jobStatusLabel(dto.latestProcessingStatus),
    statusVariant: jobStatusVariant(dto.latestProcessingStatus),
    imageCount: dto.imageCount,
    processingStatus: jobStatusLabel(dto.latestProcessingStatus),
    processingVariant: jobStatusVariant(dto.latestProcessingStatus),
    hasOrthomosaic,
    isLatest,
    latestJobId: dto.latestJobId,
  };
}

export function toProjectDashboardView(
  dto: ProjectDashboardDto,
  orthomosaicCaptureSessionIds: ReadonlySet<string>,
): ProjectDashboardView {
  const sortedRecent = [...dto.recentCaptureSessions].sort(
    (a, b) => new Date(b.captureDate).getTime() - new Date(a.captureDate).getTime(),
  );

  return {
    projectId: dto.projectId,
    projectName: dto.projectName,
    archived: dto.archived,
    totalCaptureSessions: dto.totalCaptureSessions,
    captureSessionsByStatus: dto.captureSessionsByStatus,
    processedCaptureSessions: dto.processedCaptureSessions,
    pendingCaptureSessions: dto.pendingCaptureSessions,
    failedCaptureSessions: dto.failedCaptureSessions,
    latestCaptureSessionDate: dto.latestCaptureSessionDate
      ? new Date(dto.latestCaptureSessionDate)
      : null,
    recentCaptureSessions: sortedRecent.map((captureSession, index) =>
      dashboardCaptureSessionToTimelineEntry(
        captureSession,
        orthomosaicCaptureSessionIds.has(captureSession.captureSessionId),
        index === 0,
      ),
    ),
  };
}
