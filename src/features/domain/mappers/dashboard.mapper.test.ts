import { describe, expect, it } from "vitest";
import { toProjectDashboardView } from "@/features/domain/mappers/dashboard.mapper";
import type { ProjectDashboardDto } from "@/types/api/dashboard.api";

const dashboardDto: ProjectDashboardDto = {
  projectId: "proj-1",
  projectName: "Obra Teste",
  archived: false,
  totalCaptureSessions: 2,
  captureSessionsByStatus: { COMPLETED: 1, CREATED: 1 },
  processedCaptureSessions: 1,
  pendingCaptureSessions: 1,
  failedCaptureSessions: 0,
  latestCaptureSessionDate: "2026-06-12",
  recentCaptureSessions: [
    {
      captureSessionId: "flight-1",
      captureDate: "2026-06-12",
      imageCount: 10,
      latestProcessingStatus: "COMPLETED",
      latestJobId: "job-1",
      hasReport: true,
    },
  ],
};

describe("toProjectDashboardView", () => {
  it("maps dashboard KPIs from API", () => {
    const view = toProjectDashboardView(dashboardDto, new Set());

    expect(view.processedCaptureSessions).toBe(1);
    expect(view.pendingCaptureSessions).toBe(1);
    expect(view.failedCaptureSessions).toBe(0);
    expect(view.latestCaptureSessionDate?.toISOString()).toContain("2026-06-12");
  });

  it("marks orthomosaic availability on recent captureSessions", () => {
    const view = toProjectDashboardView(
      dashboardDto,
      new Set(["flight-1"]),
    );

    expect(view.recentCaptureSessions[0]?.hasOrthomosaic).toBe(true);
  });
});
