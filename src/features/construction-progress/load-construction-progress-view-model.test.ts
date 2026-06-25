import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConstructionProgressViewModel } from "@/features/construction-progress/load-construction-progress-view-model";
import { ApiError } from "@/types/api/common.api";

vi.mock("@/services/construction-progress.service", () => ({
  getConstructionProgressTimeline: vi.fn(),
}));

import { getConstructionProgressTimeline } from "@/services/construction-progress.service";

describe("loadConstructionProgressViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when timeline has data", async () => {
    vi.mocked(getConstructionProgressTimeline).mockResolvedValue({
      projectId: "proj-1",
      timeline: [
        {
          captureSessionSequence: 1,
          captureSessionId: "flight-1",
          captureDate: "2026-05-01",
          occupiedAreaSquareMeters: 4000,
          footprintIndex: 1,
          visualChangeIndex: null,
        },
      ],
    });

    const result = await loadConstructionProgressViewModel("proj-1");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.viewModel.latest?.footprintIndexLabel).toBe("100%");
    }
  });

  it("returns empty when timeline is empty", async () => {
    vi.mocked(getConstructionProgressTimeline).mockResolvedValue({
      projectId: "proj-1",
      timeline: [],
    });

    const result = await loadConstructionProgressViewModel("proj-1");

    expect(result.status).toBe("empty");
  });

  it("returns error on API failure", async () => {
    vi.mocked(getConstructionProgressTimeline).mockRejectedValue(
      new ApiError(500, "INTERNAL_ERROR", "Erro"),
    );

    const result = await loadConstructionProgressViewModel("proj-1");

    expect(result.status).toBe("error");
  });
});
