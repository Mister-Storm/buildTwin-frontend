import { debugLog } from "@/lib/debug";
import {
  mapSpatialIntelligenceViewModel,
  type SpatialIntelligenceViewModel,
} from "@/features/spatial-intelligence/spatial-intelligence.mapper";
import { getProjectSpatialIntelligence } from "@/features/spatial-intelligence/spatial-intelligence.service";
import { ApiError } from "@/types/api/common.api";

export type SpatialIntelligenceLoadResult =
  | { status: "success"; viewModel: SpatialIntelligenceViewModel }
  | { status: "empty"; message: string }
  | { status: "error"; message: string };

export async function loadSpatialIntelligenceViewModel(
  projectId: string,
): Promise<SpatialIntelligenceLoadResult> {
  try {
    const dto = await getProjectSpatialIntelligence(projectId);
    const viewModel = mapSpatialIntelligenceViewModel(dto);

    debugLog("spatial_intelligence_loaded", {
      projectId,
      heatmapCount: viewModel.heatmaps.length,
      hotspotCount: viewModel.hotspots.length,
    });

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadSpatialIntelligenceViewModel: failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: "empty",
        message:
          "Inteligência espacial indisponível. É necessário ao menos um levantamento processado com ortomosaico.",
      };
    }
    return {
      status: "error",
      message: "Não foi possível carregar a inteligência espacial.",
    };
  }
}
