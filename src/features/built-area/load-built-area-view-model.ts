import {
  mapBuiltAreaViewModel,
  type BuiltAreaViewModel,
} from "@/features/built-area/built-area.mapper";
import { debugLog } from "@/lib/debug";
import { getProjectBuiltArea } from "@/services/built-area.service";
import { getProject } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";

export type BuiltAreaLoadResult =
  | { status: "success"; viewModel: BuiltAreaViewModel }
  | { status: "empty"; message: string; viewModel: BuiltAreaViewModel }
  | { status: "error"; message: string };

export async function loadBuiltAreaViewModel(
  projectId: string,
): Promise<BuiltAreaLoadResult> {
  try {
    const [builtAreaDto, project] = await Promise.all([
      getProjectBuiltArea(projectId),
      getProject(projectId),
    ]);
    const viewModel = mapBuiltAreaViewModel(builtAreaDto, project);

    debugLog("project_built_area_loaded", {
      projectId,
      snapshotCount: builtAreaDto.snapshots.length,
      currentBuiltAreaSquareMeters: viewModel.currentBuiltAreaSquareMeters,
    });

    if (!viewModel.hasSnapshots) {
      return {
        status: "empty",
        message: "Nenhuma área construída registrada para esta obra.",
        viewModel,
      };
    }

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadBuiltAreaViewModel: failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return { status: "error", message: "Obra não encontrada." };
    }
    return {
      status: "error",
      message: "Não foi possível carregar a área construída.",
    };
  }
}
