import type {
  BuiltAreaObservationLineageDto,
  ProjectConstructionProgressDto,
  ProjectProgressHistoryDto,
} from "@/types/api/construction-progress.api";
import {
  formatAreaDelta,
  formatDate,
  formatDateTime,
  formatGrowthRate,
  formatPercent,
  parseDateOnly,
} from "@/lib/formatters";

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
  builtAreaLabel: string;
  builtAreaObservationLabel: string | null;
  builtAreaBaselineLabel: string | null;
  builtAreaDeltaFromFirstLabel: string;
  builtAreaDeltaFromPreviousLabel: string;
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
    builtAreaLabel: formatObservedArea(dto.currentBuiltAreaSquareMeters ?? null),
    builtAreaObservationLabel: formatObservationLineage(dto.builtAreaObservation ?? null),
    builtAreaBaselineLabel: formatObservationLineage(dto.builtAreaBaselineObservation ?? null),
    builtAreaDeltaFromFirstLabel: formatAreaDelta(
      dto.builtAreaDeltaFromFirstCaptureSquareMeters ?? null,
    ),
    builtAreaDeltaFromPreviousLabel: formatAreaDelta(
      dto.builtAreaDeltaFromPreviousCaptureSquareMeters ?? null,
    ),
  };
}

const OBSERVATION_SOURCE_LABELS: Record<BuiltAreaObservationLineageDto["source"], string> = {
  MANUAL: "Manual",
  ESTIMATED: "Estimado",
  AI_DETECTED: "Detecção por IA",
};

function formatObservationLineage(lineage: BuiltAreaObservationLineageDto | null): string | null {
  if (lineage === null) {
    return null;
  }
  const parts = [
    OBSERVATION_SOURCE_LABELS[lineage.source] ?? lineage.source,
    `levantamento de ${formatDate(parseDateOnly(lineage.captureDate))}`,
  ];
  if (lineage.revisionNumber !== null) {
    parts.push(`revisão ${lineage.revisionNumber}`);
  }
  const recordedAt = new Date(lineage.recordedAt);
  if (!Number.isNaN(recordedAt.getTime())) {
    parts.push(`registrado em ${formatDateTime(recordedAt)}`);
  }
  if (lineage.recordedBy?.trim()) {
    parts.push(`por ${lineage.recordedBy}`);
  }
  return parts.join(" · ");
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
