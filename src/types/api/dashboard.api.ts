import type { JobStatusDto } from "@/types/api/capture-session.api";

export type DashboardCaptureSessionSummaryDto = {
  captureSessionId: string;
  captureDate: string;
  imageCount: number;
  latestProcessingStatus: JobStatusDto | null;
  latestJobId: string | null;
  hasReport: boolean;
};

export type ProjectDashboardDto = {
  projectId: string;
  projectName: string;
  archived: boolean;
  totalCaptureSessions: number;
  captureSessionsByStatus: Record<string, number>;
  processedCaptureSessions: number;
  pendingCaptureSessions: number;
  failedCaptureSessions: number;
  latestCaptureSessionDate: string | null;
  recentCaptureSessions: DashboardCaptureSessionSummaryDto[];
};
