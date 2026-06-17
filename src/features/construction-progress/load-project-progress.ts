import {
  mapConstructionProgress,
  type ConstructionProgressViewModel,
} from "@/features/construction-progress/progress-metrics.mapper";
import { debugLog } from "@/lib/debug";
import { getConstructionProjectProgress } from "@/services/construction-progress.service";
import { ApiError } from "@/types/api/common.api";

export type ProjectProgressLoadResult =
  | { status: "success"; viewModel: ConstructionProgressViewModel }
  | { status: "empty"; message: string }
  | { status: "error"; message: string };

export async function loadProjectProgress(
  projectId: string,
): Promise<ProjectProgressLoadResult> {
  try {
    const dto = await getConstructionProjectProgress(projectId);
    const viewModel = mapConstructionProgress(dto);

    debugLog("project_progress_loaded", {
      projectId,
      timelineSize: dto.timelineSize,
      dataCoveragePercent: dto.dataCoveragePercent,
      currentObservedAreaSquareMeters: dto.currentObservedAreaSquareMeters,
    });

    if (dto.timelineSize === 0) {
      return {
        status: "empty",
        message: "Nenhum levantamento processado com área observada disponível.",
      };
    }

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadProjectProgress: failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return { status: "error", message: "Obra não encontrada." };
    }
    return {
      status: "error",
      message: "Não foi possível carregar o progresso da obra.",
    };
  }
}
