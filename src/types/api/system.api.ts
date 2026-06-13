export type ComponentHealthStatus = "UP" | "DOWN" | "DEGRADED";

export type ReadinessResponseDto = {
  status: ComponentHealthStatus;
};

export type ComponentOverviewDto = {
  status: ComponentHealthStatus;
  version?: string | null;
  details?: string | null;
  lastSeenAt?: string | null;
  currentStatus?: string | null;
  processedJobsCount?: number | null;
  lastJobId?: string | null;
  lastJobFinishedAt?: string | null;
};

export type RecentJobSummaryDto = {
  projectId: string;
  projectName: string;
  flightId: string;
  flightDate: string;
  operatorName: string;
  status: string;
  jobId: string | null;
};

export type OperationsSummaryDto = {
  projects: number;
  flights: number;
  jobs: number;
  processedJobs: number;
  pendingJobs: number;
  failedJobs: number;
  recentJobs: RecentJobSummaryDto[];
};

export type SystemOverviewResponseDto = {
  timestamp: string;
  overallStatus: ComponentHealthStatus;
  components: Record<string, ComponentOverviewDto>;
  operations: OperationsSummaryDto;
};

export type SelfTestStatus = "PASS" | "FAIL";

export type SelfTestCheckDto = {
  component: string;
  status: SelfTestStatus;
  message?: string | null;
};

export type SystemSelfTestResponseDto = {
  success: boolean;
  checks: SelfTestCheckDto[];
  timestamp: string;
};
