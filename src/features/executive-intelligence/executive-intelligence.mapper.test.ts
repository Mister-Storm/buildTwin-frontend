import { describe, expect, it } from "vitest";
import {
  mapExecutiveIntelligenceViewModel,
  mapHealthClassificationVariant,
  mapHealthScoreBreakdown,
  mapProductivityClassificationVariant,
} from "@/features/executive-intelligence/executive-intelligence.mapper";
import type { ExecutiveConstructionIntelligenceDto } from "@/features/executive-intelligence/executive-intelligence.api";
import { sampleMetricExplanationDto } from "@/features/explainability/explainability.test-fixtures";

const fullDto: ExecutiveConstructionIntelligenceDto = {
  projectId: "project-1",
  constructionHealthScore: 82,
  classification: "GOOD",
  healthScoreBreakdown: {
    resourceEfficiencyScore: 90,
    builtAreaProgressScore: 80,
    verticalProgressScore: 70,
    dataCompletenessScore: 100,
  },
  productivityIndex: 0.06,
  productivityClassification: "NORMAL",
  builtAreaVelocity: 8.9,
  floorVelocity: 0.12,
  wasteTrend: "IMPROVING",
  generatedAt: "2026-06-15T12:00:00Z",
  healthExplanation: sampleMetricExplanationDto,
};

describe("executive-intelligence.mapper", () => {
  it("maps health score breakdown labels", () => {
    expect(mapHealthScoreBreakdown(fullDto.healthScoreBreakdown)).toEqual({
      resourceEfficiencyScoreLabel: "90",
      builtAreaProgressScoreLabel: "80",
      verticalProgressScoreLabel: "70",
      dataCompletenessScoreLabel: "100",
    });
  });

  it("maps health and productivity classification variants", () => {
    expect(mapHealthClassificationVariant("EXCELLENT")).toBe("success");
    expect(mapHealthClassificationVariant("GOOD")).toBe("info");
    expect(mapProductivityClassificationVariant("HIGH")).toBe("success");
    expect(mapProductivityClassificationVariant("NORMAL")).toBe("info");
    expect(mapProductivityClassificationVariant("LOW")).toBe("warning");
  });

  it("maps executive intelligence view model", () => {
    const viewModel = mapExecutiveIntelligenceViewModel(fullDto);

    expect(viewModel.constructionHealthScoreLabel).toBe("82");
    expect(viewModel.healthClassificationLabel).toBe("Bom");
    expect(viewModel.productivityClassificationLabel).toBe("Normal");
    expect(viewModel.builtAreaVelocityLabel).toContain("m²/dia");
    expect(viewModel.wasteTrendLabel).toBe("Melhorando");
    expect(viewModel.healthScoreBreakdown.resourceEfficiencyScoreLabel).toBe("90");
  });
});
