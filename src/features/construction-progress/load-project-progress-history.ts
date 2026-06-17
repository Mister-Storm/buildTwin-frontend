import {
  mapConstructionProgressHistory,
  type ConstructionProgressHistoryPoint,
} from "@/features/construction-progress/progress-metrics.mapper";
import { debugLog } from "@/lib/debug";
import { getConstructionProjectProgressHistory } from "@/services/construction-progress.service";
import { ApiError } from "@/types/api/common.api";

export type ProjectProgressHistoryLoadResult =
  | { status: "success"; history: ConstructionProgressHistoryPoint[] }
  | { status: "empty"; message: string }
  | { status: "error"; message: string };

export async function loadProjectProgressHistory(
  projectId: string,
): Promise<ProjectProgressHistoryLoadResult> {
  try {
    const dto = await getConstructionProjectProgressHistory(projectId);
    const history = mapConstructionProgressHistory(dto);

    debugLog("project_progress_history_loaded", {
      projectId,
      historySize: history.length,
    });

    if (history.length === 0) {
      return {
        status: "empty",
        message: "Histórico de área observada indisponível.",
      };
    }

    return { status: "success", history };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: "error", message: "Obra não encontrada." };
    }
    return {
      status: "error",
      message: "Não foi possível carregar o histórico de progresso.",
    };
  }
}
