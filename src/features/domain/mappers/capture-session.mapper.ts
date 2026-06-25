import type { CaptureSessionTimelineEntry } from "@/features/domain/models/capture-session";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";
import { jobStatusLabel, jobStatusVariant } from "@/lib/formatters";

export function toCaptureSessionTimelineEntry(
  dto: ProjectCaptureSessionListItemDto,
  hasOrthomosaic: boolean,
  isLatest: boolean,
): CaptureSessionTimelineEntry {
  return {
    id: dto.captureSessionId,
    date: new Date(dto.captureDate),
    operatorName: dto.operatorName,
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

export function projectCaptureSessionsToTimeline(
  captureSessions: ProjectCaptureSessionListItemDto[],
  orthomosaicCaptureSessionIds: ReadonlySet<string>,
): CaptureSessionTimelineEntry[] {
  const sorted = [...captureSessions].sort(
    (a, b) => new Date(b.captureDate).getTime() - new Date(a.captureDate).getTime(),
  );

  return sorted.map((captureSession, index) =>
    toCaptureSessionTimelineEntry(
      captureSession,
      orthomosaicCaptureSessionIds.has(captureSession.captureSessionId),
      index === 0,
    ),
  );
}
