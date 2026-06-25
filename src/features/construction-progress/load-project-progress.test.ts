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
      firstCaptureDate: "2026-05-01",
      lastCaptureDate: "2026-06-15",
      timelineSize: 2,
      currentObservedAreaSquareMeters: 8421,
      deltaAreaFromPreviousCapture: 210,
      deltaAreaFromFirstCapture: 5120,
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
      firstCaptureDate: null,
      lastCaptureDate: null,
      timelineSize: 0,
      currentObservedAreaSquareMeters: null,
      deltaAreaFromPreviousCapture: null,
      deltaAreaFromFirstCapture: null,
      averageGrowthPerDay: null,
      estimatedCompletionPercent: null,
      plannedAreaSquareMeters: null,
      dataCoveragePercent: 0,
    });

    const result = await loadProjectProgress("proj-1");

    expect(result.status).toBe("empty");
  });
});
