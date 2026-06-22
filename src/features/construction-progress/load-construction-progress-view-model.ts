import {
  mapConstructionProgressTimeline,
  type ConstructionProgressTimelineViewModel,
} from "@/features/construction-progress/construction-progress.mapper";
import { debugLog } from "@/lib/debug";
import { getConstructionProgressTimeline } from "@/services/construction-progress.service";
import { ApiError } from "@/types/api/common.api";

export type ConstructionProgressLoadResult =
  | { status: "success"; viewModel: ConstructionProgressTimelineViewModel }
  | { status: "empty"; message: string }
  | { status: "error"; message: string };

export async function loadConstructionProgressViewModel(
  projectId: string,
): Promise<ConstructionProgressLoadResult> {
  try {
    const dto = await getConstructionProgressTimeline(projectId);
    const viewModel = mapConstructionProgressTimeline(dto);

    debugLog("construction_progress_loaded", {
      projectId,
      timelineSize: dto.timeline.length,
    });

    if (dto.timeline.length === 0) {
      return {
        status: "empty",
        message: "Nenhum levantamento processado com ocupação observada disponível.",
      };
    }

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadConstructionProgressViewModel: failed", {
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
