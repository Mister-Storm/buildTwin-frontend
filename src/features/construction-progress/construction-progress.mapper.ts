import type {
  ConstructionProgressSnapshotDto,
  ProjectConstructionProgressTimelineDto,
} from "@/types/api/construction-progress.api";
import { formatDate, formatPercent, parseDateOnly } from "@/lib/formatters";

export type ConstructionProgressSnapshotViewModel = {
  captureSessionSequence: number;
  captureSessionId: string;
  captureDateLabel: string;
  occupiedAreaSquareMeters: number | null;
  occupiedAreaLabel: string;
  footprintIndex: number | null;
  footprintIndexLabel: string;
  visualChangeIndex: number | null;
  visualChangeLabel: string;
};

export type ConstructionProgressTimelineViewModel = {
  projectId: string;
  timeline: ConstructionProgressSnapshotViewModel[];
  latest: ConstructionProgressSnapshotViewModel | null;
  footprintGrowthSincePreviousLabel: string;
  chartPoints: Array<{
    captureDateLabel: string;
    footprintIndex: number;
  }>;
};

export function mapConstructionProgressTimeline(
  dto: ProjectConstructionProgressTimelineDto,
): ConstructionProgressTimelineViewModel {
  const timeline = dto.timeline.map(mapSnapshot);
  const latest = timeline.at(-1) ?? null;
  const previous = timeline.length >= 2 ? timeline.at(-2) ?? null : null;

  return {
    projectId: dto.projectId,
    timeline,
    latest,
    footprintGrowthSincePreviousLabel: formatFootprintGrowth(
      latest?.footprintIndex ?? null,
      previous?.footprintIndex ?? null,
      latest?.occupiedAreaSquareMeters ?? null,
      previous?.occupiedAreaSquareMeters ?? null,
    ),
    chartPoints: timeline
      .filter(
        (point): point is ConstructionProgressSnapshotViewModel & { footprintIndex: number } =>
          point.footprintIndex !== null,
      )
      .map((point) => ({
        captureDateLabel: point.captureDateLabel,
        footprintIndex: point.footprintIndex,
      })),
  };
}

function mapSnapshot(
  snapshot: ConstructionProgressSnapshotDto,
): ConstructionProgressSnapshotViewModel {
  return {
    captureSessionSequence: snapshot.captureSessionSequence,
    captureSessionId: snapshot.captureSessionId,
    captureDateLabel: formatDate(parseDateOnly(snapshot.captureDate)),
    occupiedAreaSquareMeters: snapshot.occupiedAreaSquareMeters,
    occupiedAreaLabel: formatOccupiedArea(snapshot.occupiedAreaSquareMeters),
    footprintIndex: snapshot.footprintIndex,
    footprintIndexLabel: formatFootprintIndex(snapshot.footprintIndex),
    visualChangeIndex: snapshot.visualChangeIndex,
    visualChangeLabel: formatVisualChange(snapshot.visualChangeIndex),
  };
}

function formatOccupiedArea(value: number | null): string {
  if (value === null) {
    return "Não disponível";
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} m²`;
}

function formatFootprintIndex(value: number | null): string {
  if (value === null) {
    return "Não disponível";
  }
  return `${(value * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}%`;
}

function formatVisualChange(value: number | null): string {
  if (value === null) {
    return "Não disponível";
  }
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatFootprintGrowth(
  latestFootprintIndex: number | null,
  previousFootprintIndex: number | null,
  latestArea: number | null,
  previousArea: number | null,
): string {
  if (latestFootprintIndex !== null && previousFootprintIndex !== null) {
    const deltaPoints = (latestFootprintIndex - previousFootprintIndex) * 100;
    return formatPercent(deltaPoints);
  }
  if (latestArea !== null && previousArea !== null && previousArea > 0) {
    const deltaPercent = ((latestArea - previousArea) / previousArea) * 100;
    return formatPercent(deltaPercent);
  }
  return "Não disponível";
}
