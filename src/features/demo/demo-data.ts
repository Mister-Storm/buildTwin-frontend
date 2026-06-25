import type { ProjectDashboardDto } from "@/types/api/dashboard.api";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";
import type { ProjectResponseDto } from "@/types/api/project.api";
import {
  DEMO_FLIGHT_ID,
  DEMO_JOB_ID,
  DEMO_PREVIEW_ARTIFACT_ID,
  DEMO_PROJECT_ID,
} from "@/features/demo/demo-seed";

/** Legacy demo fixtures — not used in production navigation (Sprint 6). */
export const DEMO_PROJECT_DTO: ProjectResponseDto = {
  id: DEMO_PROJECT_ID,
  companyId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  name: "Riverside Tower",
  location: {
    address: "1200 Congress Ave",
    city: "Austin",
    state: "TX",
    country: "USA",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  startDate: "2026-01-15",
  createdAt: "2026-01-15T10:00:00Z",
  archivedAt: null,
  plannedAreaSquareMeters: 25_000,
  plannedFloors: 12,
  projectType: "RESIDENTIAL_BUILDING",
  plannedCompletionDate: null,
};

export const DEMO_FLIGHTS_DTO: ProjectCaptureSessionListItemDto[] = [
  {
    captureSessionId: DEMO_FLIGHT_ID,
    captureDate: "2026-06-12",
    operatorName: "Jane Doe",
    imageCount: 42,
    latestProcessingStatus: "COMPLETED",
    latestJobId: DEMO_JOB_ID,
  },
];

export const DEMO_DASHBOARD_DTO: ProjectDashboardDto = {
  projectId: DEMO_PROJECT_ID,
  projectName: "Riverside Tower",
  archived: false,
  totalCaptureSessions: 1,
  captureSessionsByStatus: { COMPLETED: 1 },
  processedCaptureSessions: 1,
  pendingCaptureSessions: 0,
  failedCaptureSessions: 0,
  latestCaptureSessionDate: "2026-06-12",
  recentCaptureSessions: [
    {
      captureSessionId: DEMO_FLIGHT_ID,
      captureDate: "2026-06-12",
      imageCount: 42,
      latestProcessingStatus: "COMPLETED",
      latestJobId: DEMO_JOB_ID,
      hasReport: true,
    },
  ],
};

export const DEMO_PROJECTS_DTO: ProjectResponseDto[] = [DEMO_PROJECT_DTO];

export { DEMO_PREVIEW_ARTIFACT_ID };
