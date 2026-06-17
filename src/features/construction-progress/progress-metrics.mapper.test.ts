import { describe, expect, it } from "vitest";
import {
  mapConstructionProgress,
  mapConstructionProgressHistory,
  formatParticipationPercent,
} from "@/features/construction-progress/progress-metrics.mapper";

describe("mapConstructionProgress", () => {
  it("maps construction progress dto to view model labels", () => {
    const viewModel = mapConstructionProgress({
      projectId: "proj-1",
      firstFlightDate: "2026-05-01",
      lastFlightDate: "2026-06-15",
      timelineSize: 2,
      currentObservedAreaSquareMeters: 8421,
      deltaAreaFromPreviousFlight: 210,
      deltaAreaFromFirstFlight: 5120,
      averageGrowthPerDay: 34.2,
      estimatedCompletionPercent: 108,
      plannedAreaSquareMeters: 10000,
      dataCoveragePercent: 100,
    });

    expect(viewModel.currentObservedAreaLabel).toBe("8.421 m²");
    expect(viewModel.accumulatedEvolutionLabel).toBe("+5.120 m²");
    expect(viewModel.showEstimatedCompletion).toBe(true);
    expect(viewModel.estimatedCompletionLabel).toBe("+108,0%");
    expect(viewModel.deltaAreaFromFirstFlight).toBe(5120);
  });

  it("hides estimated completion when planned area is absent", () => {
    const viewModel = mapConstructionProgress({
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

    expect(viewModel.showEstimatedCompletion).toBe(false);
  });
});

describe("mapConstructionProgressHistory", () => {
  it("maps history items with backend deltas", () => {
    const history = mapConstructionProgressHistory({
      projectId: "proj-1",
      history: [
        {
          flightId: "f1",
          flightDate: "2026-05-01",
          observedAreaSquareMeters: 3200,
          deltaAreaFromPreviousFlight: null,
        },
        {
          flightId: "f2",
          flightDate: "2026-06-01",
          observedAreaSquareMeters: 3380,
          deltaAreaFromPreviousFlight: 180,
        },
      ],
    });

    expect(history).toHaveLength(2);
    expect(history[1]?.deltaAreaFromPreviousFlight).toBe(180);
  });
});

describe("formatParticipationPercent", () => {
  it("calculates participation from comparison and accumulated deltas", () => {
    expect(formatParticipationPercent(210, 5120)).toBe("+4,1%");
  });

  it("returns unavailable when accumulated delta is not positive", () => {
    expect(formatParticipationPercent(210, null)).toBe("Não disponível");
  });
});
