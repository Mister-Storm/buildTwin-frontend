import type { ProjectDashboardDto } from "@/types/api/dashboard.api";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";
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
};

export const DEMO_FLIGHTS_DTO: ProjectFlightListItemDto[] = [
  {
    flightId: DEMO_FLIGHT_ID,
    flightDate: "2026-06-12",
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
  totalFlights: 1,
  flightsByStatus: { COMPLETED: 1 },
  processedFlights: 1,
  pendingFlights: 0,
  failedFlights: 0,
  latestFlightDate: "2026-06-12",
  recentFlights: [
    {
      flightId: DEMO_FLIGHT_ID,
      flightDate: "2026-06-12",
      imageCount: 42,
      latestProcessingStatus: "COMPLETED",
      latestJobId: DEMO_JOB_ID,
      hasReport: true,
    },
  ],
};

export const DEMO_PROJECTS_DTO: ProjectResponseDto[] = [DEMO_PROJECT_DTO];

export { DEMO_PREVIEW_ARTIFACT_ID };
