import type { ProjectBuiltAreaSnapshotsDto } from "@/types/api/built-area.api";
import type { ProjectConstructionProgressDto } from "@/types/api/construction-progress.api";
import type { ProjectResponseDto } from "@/types/api/project.api";
import { formatAbsolutePercent, formatDate, parseDateOnly } from "@/lib/formatters";

const SOURCE_PRECEDENCE: Record<string, number> = {
  MANUAL: 1,
  ESTIMATED: 2,
  AI_DETECTED: 3,
};

export type VerticalConstructionHistoryRow = {
  flightId: string;
  flightDateLabel: string;
  builtAreaLabel: string;
  floorsLabel: string;
  notesLabel: string;
  source: string;
};

export type VerticalConstructionViewModel = {
  projectId: string;
  currentFloorsLabel: string;
  plannedFloorsLabel: string;
  verticalCompletionLabel: string | null;
  currentBuiltAreaLabel: string;
  averageAreaPerFloorLabel: string;
  plannedAverageAreaPerFloorLabel: string;
  showVerticalCompletion: boolean;
  historyRows: VerticalConstructionHistoryRow[];
  hasSnapshots: boolean;
  sourceLabel: string | null;
  confidenceLabel: string | null;
};

export function mapVerticalConstructionViewModel(
  builtAreaDto: ProjectBuiltAreaSnapshotsDto,
  project: Pick<ProjectResponseDto, "plannedAreaSquareMeters" | "plannedFloors">,
  progress: Pick<
    ProjectConstructionProgressDto,
    | "currentBuiltAreaSquareMeters"
    | "currentObservedFloors"
    | "plannedFloors"
    | "averageAreaPerFloor"
    | "verticalCompletionPercent"
  > | null,
): VerticalConstructionViewModel {
  const plannedFloors = progress?.plannedFloors ?? project.plannedFloors;
  const plannedAverageAreaPerFloor = calculatePlannedAverageAreaPerFloor(
    project.plannedAreaSquareMeters,
    plannedFloors,
  );

  const historyRows = [...builtAreaDto.snapshots]
    .sort(
      (left, right) =>
        parseDateOnly(left.flightDate).getTime() - parseDateOnly(right.flightDate).getTime(),
    )
    .map((snapshot) => ({
      flightId: snapshot.flightId,
      flightDateLabel: formatDate(parseDateOnly(snapshot.flightDate)),
      builtAreaLabel: formatArea(snapshot.observedBuiltAreaSquareMeters),
      floorsLabel:
        snapshot.observedFloors != null
          ? String(snapshot.observedFloors)
          : "Não informado",
      notesLabel: snapshot.notes?.trim() ? snapshot.notes : "—",
      source: formatHistorySourceLabel(snapshot.source),
    }));

  const latestSnapshot = selectLatestSnapshot(builtAreaDto.snapshots);

  return {
    projectId: builtAreaDto.projectId,
    currentFloorsLabel: formatFloors(progress?.currentObservedFloors),
    plannedFloorsLabel: formatFloors(plannedFloors),
    verticalCompletionLabel:
      progress?.verticalCompletionPercent != null
        ? formatAbsolutePercent(progress.verticalCompletionPercent)
        : null,
    showVerticalCompletion: progress?.verticalCompletionPercent != null,
    currentBuiltAreaLabel: formatArea(progress?.currentBuiltAreaSquareMeters),
    averageAreaPerFloorLabel: formatArea(progress?.averageAreaPerFloor),
    plannedAverageAreaPerFloorLabel: formatArea(plannedAverageAreaPerFloor),
    historyRows,
    hasSnapshots: builtAreaDto.snapshots.length > 0,
    sourceLabel: formatSourceLabel(latestSnapshot?.source),
    confidenceLabel: formatConfidenceLabel(latestSnapshot?.confidenceScore),
  };
}

export function selectLatestSnapshot<
  T extends {
    flightDate: string;
    source: string;
    createdAt: string;
    observedBuiltAreaSquareMeters: number;
  },
>(snapshots: T[]): T | null {
  if (snapshots.length === 0) {
    return null;
  }

  return (
    [...snapshots].sort((left, right) => {
      const leftDate = parseDateOnly(left.flightDate).getTime();
      const rightDate = parseDateOnly(right.flightDate).getTime();
      if (leftDate !== rightDate) {
        return rightDate - leftDate;
      }

      const leftSource = SOURCE_PRECEDENCE[left.source] ?? 99;
      const rightSource = SOURCE_PRECEDENCE[right.source] ?? 99;
      if (leftSource !== rightSource) {
        return leftSource - rightSource;
      }

      return right.createdAt.localeCompare(left.createdAt);
    })[0] ?? null
  );
}

export function calculatePlannedAverageAreaPerFloor(
  plannedAreaSquareMeters: number | null | undefined,
  plannedFloors: number | null | undefined,
): number | null {
  if (
    plannedAreaSquareMeters == null ||
    plannedFloors == null ||
    plannedFloors <= 0
  ) {
    return null;
  }
  return Math.round((plannedAreaSquareMeters / plannedFloors) * 10) / 10;
}

function formatArea(value: number | null | undefined): string {
  if (value == null) {
    return "Não disponível";
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} m²`;
}

function formatFloors(value: number | null | undefined): string {
  if (value == null) {
    return "Não informado";
  }
  return String(value);
}

function formatSourceLabel(source: string | undefined): string | null {
  if (!source) {
    return null;
  }
  if (source === "AI_DETECTED") {
    return "Fonte: IA";
  }
  if (source === "ESTIMATED") {
    return "Fonte: Estimada";
  }
  if (source === "MANUAL") {
    return "Fonte: Manual";
  }
  return null;
}

function formatHistorySourceLabel(source: string): string {
  if (source === "AI_DETECTED") {
    return "IA";
  }
  if (source === "ESTIMATED") {
    return "Estimada";
  }
  if (source === "MANUAL") {
    return "Manual";
  }
  return source;
}

function formatConfidenceLabel(confidenceScore: number | null | undefined): string | null {
  if (confidenceScore === null || confidenceScore === undefined) {
    return null;
  }
  return `Confiança: ${Math.round(confidenceScore * 100)}%`;
}
