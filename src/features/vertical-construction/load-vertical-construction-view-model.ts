import {
  mapVerticalConstructionViewModel,
  type VerticalConstructionViewModel,
} from "@/features/vertical-construction/vertical-construction.mapper";
import { debugLog } from "@/lib/debug";
import { getProjectBuiltArea } from "@/services/built-area.service";
import { getConstructionProjectProgress } from "@/services/construction-progress.service";
import { getProject } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";

export type VerticalConstructionLoadResult =
  | { status: "success"; viewModel: VerticalConstructionViewModel }
  | { status: "empty"; message: string; viewModel: VerticalConstructionViewModel }
  | { status: "error"; message: string };

export async function loadVerticalConstructionViewModel(
  projectId: string,
): Promise<VerticalConstructionLoadResult> {
  try {
    const [builtAreaDto, project, progress] = await Promise.all([
      getProjectBuiltArea(projectId),
      getProject(projectId),
      getConstructionProjectProgress(projectId).catch(() => null),
    ]);

    const viewModel = mapVerticalConstructionViewModel(builtAreaDto, project, progress);

    debugLog("vertical_construction_loaded", {
      projectId,
      snapshotCount: builtAreaDto.snapshots.length,
      currentObservedFloors: progress?.currentObservedFloors,
      verticalCompletionPercent: progress?.verticalCompletionPercent,
    });

    if (!viewModel.hasSnapshots) {
      return {
        status: "empty",
        message: "Nenhum registro de construção vertical disponível.",
        viewModel,
      };
    }

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadVerticalConstructionViewModel: failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return { status: "error", message: "Obra não encontrada." };
    }
    return {
      status: "error",
      message: "Não foi possível carregar a construção vertical.",
    };
  }
}
