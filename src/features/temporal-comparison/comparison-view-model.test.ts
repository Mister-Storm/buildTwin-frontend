import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadComparisonViewModel } from "@/features/temporal-comparison/load-comparison-view-model";

vi.mock("@/services/timeline.service", () => ({
  getProjectTimeline: vi.fn(),
}));

import { getProjectTimeline } from "@/services/timeline.service";

const projectId = "proj-1";

describe("loadComparisonViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auto-selects latest and previous surveys", async () => {
    vi.mocked(getProjectTimeline).mockResolvedValue({
      projectId,
      timeline: [
        {
          sequenceNumber: 1,
          flightId: "flight-old",
          flightDate: "2026-05-01",
          operatorName: "A",
          jobId: "job-1",
          jobStatus: "COMPLETED",
          orthomosaicArtifactId: "ortho-1",
          orthomosaicPreviewArtifactId: "preview-1",
          processingCompletedAt: "2026-05-01T12:00:00Z",
          metrics: { areaSquareMeters: 8000, gsdCmPerPixel: 2.2 },
        },
        {
          sequenceNumber: 2,
          flightId: "flight-new",
          flightDate: "2026-06-15",
          operatorName: "B",
          jobId: "job-2",
          jobStatus: "COMPLETED",
          orthomosaicArtifactId: "ortho-2",
          orthomosaicPreviewArtifactId: "preview-2",
          processingCompletedAt: "2026-06-15T10:00:00Z",
          metrics: { areaSquareMeters: 8421.4, gsdCmPerPixel: 2.1 },
        },
      ],
    });

    const result = await loadComparisonViewModel(projectId);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.viewModel.flightA.flightId).toBe("flight-old");
      expect(result.viewModel.flightB.flightId).toBe("flight-new");
      expect(result.viewModel.deltaAreaLabel).toBe("+421,4 m²");
      expect(result.viewModel.intervalDaysLabel).toBe("45 dias");
    }
  });

  it("returns insufficient state with one processed survey", async () => {
    vi.mocked(getProjectTimeline).mockResolvedValue({
      projectId,
      timeline: [
        {
          sequenceNumber: 1,
          flightId: "flight-only",
          flightDate: "2026-06-01",
          operatorName: "Pilot",
          jobId: "job-1",
          jobStatus: "COMPLETED",
          orthomosaicArtifactId: "ortho-1",
          orthomosaicPreviewArtifactId: "preview-1",
          processingCompletedAt: "2026-06-01T12:00:00Z",
          metrics: null,
        },
      ],
    });

    const result = await loadComparisonViewModel(projectId);

    expect(result.status).toBe("insufficient");
    expect(result.message).toContain("dois levantamentos");
  });

  it("returns empty state when timeline has no items", async () => {
    vi.mocked(getProjectTimeline).mockResolvedValue({ projectId, timeline: [] });

    const result = await loadComparisonViewModel(projectId);

    expect(result.status).toBe("empty");
  });
});
