import type {
  ComparisonViewModel,
  TimelineItemViewModel,
} from "@/features/domain/models/temporal-comparison";
import { computeChangeAnalytics } from "@/features/temporal-comparison/analytics/change-analytics";
import { calculateProgressMetrics } from "@/features/progress-intelligence/progress-metrics";
import { formatIntervalDays } from "@/lib/formatters";

const UNAVAILABLE = "Não disponível";

function formatSignedDelta(value: number, suffix: string): string {
  const formatted = Math.abs(value).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatted} ${suffix}`.trim();
}

export function computeIntervalDays(
  earlier: TimelineItemViewModel,
  later: TimelineItemViewModel,
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (later.flightDate.getTime() - earlier.flightDate.getTime()) / msPerDay,
  );
}

export { formatIntervalDays } from "@/lib/formatters";

export function buildComparisonViewModel(
  projectId: string,
  flightA: TimelineItemViewModel,
  flightB: TimelineItemViewModel,
): ComparisonViewModel {
  const deltaArea =
    flightA.areaSquareMeters !== null && flightB.areaSquareMeters !== null
      ? flightB.areaSquareMeters - flightA.areaSquareMeters
      : null;

  const deltaGsd =
    flightA.gsdCmPerPixel !== null && flightB.gsdCmPerPixel !== null
      ? flightB.gsdCmPerPixel - flightA.gsdCmPerPixel
      : null;

  const intervalDays = computeIntervalDays(flightA, flightB);

  return {
    projectId,
    flightA,
    flightB,
    deltaAreaLabel:
      deltaArea === null ? UNAVAILABLE : formatSignedDelta(deltaArea, "m²"),
    deltaGsdLabel:
      deltaGsd === null
        ? UNAVAILABLE
        : formatSignedDelta(deltaGsd, "cm/pixel"),
    intervalDaysLabel: formatIntervalDays(intervalDays),
    analytics: computeChangeAnalytics(flightA, flightB),
    progressMetrics: calculateProgressMetrics(
      flightA.areaSquareMeters,
      flightB.areaSquareMeters,
      flightA.flightDate,
      flightB.flightDate,
    ),
  };
}
