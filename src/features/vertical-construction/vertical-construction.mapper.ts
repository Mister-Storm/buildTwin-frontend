import type { ProjectBuiltAreaSnapshotsDto } from "@/types/api/built-area.api";
import type { ProjectConstructionProgressDto } from "@/types/api/construction-progress.api";
import type { ProjectResponseDto } from "@/types/api/project.api";
import { formatAbsolutePercent, formatDate, parseDateOnly } from "@/lib/formatters";

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
      source: snapshot.source,
    }));

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
  };
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
