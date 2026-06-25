export type StatusVariant = "success" | "warning" | "error" | "neutral" | "info";

export type CaptureSessionTimelineEntry = {
  id: string;
  date: Date;
  operatorName: string;
  statusLabel: string;
  statusVariant: StatusVariant;
  imageCount: number;
  processingStatus: string;
  processingVariant: StatusVariant;
  hasOrthomosaic: boolean;
  isLatest: boolean;
  latestJobId: string | null;
};

export type ProjectDashboardView = {
  projectId: string;
  projectName: string;
  archived: boolean;
  totalCaptureSessions: number;
  captureSessionsByStatus: Record<string, number>;
  processedCaptureSessions: number;
  pendingCaptureSessions: number;
  failedCaptureSessions: number;
  latestCaptureSessionDate: Date | null;
  recentCaptureSessions: CaptureSessionTimelineEntry[];
};
