import type {
  ConstructionProgressSnapshotDto,
  ProjectConstructionProgressTimelineDto,
} from "@/types/api/construction-progress.api";
import { formatDate, formatPercent, parseDateOnly } from "@/lib/formatters";

export type ConstructionProgressSnapshotViewModel = {
  flightSequence: number;
  flightId: string;
  flightDateLabel: string;
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
    flightDateLabel: string;
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
        flightDateLabel: point.flightDateLabel,
        footprintIndex: point.footprintIndex,
      })),
  };
}

function mapSnapshot(
  snapshot: ConstructionProgressSnapshotDto,
): ConstructionProgressSnapshotViewModel {
  return {
    flightSequence: snapshot.flightSequence,
    flightId: snapshot.flightId,
    flightDateLabel: formatDate(parseDateOnly(snapshot.flightDate)),
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
