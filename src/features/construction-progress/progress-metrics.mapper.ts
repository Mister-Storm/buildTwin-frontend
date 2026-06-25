import type {
  ProjectConstructionProgressDto,
  ProjectProgressHistoryDto,
} from "@/types/api/construction-progress.api";
import { formatAreaDelta, formatGrowthRate, formatPercent, formatDate, parseDateOnly } from "@/lib/formatters";

export type ConstructionProgressViewModel = {
  projectId: string;
  periodLabel: string;
  timelineSize: number;
  currentObservedAreaSquareMeters: number | null;
  deltaAreaFromFirstCapture: number | null;
  currentObservedAreaLabel: string;
  accumulatedEvolutionLabel: string;
  lastEvolutionLabel: string;
  averageGrowthLabel: string;
  estimatedCompletionLabel: string | null;
  dataCoverageLabel: string;
  showEstimatedCompletion: boolean;
};

export type ConstructionProgressHistoryPoint = {
  captureSessionId: string;
  captureDateLabel: string;
  observedAreaSquareMeters: number;
  deltaAreaFromPreviousCapture: number | null;
};

export function mapConstructionProgress(
  dto: ProjectConstructionProgressDto,
): ConstructionProgressViewModel {
  const periodLabel =
    dto.firstCaptureDate && dto.lastCaptureDate
      ? `${formatDate(parseDateOnly(dto.firstCaptureDate))} — ${formatDate(parseDateOnly(dto.lastCaptureDate))}`
      : "Sem período";

  return {
    projectId: dto.projectId,
    periodLabel,
    timelineSize: dto.timelineSize,
    currentObservedAreaSquareMeters: dto.currentObservedAreaSquareMeters,
    deltaAreaFromFirstCapture: dto.deltaAreaFromFirstCapture,
    currentObservedAreaLabel: formatObservedArea(dto.currentObservedAreaSquareMeters),
    accumulatedEvolutionLabel: formatAreaDelta(dto.deltaAreaFromFirstCapture),
    lastEvolutionLabel: formatAreaDelta(dto.deltaAreaFromPreviousCapture),
    averageGrowthLabel: formatGrowthRate(dto.averageGrowthPerDay),
    estimatedCompletionLabel:
      dto.estimatedCompletionPercent !== null
        ? formatPercent(dto.estimatedCompletionPercent)
        : null,
    dataCoverageLabel: formatPercent(dto.dataCoveragePercent),
    showEstimatedCompletion: dto.estimatedCompletionPercent !== null,
  };
}

export function mapConstructionProgressHistory(
  dto: ProjectProgressHistoryDto,
): ConstructionProgressHistoryPoint[] {
  return dto.history.map((item) => ({
    captureSessionId: item.captureSessionId,
    captureDateLabel: formatDate(parseDateOnly(item.captureDate)),
    observedAreaSquareMeters: item.observedAreaSquareMeters,
    deltaAreaFromPreviousCapture: item.deltaAreaFromPreviousCapture,
  }));
}

function formatObservedArea(value: number | null): string {
  if (value === null) {
    return "Não disponível";
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} m²`;
}

export function formatParticipationPercent(
  comparisonDelta: number | null,
  accumulatedDelta: number | null,
): string {
  if (
    comparisonDelta === null ||
    accumulatedDelta === null ||
    accumulatedDelta <= 0
  ) {
    return "Não disponível";
  }
  const percent = (comparisonDelta / accumulatedDelta) * 100;
  return formatPercent(percent);
}
