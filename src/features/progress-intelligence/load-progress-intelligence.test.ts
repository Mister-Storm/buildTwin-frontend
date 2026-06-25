import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadProgressIntelligence } from "@/features/progress-intelligence/load-progress-intelligence";

vi.mock("@/services/progress-intelligence.service", () => ({
  getVisualProgressIntelligence: vi.fn(),
}));

import { getVisualProgressIntelligence } from "@/services/progress-intelligence.service";

describe("loadProgressIntelligence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success with mapped view model", async () => {
    vi.mocked(getVisualProgressIntelligence).mockResolvedValue({
      captureSessionA: "flight-a",
      captureSessionB: "flight-b",
      changePercentage: 24.3,
      deltaDays: 14,
      averageDailyChange: 1.73,
      classification: "MEDIUM",
      confidenceScore: 1.0,
      trend: "UNKNOWN",
    });

    const result = await loadProgressIntelligence("proj-1", "flight-a", "flight-b");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.viewModel.changePercentageLabel).toBe("24,3%");
      expect(result.viewModel.classification).toBe("MEDIUM");
    }
  });

  it("returns unavailable on 404", async () => {
    const { ApiError } = await import("@/types/api/common.api");
    vi.mocked(getVisualProgressIntelligence).mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "Not found"),
    );

    const result = await loadProgressIntelligence("proj-1", "flight-a", "flight-b");

    expect(result.status).toBe("unavailable");
  });
});
