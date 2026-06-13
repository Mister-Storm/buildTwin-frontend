import { describe, expect, it } from "vitest";
import { toProjectDashboardView } from "@/features/domain/mappers/dashboard.mapper";
import type { ProjectDashboardDto } from "@/types/api/dashboard.api";

const dashboardDto: ProjectDashboardDto = {
  projectId: "proj-1",
  projectName: "Obra Teste",
  archived: false,
  totalFlights: 2,
  flightsByStatus: { COMPLETED: 1, CREATED: 1 },
  processedFlights: 1,
  pendingFlights: 1,
  failedFlights: 0,
  latestFlightDate: "2026-06-12",
  recentFlights: [
    {
      flightId: "flight-1",
      flightDate: "2026-06-12",
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

    expect(view.processedFlights).toBe(1);
    expect(view.pendingFlights).toBe(1);
    expect(view.failedFlights).toBe(0);
    expect(view.latestFlightDate?.toISOString()).toContain("2026-06-12");
  });

  it("marks orthomosaic availability on recent flights", () => {
    const view = toProjectDashboardView(
      dashboardDto,
      new Set(["flight-1"]),
    );

    expect(view.recentFlights[0]?.hasOrthomosaic).toBe(true);
  });
});
