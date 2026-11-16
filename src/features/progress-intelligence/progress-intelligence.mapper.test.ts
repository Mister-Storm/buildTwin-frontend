import { describe, expect, it } from "vitest";
import { mapProgressIntelligence } from "@/features/progress-intelligence/progress-intelligence.mapper";
import type { VisualProgressIntelligenceDto } from "@/types/api/visual-progress-intelligence.api";

const availableDto: VisualProgressIntelligenceDto = {
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
};

describe("mapProgressIntelligence", () => {
  it("maps API response to view model labels", () => {
    const viewModel = mapProgressIntelligence(availableDto);

    expect(viewModel.evidenceStatus).toBe("AVAILABLE");
    expect(viewModel.changePercentageLabel).toBe("24,3%");
    expect(viewModel.classification).toBe("MEDIUM");
    expect(viewModel.classificationLabel).toBe("MEDIUM");
    expect(viewModel.averageDailyChangeLabel).toBe("1,73% ao dia");
    expect(viewModel.periodLabel).toBe("14 dias");
    expect(viewModel.reasonLabel).toBeNull();
    expect(viewModel.insightEligible).toBe(true);
  });

  it("should withhold visual figures when evidence status is unavailable", () => {
    const sut = mapProgressIntelligence({
      ...availableDto,
      changePercentage: null,
      averageDailyChange: null,
      confidenceScore: null,
      classification: "LOW",
      evidenceStatus: "UNAVAILABLE",
      unavailableReason: "COMPARISON_QUALITY_LOW",
    });

    expect(sut.changePercentageLabel).toBe("Não disponível");
    expect(sut.averageDailyChangeLabel).toBe("Não disponível");
    expect(sut.classificationLabel).toBe("Não disponível");
    expect(sut.insightEligible).toBe(false);
    expect(sut.reasonLabel).toContain("qualidade");
    expect(sut.periodLabel).toBe("14 dias");
  });

  it("should not render wire zeros as measurements when evidence status is inconclusive", () => {
    const sut = mapProgressIntelligence({
      ...availableDto,
      changePercentage: 0,
      averageDailyChange: 0,
      confidenceScore: 0,
      classification: "LOW",
      evidenceStatus: "INCONCLUSIVE",
      unavailableReason: "INCONCLUSIVE_RECONSTRUCTION_VARIABILITY",
    });

    expect(sut.changePercentageLabel).toBe("Inconclusivo");
    expect(sut.averageDailyChangeLabel).toBe("Inconclusivo");
    expect(sut.classificationLabel).toBe("Inconclusivo");
    expect(sut.insightEligible).toBe(false);
    expect(sut.reasonLabel).toContain("variabilidade");
  });

  it("should keep an observed zero visual change when evidence status is available", () => {
    const sut = mapProgressIntelligence({
      ...availableDto,
      changePercentage: 0,
      averageDailyChange: 0,
      classification: "LOW",
    });

    expect(sut.changePercentageLabel).toBe("0,0%");
    expect(sut.averageDailyChangeLabel).toBe("0,00% ao dia");
    expect(sut.insightEligible).toBe(true);
  });

  it("should treat available status as unavailable when the change percentage is missing", () => {
    const sut = mapProgressIntelligence({
      ...availableDto,
      changePercentage: null,
      averageDailyChange: null,
    });

    expect(sut.evidenceStatus).toBe("UNAVAILABLE");
    expect(sut.changePercentageLabel).toBe("Não disponível");
    expect(sut.insightEligible).toBe(false);
  });

  it("should show an unknown reason code verbatim when the reason is not recognised", () => {
    const sut = mapProgressIntelligence({
      ...availableDto,
      changePercentage: null,
      averageDailyChange: null,
      evidenceStatus: "UNAVAILABLE",
      unavailableReason: "SOMETHING_NEW",
    });

    expect(sut.reasonLabel).toContain("SOMETHING_NEW");
  });

  it("should not render a measured period when the day count is not finite", () => {
    const sut = mapProgressIntelligence({
      ...availableDto,
      deltaDays: Number.NaN,
    });

    expect(sut.periodLabel).toBe("Período não disponível");
  });
});
