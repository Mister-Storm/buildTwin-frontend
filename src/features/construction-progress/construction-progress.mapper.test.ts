import { describe, expect, it } from "vitest";
import { mapConstructionProgressTimeline } from "@/features/construction-progress/construction-progress.mapper";

describe("mapConstructionProgressTimeline", () => {
  it("maps footprint index and visual change labels in sequence order", () => {
    const viewModel = mapConstructionProgressTimeline({
      projectId: "proj-1",
      timeline: [
        {
          captureSessionSequence: 1,
          captureSessionId: "flight-1",
          captureDate: "2026-05-01",
          occupiedAreaSquareMeters: 4000,
          footprintIndex: 0.5,
          visualChangeIndex: null,
        },
        {
          captureSessionSequence: 2,
          captureSessionId: "flight-2",
          captureDate: "2026-06-01",
          occupiedAreaSquareMeters: 8000,
          footprintIndex: 1,
          visualChangeIndex: 18.5,
        },
      ],
    });

    expect(viewModel.timeline).toHaveLength(2);
    expect(viewModel.latest?.footprintIndexLabel).toBe("100%");
    expect(viewModel.latest?.visualChangeLabel).toBe("18,5%");
    expect(viewModel.footprintGrowthSincePreviousLabel).toBe("+50,0%");
    expect(viewModel.chartPoints).toEqual([
      { captureDateLabel: expect.any(String), footprintIndex: 0.5 },
      { captureDateLabel: expect.any(String), footprintIndex: 1 },
    ]);
  });

  it("handles null metrics gracefully", () => {
    const viewModel = mapConstructionProgressTimeline({
      projectId: "proj-1",
      timeline: [
        {
          captureSessionSequence: 1,
          captureSessionId: "flight-1",
          captureDate: "2026-05-01",
          occupiedAreaSquareMeters: null,
          footprintIndex: null,
          visualChangeIndex: null,
        },
      ],
    });

    expect(viewModel.latest?.occupiedAreaLabel).toBe("Não disponível");
    expect(viewModel.latest?.footprintIndexLabel).toBe("Não disponível");
    expect(viewModel.latest?.visualChangeLabel).toBe("Não disponível");
    expect(viewModel.chartPoints).toEqual([]);
  });
});
