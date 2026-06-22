import {
  mapMaterialInventoryViewModel,
  type MaterialInventoryViewModel,
} from "@/features/material-inventory/material-inventory.mapper";
import { debugLog } from "@/lib/debug";
import { getProjectMaterialInventory } from "@/services/material-inventory.service";
import { ApiError } from "@/types/api/common.api";

export type MaterialInventoryLoadResult =
  | { status: "success"; viewModel: MaterialInventoryViewModel }
  | { status: "empty"; message: string; viewModel: MaterialInventoryViewModel }
  | { status: "error"; message: string };

export async function loadMaterialInventoryViewModel(
  projectId: string,
): Promise<MaterialInventoryLoadResult> {
  try {
    const inventoryDto = await getProjectMaterialInventory(projectId);
    const viewModel = mapMaterialInventoryViewModel(inventoryDto);

    debugLog("project_material_inventory_loaded", {
      projectId,
      snapshotCount: inventoryDto.snapshots.length,
    });

    if (!viewModel.hasSnapshots) {
      return {
        status: "empty",
        message: "Nenhum inventário de materiais registrado para esta obra.",
        viewModel,
      };
    }

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadMaterialInventoryViewModel: failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return { status: "error", message: "Obra não encontrada." };
    }
    return {
      status: "error",
      message: "Não foi possível carregar o inventário de materiais.",
    };
  }
}
