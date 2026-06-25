import type { TimelineItemViewModel } from "@/features/domain/models/temporal-comparison";

export type ChangeSummary =
  | "EXPANDED_COVERAGE"
  | "REDUCED_COVERAGE"
  | "NO_SIGNIFICANT_CHANGE"
  | "INSUFFICIENT_DATA";

export type ChangeAnalytics = {
  captureSessionAId: string;
  captureSessionBId: string;
  daysBetween: number;
  areaA: number | null;
  areaB: number | null;
  areaDelta: number | null;
  areaDeltaPercent: number | null;
  gsdA: number | null;
  gsdB: number | null;
  gsdDelta: number | null;
  summary: ChangeSummary;
};

export type DeltaDirection = "up" | "down" | "stable" | "unknown";

/** Area change above/below this percent is considered significant. */
export const AREA_CHANGE_SIGNIFICANCE_PERCENT = 5;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function computeDaysBetween(
  earlier: TimelineItemViewModel,
  later: TimelineItemViewModel,
): number {
  return Math.round(
    (later.captureDate.getTime() - earlier.captureDate.getTime()) / MS_PER_DAY,
  );
}

export function computeAreaDeltaPercent(
  areaA: number,
  areaB: number,
): number | null {
  if (areaA === 0) {
    return null;
  }
  return ((areaB - areaA) / areaA) * 100;
}

export function classifyChangeSummary(
  areaA: number | null,
  areaB: number | null,
  areaDeltaPercent: number | null,
): ChangeSummary {
  if (areaA === null || areaB === null || areaDeltaPercent === null) {
    return "INSUFFICIENT_DATA";
  }
  if (areaDeltaPercent > AREA_CHANGE_SIGNIFICANCE_PERCENT) {
    return "EXPANDED_COVERAGE";
  }
  if (areaDeltaPercent < -AREA_CHANGE_SIGNIFICANCE_PERCENT) {
    return "REDUCED_COVERAGE";
  }
  return "NO_SIGNIFICANT_CHANGE";
}

export function resolveDeltaDirection(delta: number | null): DeltaDirection {
  if (delta === null) {
    return "unknown";
  }
  if (delta > 0) {
    return "up";
  }
  if (delta < 0) {
    return "down";
  }
  return "stable";
}

/**
 * Computes analytics between two surveys. Expects captureSessionA = earlier, captureSessionB = later.
 */
export function computeChangeAnalytics(
  captureSessionA: TimelineItemViewModel,
  captureSessionB: TimelineItemViewModel,
): ChangeAnalytics {
  const areaA = captureSessionA.areaSquareMeters;
  const areaB = captureSessionB.areaSquareMeters;
  const gsdA = captureSessionA.gsdCmPerPixel;
  const gsdB = captureSessionB.gsdCmPerPixel;

  const areaDelta =
    areaA !== null && areaB !== null ? areaB - areaA : null;
  const areaDeltaPercent =
    areaA !== null && areaB !== null
      ? computeAreaDeltaPercent(areaA, areaB)
      : null;
  const gsdDelta =
    gsdA !== null && gsdB !== null ? gsdB - gsdA : null;

  return {
    captureSessionAId: captureSessionA.captureSessionId,
    captureSessionBId: captureSessionB.captureSessionId,
    daysBetween: computeDaysBetween(captureSessionA, captureSessionB),
    areaA,
    areaB,
    areaDelta,
    areaDeltaPercent,
    gsdA,
    gsdB,
    gsdDelta,
    summary: classifyChangeSummary(areaA, areaB, areaDeltaPercent),
  };
}

export type SurveyEvolution = {
  areaDelta: number | null;
  areaDeltaPercent: number | null;
  summary: ChangeSummary;
};

export function computeSurveyEvolution(
  current: TimelineItemViewModel,
  previous: TimelineItemViewModel | null,
): SurveyEvolution | null {
  if (!previous) {
    return null;
  }
  const analytics = computeChangeAnalytics(previous, current);
  return {
    areaDelta: analytics.areaDelta,
    areaDeltaPercent: analytics.areaDeltaPercent,
    summary: analytics.summary,
  };
}

export function enrichTimelineWithEvolution(
  items: TimelineItemViewModel[],
): Array<TimelineItemViewModel & { evolution: SurveyEvolution | null }> {
  return items.map((item, index) => ({
    ...item,
    evolution: computeSurveyEvolution(item, items[index - 1] ?? null),
  }));
}

export function formatSignedPercent(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const formatted = Math.abs(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  return `${sign}${formatted}%`;
}

export function formatSignedArea(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const formatted = Math.abs(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  return `${sign}${formatted} m²`;
}
