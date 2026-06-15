import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadChangeDetection } from "@/features/change-detection/load-change-detection";

vi.mock("@/services/compare.service", () => ({
  getProjectCompare: vi.fn(),
}));

import { getProjectCompare } from "@/services/compare.service";

describe("loadChangeDetection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success with mapped view model", async () => {
    vi.mocked(getProjectCompare).mockResolvedValue({
      flightA: "flight-a",
      flightB: "flight-b",
      changePercentage: 62.1,
      changedPixels: 1000,
      totalPixels: 1600,
      changeLevel: "VERY_HIGH",
      comparisonQuality: "NORMAL",
      heatmapArtifactId: "heatmap-1",
      metrics: {
        flightA: { areaSquareMeters: 8000, gsdCmPerPixel: 2.2 },
        flightB: { areaSquareMeters: 9200, gsdCmPerPixel: 2.1 },
      },
    });

    const result = await loadChangeDetection("proj-1", "flight-a", "flight-b");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.viewModel.changePercentageLabel).toBe("62,1%");
    }
  });

  it("returns unavailable on 404", async () => {
    const { ApiError } = await import("@/types/api/common.api");
    vi.mocked(getProjectCompare).mockRejectedValue(new ApiError(404, "NOT_FOUND", "Not found"));

    const result = await loadChangeDetection("proj-1", "flight-a", "flight-b");

    expect(result.status).toBe("unavailable");
  });
});
