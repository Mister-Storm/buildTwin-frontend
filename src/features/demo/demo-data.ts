import type { ProjectDashboardDto } from "@/types/api/dashboard.api";
import type { FlightResponseDto } from "@/types/api/flight.api";
import type { ProjectResponseDto } from "@/types/api/project.api";
import {
  DEMO_FLIGHT_ID,
  DEMO_PROJECT_ID,
} from "@/features/demo/demo-seed";

export const DEMO_PROJECT_DTO: ProjectResponseDto = {
  id: DEMO_PROJECT_ID,
  companyId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
  name: "Riverside Tower",
  location: {
    address: "123 Builder Ave",
    city: "Austin",
    state: "TX",
    country: "US",
    latitude: 30.2672,
    longitude: -97.7431,
  },
  startDate: "2026-01-15",
  createdAt: "2026-01-15T10:00:00Z",
  archivedAt: null,
};

export const DEMO_FLIGHTS_DTO: FlightResponseDto[] = [
  {
    id: DEMO_FLIGHT_ID,
    projectId: DEMO_PROJECT_ID,
    flightDate: "2026-06-12",
    operatorName: "Jane Doe",
    status: "COMPLETED",
    imageCount: 42,
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbe",
    projectId: DEMO_PROJECT_ID,
    flightDate: "2026-05-01",
    operatorName: "Jane Doe",
    status: "COMPLETED",
    imageCount: 38,
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbf",
    projectId: DEMO_PROJECT_ID,
    flightDate: "2026-04-01",
    operatorName: "John Smith",
    status: "COMPLETED",
    imageCount: 35,
  },
];

export const DEMO_DASHBOARD_DTO: ProjectDashboardDto = {
  projectId: DEMO_PROJECT_ID,
  projectName: "Riverside Tower",
  archived: false,
  totalFlights: 3,
  flightsByStatus: {
    CREATED: 0,
    UPLOADING: 0,
    PROCESSING: 0,
    COMPLETED: 3,
    FAILED: 0,
  },
  recentFlights: DEMO_FLIGHTS_DTO.map((flight) => ({
    id: flight.id,
    flightDate: flight.flightDate,
    status: flight.status,
    imageCount: flight.imageCount,
    latestJobStatus:
      flight.id === DEMO_FLIGHT_ID ? "COMPLETED" : "COMPLETED",
    hasReport: flight.id === DEMO_FLIGHT_ID,
  })),
};

export const DEMO_PROJECTS_DTO: ProjectResponseDto[] = [DEMO_PROJECT_DTO];
