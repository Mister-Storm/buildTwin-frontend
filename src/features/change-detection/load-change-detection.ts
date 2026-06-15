import { mapChangeDetectionViewModel } from "@/features/change-detection/change-detection.mapper";
import type { ChangeDetectionViewModel } from "@/features/change-detection/change-detection.mapper";
import { debugLog } from "@/lib/debug";
import { getProjectCompare } from "@/services/compare.service";
import { ApiError } from "@/types/api/common.api";

export type ChangeDetectionLoadResult =
  | { status: "success"; viewModel: ChangeDetectionViewModel }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export async function loadChangeDetection(
  projectId: string,
  flightAId: string,
  flightBId: string,
): Promise<ChangeDetectionLoadResult> {
  try {
    const dto = await getProjectCompare(projectId, flightAId, flightBId);
    const viewModel = mapChangeDetectionViewModel(dto);

    debugLog("change_detection_loaded", {
      projectId,
      flightA: flightAId,
      flightB: flightBId,
      changePercentage: dto.changePercentage,
      changeLevel: dto.changeLevel,
      comparisonQuality: dto.comparisonQuality,
      heatmapArtifactId: dto.heatmapArtifactId,
    });

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadChangeDetection: failed", {
      projectId,
      flightA: flightAId,
      flightB: flightBId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: "unavailable",
        message: "Detecção de mudanças indisponível para estes levantamentos.",
      };
    }
    return {
      status: "error",
      message: "Não foi possível carregar a detecção de mudanças.",
    };
  }
}
