import type { ProjectDashboardDto } from "@/types/api/dashboard.api";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";
import type { ProjectResponseDto } from "@/types/api/project.api";
import {
  DEMO_FLIGHT_ID,
  DEMO_FLIGHT_ID_B,
  DEMO_JOB_ID,
  DEMO_PREVIEW_ARTIFACT_ID,
  DEMO_PROJECT_ID,
} from "@/features/demo/demo-seed";
import type { ProjectWasteAnalysisDto } from "@/features/waste-intelligence/waste-intelligence.api";

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
    captureDate: "2026-05-15",
    operatorName: "Jane Doe",
    imageCount: 38,
    latestProcessingStatus: "COMPLETED",
    latestJobId: DEMO_JOB_ID,
  },
  {
    captureSessionId: DEMO_FLIGHT_ID_B,
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

/** Canned waste analysis for Riverside Tower investor demo (offline). */
export const DEMO_WASTE_ANALYSIS_DTO: ProjectWasteAnalysisDto = {
  projectId: DEMO_PROJECT_ID,
  captureSessionAId: DEMO_FLIGHT_ID,
  captureSessionBId: DEMO_FLIGHT_ID_B,
  builtAreaDelta: 420,
  overallWasteScore: 18.4,
  analysisConfidence: 0.75,
  normalizationType: "AREA_BASED",
  benchmarkVersion: "2026.1",
  constructionType: "RESIDENTIAL_MF",
  dataCompleteness: {
    inventoryAvailable: true,
    builtAreaAvailable: true,
    benchmarksAvailable: true,
  },
  materials: [
    {
      materialType: "BRICK",
      actualPerSquareMeter: 32.5,
      expectedPerSquareMeter: 30.0,
      variancePercent: 8.3,
      classification: "NORMAL",
      benchmarkSource: "TCPO_SINAPI",
      unit: "UNIT",
    },
    {
      materialType: "REBAR",
      actualPerSquareMeter: 14.2,
      expectedPerSquareMeter: 12.0,
      variancePercent: 18.3,
      classification: "WARNING",
      benchmarkSource: "TCPO_SINAPI",
      unit: "KILOGRAM",
    },
    {
      materialType: "CEMENT",
      actualPerSquareMeter: 6.1,
      expectedPerSquareMeter: 6.8,
      variancePercent: -6.2,
      classification: "NORMAL",
      benchmarkSource: "TCPO_SINAPI",
      unit: "BAG",
    },
    {
      materialType: "CONCRETE_BLOCK",
      actualPerSquareMeter: 16.8,
      expectedPerSquareMeter: 14.0,
      variancePercent: 20.0,
      classification: "WARNING",
      benchmarkSource: "TCPO_SINAPI",
      unit: "UNIT",
    },
    {
      materialType: "SAND",
      actualPerSquareMeter: null,
      expectedPerSquareMeter: 0.065,
      variancePercent: null,
      classification: null,
      benchmarkSource: "TCPO_SINAPI",
      unit: "CUBIC_METER",
    },
  ],
};

export { DEMO_PREVIEW_ARTIFACT_ID };
