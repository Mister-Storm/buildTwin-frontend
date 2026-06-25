import type {
  ComparisonViewModel,
  TimelineItemViewModel,
} from "@/features/domain/models/temporal-comparison";
import { computeChangeAnalytics } from "@/features/temporal-comparison/analytics/change-analytics";
import { calculateAreaEvolutionMetrics } from "@/features/progress-intelligence/area-evolution-metrics";
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
    (later.captureDate.getTime() - earlier.captureDate.getTime()) / msPerDay,
  );
}

export { formatIntervalDays } from "@/lib/formatters";

export function buildComparisonViewModel(
  projectId: string,
  captureSessionA: TimelineItemViewModel,
  captureSessionB: TimelineItemViewModel,
): ComparisonViewModel {
  const deltaArea =
    captureSessionA.areaSquareMeters !== null && captureSessionB.areaSquareMeters !== null
      ? captureSessionB.areaSquareMeters - captureSessionA.areaSquareMeters
      : null;

  const deltaGsd =
    captureSessionA.gsdCmPerPixel !== null && captureSessionB.gsdCmPerPixel !== null
      ? captureSessionB.gsdCmPerPixel - captureSessionA.gsdCmPerPixel
      : null;

  const intervalDays = computeIntervalDays(captureSessionA, captureSessionB);

  return {
    projectId,
    captureSessionA,
    captureSessionB,
    deltaAreaLabel:
      deltaArea === null ? UNAVAILABLE : formatSignedDelta(deltaArea, "m²"),
    deltaGsdLabel:
      deltaGsd === null
        ? UNAVAILABLE
        : formatSignedDelta(deltaGsd, "cm/pixel"),
    intervalDaysLabel: formatIntervalDays(intervalDays),
    analytics: computeChangeAnalytics(captureSessionA, captureSessionB),
    areaEvolutionMetrics: calculateAreaEvolutionMetrics(
      captureSessionA.areaSquareMeters,
      captureSessionB.areaSquareMeters,
      captureSessionA.captureDate,
      captureSessionB.captureDate,
    ),
  };
}
