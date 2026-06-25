import { describe, expect, it } from "vitest";
import {
  mapForecastConfidenceVariant,
  mapForecastIntelligenceViewModel,
  mapScheduleRiskVariant,
  mapVelocityTrendVariant,
} from "@/features/forecast-intelligence/forecast-intelligence.mapper";
import type { ConstructionForecastDto } from "@/features/forecast-intelligence/forecast-intelligence.api";
import { sampleForecastExplanationDto } from "@/features/explainability/explainability.test-fixtures";

const fullDto: ConstructionForecastDto = {
  projectId: "project-1",
  estimatedCompletionDate: "2027-06-15",
  remainingDays: 120,
  projectedCompletionPercentAtPlannedDate: 88.5,
  predictedCompletionDate: "2027-06-15",
  scheduleRisk: "ATTENTION",
  confidence: "MEDIUM",
  averageBuiltAreaVelocity: 5.8,
  averageFloorVelocity: 0.06,
  velocityTrend: "STABLE",
  generatedAt: "2026-06-15T12:00:00Z",
  forecastExplanation: sampleForecastExplanationDto,
};

describe("forecast-intelligence.mapper", () => {
  it("maps classification variants", () => {
    expect(mapForecastConfidenceVariant("HIGH")).toBe("success");
    expect(mapForecastConfidenceVariant("MEDIUM")).toBe("info");
    expect(mapForecastConfidenceVariant("LOW")).toBe("warning");
    expect(mapScheduleRiskVariant("ON_TRACK")).toBe("success");
    expect(mapScheduleRiskVariant("CRITICAL_DELAY")).toBe("error");
    expect(mapVelocityTrendVariant("ACCELERATING")).toBe("success");
    expect(mapVelocityTrendVariant("DECELERATING")).toBe("warning");
  });

  it("maps forecast intelligence view model with formatted date", () => {
    const viewModel = mapForecastIntelligenceViewModel(fullDto);

    expect(viewModel.predictedCompletionDateLabel).toContain("2027");
    expect(viewModel.remainingDaysLabel).toBe("120 dias");
    expect(viewModel.scheduleRiskLabel).toBe("Atenção");
    expect(viewModel.confidenceLabel).toBe("Média");
    expect(viewModel.velocityTrendLabel).toBe("Estável");
    expect(viewModel.projectedPercentAtPlannedLabel).toContain("88");
  });

  it("handles insufficient forecast data", () => {
    const viewModel = mapForecastIntelligenceViewModel({
      ...fullDto,
      estimatedCompletionDate: null,
      predictedCompletionDate: null,
      remainingDays: null,
      scheduleRisk: null,
      velocityTrend: "INSUFFICIENT_DATA",
    });

    expect(viewModel.predictedCompletionDateLabel).toBe("Dados insuficientes");
    expect(viewModel.scheduleRiskLabel).toBeNull();
    expect(viewModel.velocityTrendLabel).toBe("Dados insuficientes");
  });
});
