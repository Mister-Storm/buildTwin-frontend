import { describe, expect, it } from "vitest";
import { mapChangeDetectionViewModel } from "@/features/change-detection/change-detection.mapper";
import type { ProjectCompareDto } from "@/types/api/compare.api";

function dto(overrides: Partial<ProjectCompareDto> = {}): ProjectCompareDto {
  return {
    captureSessionA: "flight-a",
    captureSessionB: "flight-b",
    changePercentage: 16.4,
    changedPixels: 102314,
    totalPixels: 182000,
    changeLevel: "LOW",
    comparisonQuality: "NORMAL",
    heatmapArtifactId: "heatmap-1",
    metrics: {
      captureSessionA: { areaSquareMeters: 8000, gsdCmPerPixel: 2.2 },
      captureSessionB: { areaSquareMeters: 9200, gsdCmPerPixel: 2.1 },
    },
    ...overrides,
  };
}

describe("change-detection.mapper", () => {
  it("maps compare dto to view model with preview url", () => {
    const viewModel = mapChangeDetectionViewModel(dto());

    expect(viewModel.changePercentageLabel).toBe("16,4%");
    expect(viewModel.changedPixelsLabel).toBe("102.314");
    expect(viewModel.heatmapPreviewUrl).toBe(
      "/api/artifacts/heatmap-1/preview",
    );
  });

  it("maps LOW comparison quality", () => {
    const viewModel = mapChangeDetectionViewModel(
      dto({ comparisonQuality: "LOW" }),
    );

    expect(viewModel.comparisonQuality).toBe("LOW");
  });
});
