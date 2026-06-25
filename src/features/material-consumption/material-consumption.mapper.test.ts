import { describe, expect, it } from "vitest";
import { mapConsumptionAnalysisViewModel } from "@/features/material-consumption/material-consumption.mapper";
import type { ProjectMaterialConsumptionDto } from "@/features/material-consumption/material-consumption.api";

const fullDto: ProjectMaterialConsumptionDto = {
  projectId: "proj-1",
  captureSessionAId: "flight-a",
  captureSessionBId: "flight-b",
  analysisGeneratedAt: "2026-06-23T20:00:00Z",
  dataCompleteness: {
    inventoryAvailable: true,
    builtAreaAvailable: true,
  },
  builtAreaAtCaptureSessionA: 1200,
  builtAreaAtCaptureSessionB: 1380,
  builtAreaDelta: 180,
  totalConsumedMaterials: 3000,
  materials: [
    {
      materialType: "BRICK",
      quantityAtCaptureSessionA: 10000,
      quantityAtCaptureSessionB: 7000,
      quantityConsumed: 3000,
      consumptionPerSquareMeter: 16.67,
      unit: "UNIT",
    },
  ],
};

describe("material-consumption.mapper", () => {
  it("formats built area delta and consumption per square meter", () => {
    const viewModel = mapConsumptionAnalysisViewModel(fullDto);

    expect(viewModel.builtAreaDeltaLabel).toBe("180 m²");
    expect(viewModel.totalConsumedMaterialsLabel).toBe("3.000");
    expect(viewModel.builtAreaUnavailableNote).toBeNull();
    expect(viewModel.rows[0]?.materialLabel).toBe("Tijolo");
    expect(viewModel.rows[0]?.consumptionPerSquareMeterLabel).toBe("16,67 un/m²");
  });

  it("shows neutral note when built area is unavailable", () => {
    const viewModel = mapConsumptionAnalysisViewModel({
      ...fullDto,
      builtAreaDelta: null,
      dataCompleteness: {
        inventoryAvailable: true,
        builtAreaAvailable: false,
      },
      materials: [
        {
          ...fullDto.materials[0]!,
          consumptionPerSquareMeter: null,
        },
      ],
    });

    expect(viewModel.builtAreaDeltaLabel).toBe("—");
    expect(viewModel.builtAreaUnavailableNote).toBe(
      "Normalização por m² indisponível — área construída ausente em um dos levantamentos",
    );
    expect(viewModel.rows[0]?.consumptionPerSquareMeterLabel).toBe("—");
  });
});
