import { describe, expect, it } from "vitest";
import {
  buildComparisonViewModel,
  computeIntervalDays,
  formatIntervalDays,
} from "@/features/temporal-comparison/comparison-metrics.mapper";
import type { TimelineItemViewModel } from "@/features/domain/models/temporal-comparison";
import { parseDateOnly } from "@/lib/formatters";

function item(
  captureSessionId: string,
  date: string,
  area: number | null,
  gsd: number | null,
): TimelineItemViewModel {
  return {
    sequenceNumber: 1,
    captureSessionId,
    captureDate: parseDateOnly(date),
    captureDateLabel: date,
    operatorName: "Pilot",
    previewUrl: `/preview/${captureSessionId}`,
    areaLabel: area === null ? null : `${area} m²`,
    gsdLabel: gsd === null ? null : `${gsd} cm/pixel`,
    areaSquareMeters: area,
    gsdCmPerPixel: gsd,
  };
}

describe("comparison-metrics.mapper", () => {
  it("computes positive area delta from older to newer survey", () => {
    const viewModel = buildComparisonViewModel(
      "proj-1",
      item("a", "2026-05-01", 8000, 2.2),
      item("b", "2026-06-15", 8421.4, 2.1),
    );

    expect(viewModel.deltaAreaLabel).toBe("+421,4 m²");
    expect(viewModel.deltaGsdLabel).toBe("−0,1 cm/pixel");
  });

  it("computes interval days between flight dates", () => {
    const days = computeIntervalDays(
      item("a", "2026-05-01", null, null),
      item("b", "2026-06-15", null, null),
    );

    expect(days).toBe(45);
    expect(formatIntervalDays(days)).toBe("45 dias");
  });
});
