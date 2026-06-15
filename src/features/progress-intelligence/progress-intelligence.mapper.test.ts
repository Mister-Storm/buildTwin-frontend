import { describe, expect, it } from "vitest";
import { mapProgressIntelligence } from "@/features/progress-intelligence/progress-intelligence.mapper";

describe("mapProgressIntelligence", () => {
  it("maps API response to view model labels", () => {
    const viewModel = mapProgressIntelligence({
      flightA: "flight-a",
      flightB: "flight-b",
      changePercentage: 24.3,
      deltaDays: 14,
      averageDailyChange: 1.73,
      classification: "MEDIUM",
      confidenceScore: 1.0,
      trend: "UNKNOWN",
    });

    expect(viewModel.changePercentageLabel).toBe("24,3%");
    expect(viewModel.classification).toBe("MEDIUM");
    expect(viewModel.classificationLabel).toBe("MEDIUM");
    expect(viewModel.averageDailyChangeLabel).toBe("1,73% ao dia");
    expect(viewModel.periodLabel).toBe("14 dias");
  });
});
