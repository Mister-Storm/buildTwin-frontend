import { describe, expect, it } from "vitest";
import {
  classifyChangeSummary,
  computeAreaDeltaPercent,
  computeChangeAnalytics,
  computeSurveyEvolution,
  enrichTimelineWithEvolution,
} from "@/features/temporal-comparison/analytics/change-analytics";
import type { TimelineItemViewModel } from "@/features/domain/models/temporal-comparison";
import { parseDateOnly } from "@/lib/formatters";

function item(
  captureSessionId: string,
  date: string,
  area: number | null,
  gsd: number | null = 2.0,
  sequenceNumber = 1,
): TimelineItemViewModel {
  return {
    sequenceNumber,
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

describe("change-analytics", () => {
  it("classifies expanded coverage above 5%", () => {
    expect(classifyChangeSummary(8000, 9000, 12.5)).toBe("EXPANDED_COVERAGE");
  });

  it("classifies reduced coverage below -5%", () => {
    expect(classifyChangeSummary(9000, 8000, -11.1)).toBe("REDUCED_COVERAGE");
  });

  it("classifies stable coverage within ±5%", () => {
    expect(classifyChangeSummary(8000, 8200, 2.5)).toBe("NO_SIGNIFICANT_CHANGE");
  });

  it("returns insufficient data when area is missing", () => {
    expect(classifyChangeSummary(null, 8000, null)).toBe("INSUFFICIENT_DATA");
  });

  it("computes full analytics for growth scenario", () => {
    const analytics = computeChangeAnalytics(
      item("a", "2026-05-01", 8000, 2.2, 1),
      item("b", "2026-06-15", 8421.4, 2.1, 2),
    );

    expect(analytics.daysBetween).toBe(45);
    expect(analytics.areaDelta).toBeCloseTo(421.4, 1);
    expect(analytics.areaDeltaPercent).toBeCloseTo(5.27, 1);
    expect(analytics.gsdDelta).toBeCloseTo(-0.1, 1);
    expect(analytics.summary).toBe("EXPANDED_COVERAGE");
  });

  it("computes reduction scenario", () => {
    const analytics = computeChangeAnalytics(
      item("a", "2026-05-01", 9000, 2.0),
      item("b", "2026-06-01", 8000, 2.0),
    );

    expect(analytics.areaDelta).toBe(-1000);
    expect(analytics.summary).toBe("REDUCED_COVERAGE");
  });

  it("enriches timeline with evolution vs previous survey", () => {
    const enriched = enrichTimelineWithEvolution([
      item("a", "2026-05-01", 8000, 2.2, 1),
      item("b", "2026-06-01", 8960, 2.1, 2),
    ]);

    expect(enriched[0]?.evolution).toBeNull();
    expect(enriched[1]?.evolution?.areaDelta).toBe(960);
    expect(enriched[1]?.evolution?.areaDeltaPercent).toBe(12);
    expect(enriched[1]?.evolution?.summary).toBe("EXPANDED_COVERAGE");
  });

  it("returns null percent when baseline area is zero", () => {
    expect(computeAreaDeltaPercent(0, 100)).toBeNull();
    expect(
      computeSurveyEvolution(
        item("b", "2026-06-01", 100),
        item("a", "2026-05-01", 0),
      )?.summary,
    ).toBe("INSUFFICIENT_DATA");
  });
});
