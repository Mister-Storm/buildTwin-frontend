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
      evidenceStatus: "AVAILABLE",
      unavailableReason: null,
    });

    const result = await loadProgressIntelligence("proj-1", "flight-a", "flight-b");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.viewModel.changePercentageLabel).toBe("24,3%");
      expect(result.viewModel.classification).toBe("MEDIUM");
    }
  });

  it("should return success with withheld figures when the producer reports unavailable evidence", async () => {
    vi.mocked(getVisualProgressIntelligence).mockResolvedValue({
      captureSessionA: "flight-a",
      captureSessionB: "flight-b",
      changePercentage: null,
      deltaDays: 14,
      averageDailyChange: null,
      classification: "LOW",
      confidenceScore: null,
      trend: "UNKNOWN",
      evidenceStatus: "UNAVAILABLE",
      unavailableReason: "COMPARISON_QUALITY_LOW",
    });

    const sut = await loadProgressIntelligence("proj-1", "flight-a", "flight-b");

    expect(sut.status).toBe("success");
    if (sut.status === "success") {
      expect(sut.viewModel.changePercentageLabel).toBe("Não disponível");
      expect(sut.viewModel.insightEligible).toBe(false);
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
