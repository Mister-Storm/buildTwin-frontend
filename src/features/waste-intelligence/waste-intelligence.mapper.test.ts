import { describe, expect, it } from "vitest";
import { mapWasteIntelligenceViewModel } from "@/features/waste-intelligence/waste-intelligence.mapper";
import { DEMO_WASTE_ANALYSIS_DTO } from "@/features/demo/demo-data";
import type { ProjectWasteAnalysisDto } from "@/features/waste-intelligence/waste-intelligence.api";

const dto: ProjectWasteAnalysisDto = {
  projectId: "proj-1",
  captureSessionAId: "a",
  captureSessionBId: "b",
  builtAreaDelta: 420,
  overallWasteScore: 82,
  analysisConfidence: 0.85,
  normalizationType: "AREA_BASED",
  benchmarkVersion: "2026.1",
  constructionType: "RESIDENTIAL_MF",
  dataCompleteness: {
    inventoryAvailable: true,
    builtAreaAvailable: true,
    benchmarksAvailable: true,
  },
  materials: [
    {
      materialType: "BRICK",
      actualPerSquareMeter: 12.3,
      expectedPerSquareMeter: 10.5,
      variancePercent: 17.1,
      classification: "WARNING",
      benchmarkSource: "SYSTEM_DEFAULT",
      unit: "UNIT",
    },
  ],
};

describe("waste-intelligence.mapper", () => {
  it("formats confidence and benchmark version", () => {
    const viewModel = mapWasteIntelligenceViewModel(dto);
    expect(viewModel.confidenceLabel).toBe("85%");
    expect(viewModel.benchmarkVersionLabel).toBe("2026.1");
    expect(viewModel.wasteScoreLabel).toBe("82");
  });

  it("counts materials at risk", () => {
    const viewModel = mapWasteIntelligenceViewModel(dto);
    expect(viewModel.materialsAtRiskLabel).toBe("1");
    expect(viewModel.criticalMaterialsLabel).toBe("0");
  });

  it("maps demo Riverside waste fixture", () => {
    const viewModel = mapWasteIntelligenceViewModel(DEMO_WASTE_ANALYSIS_DTO);
    expect(viewModel.wasteScoreLabel).toBe("18.4");
    expect(viewModel.materialsAtRiskLabel).toBe("2");
    expect(viewModel.rows.length).toBe(5);
  });
});
