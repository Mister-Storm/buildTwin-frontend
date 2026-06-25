import type { ProjectBuiltAreaSnapshotsDto } from "@/types/api/built-area.api";
import type { ProjectResponseDto } from "@/types/api/project.api";
import { formatDate, formatPercent, parseDateOnly } from "@/lib/formatters";

const SOURCE_PRECEDENCE: Record<string, number> = {
  MANUAL: 1,
  ESTIMATED: 2,
  AI_DETECTED: 3,
};

export type BuiltAreaChartPoint = {
  captureSessionId: string;
  captureDateLabel: string;
  observedBuiltAreaSquareMeters: number;
};

export type BuiltAreaViewModel = {
  projectId: string;
  currentBuiltAreaSquareMeters: number | null;
  currentBuiltAreaLabel: string;
  plannedAreaSquareMeters: number | null;
  plannedAreaLabel: string;
  completionPercent: number | null;
  completionLabel: string | null;
  showCompletion: boolean;
  chartPoints: BuiltAreaChartPoint[];
  hasSnapshots: boolean;
  sourceLabel: string | null;
  confidenceLabel: string | null;
};

export function mapBuiltAreaViewModel(
  builtAreaDto: ProjectBuiltAreaSnapshotsDto,
  project: Pick<ProjectResponseDto, "plannedAreaSquareMeters">,
): BuiltAreaViewModel {
  const latest = selectLatestSnapshot(builtAreaDto.snapshots);
  const currentBuiltAreaSquareMeters = latest?.observedBuiltAreaSquareMeters ?? null;
  const completionPercent = calculateCompletionPercent(
    currentBuiltAreaSquareMeters,
    project.plannedAreaSquareMeters,
  );

  const chartPoints = builtAreaDto.snapshots
    .filter((snapshot) => snapshot.source === "MANUAL")
    .map((snapshot) => ({
      captureSessionId: snapshot.captureSessionId,
      captureDateLabel: formatDate(parseDateOnly(snapshot.captureDate)),
      observedBuiltAreaSquareMeters: snapshot.observedBuiltAreaSquareMeters,
    }));

  return {
    projectId: builtAreaDto.projectId,
    currentBuiltAreaSquareMeters,
    currentBuiltAreaLabel: formatBuiltArea(currentBuiltAreaSquareMeters),
    plannedAreaSquareMeters: project.plannedAreaSquareMeters,
    plannedAreaLabel: formatBuiltArea(project.plannedAreaSquareMeters),
    completionPercent,
    completionLabel:
      completionPercent !== null ? formatPercent(completionPercent) : null,
    showCompletion: completionPercent !== null,
    chartPoints,
    hasSnapshots: builtAreaDto.snapshots.length > 0,
    sourceLabel: formatSourceLabel(latest?.source),
    confidenceLabel: formatConfidenceLabel(latest?.confidenceScore),
  };
}

export function selectLatestSnapshot<
  T extends {
    captureDate: string;
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
      const leftDate = parseDateOnly(left.captureDate).getTime();
      const rightDate = parseDateOnly(right.captureDate).getTime();
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

export function calculateCompletionPercent(
  builtAreaSquareMeters: number | null,
  plannedAreaSquareMeters: number | null | undefined,
): number | null {
  if (
    builtAreaSquareMeters === null ||
    plannedAreaSquareMeters === null ||
    plannedAreaSquareMeters === undefined ||
    plannedAreaSquareMeters <= 0
  ) {
    return null;
  }

  const raw = (builtAreaSquareMeters / plannedAreaSquareMeters) * 100;
  return Math.min(Math.round(raw * 10) / 10, 100);
}

function formatBuiltArea(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Não informada";
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} m²`;
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

function formatConfidenceLabel(confidenceScore: number | null | undefined): string | null {
  if (confidenceScore === null || confidenceScore === undefined) {
    return null;
  }
  return `Confiança: ${Math.round(confidenceScore * 100)}%`;
}
