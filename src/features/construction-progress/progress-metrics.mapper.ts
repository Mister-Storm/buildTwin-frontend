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
  deltaAreaFromFirstFlight: number | null;
  currentObservedAreaLabel: string;
  accumulatedEvolutionLabel: string;
  lastEvolutionLabel: string;
  averageGrowthLabel: string;
  estimatedCompletionLabel: string | null;
  dataCoverageLabel: string;
  showEstimatedCompletion: boolean;
};

export type ConstructionProgressHistoryPoint = {
  flightId: string;
  flightDateLabel: string;
  observedAreaSquareMeters: number;
  deltaAreaFromPreviousFlight: number | null;
};

export function mapConstructionProgress(
  dto: ProjectConstructionProgressDto,
): ConstructionProgressViewModel {
  const periodLabel =
    dto.firstFlightDate && dto.lastFlightDate
      ? `${formatDate(parseDateOnly(dto.firstFlightDate))} — ${formatDate(parseDateOnly(dto.lastFlightDate))}`
      : "Sem período";

  return {
    projectId: dto.projectId,
    periodLabel,
    timelineSize: dto.timelineSize,
    currentObservedAreaSquareMeters: dto.currentObservedAreaSquareMeters,
    deltaAreaFromFirstFlight: dto.deltaAreaFromFirstFlight,
    currentObservedAreaLabel: formatObservedArea(dto.currentObservedAreaSquareMeters),
    accumulatedEvolutionLabel: formatAreaDelta(dto.deltaAreaFromFirstFlight),
    lastEvolutionLabel: formatAreaDelta(dto.deltaAreaFromPreviousFlight),
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
    flightId: item.flightId,
    flightDateLabel: formatDate(parseDateOnly(item.flightDate)),
    observedAreaSquareMeters: item.observedAreaSquareMeters,
    deltaAreaFromPreviousFlight: item.deltaAreaFromPreviousFlight,
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
