import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadProjectProgress } from "@/features/construction-progress/load-project-progress";

vi.mock("@/services/construction-progress.service", () => ({
  getConstructionProjectProgress: vi.fn(),
}));

import { getConstructionProjectProgress } from "@/services/construction-progress.service";

describe("loadProjectProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when timeline has data", async () => {
    vi.mocked(getConstructionProjectProgress).mockResolvedValue({
      projectId: "proj-1",
      firstFlightDate: "2026-05-01",
      lastFlightDate: "2026-06-15",
      timelineSize: 2,
      currentObservedAreaSquareMeters: 8421,
      deltaAreaFromPreviousFlight: 210,
      deltaAreaFromFirstFlight: 5120,
      averageGrowthPerDay: 34.2,
      estimatedCompletionPercent: 33.6,
      plannedAreaSquareMeters: 25000,
      dataCoveragePercent: 100,
    });

    const result = await loadProjectProgress("proj-1");

    expect(result.status).toBe("success");
  });

  it("returns empty when timeline size is zero", async () => {
    vi.mocked(getConstructionProjectProgress).mockResolvedValue({
      projectId: "proj-1",
      firstFlightDate: null,
      lastFlightDate: null,
      timelineSize: 0,
      currentObservedAreaSquareMeters: null,
      deltaAreaFromPreviousFlight: null,
      deltaAreaFromFirstFlight: null,
      averageGrowthPerDay: null,
      estimatedCompletionPercent: null,
      plannedAreaSquareMeters: null,
      dataCoveragePercent: 0,
    });

    const result = await loadProjectProgress("proj-1");

    expect(result.status).toBe("empty");
  });
});
