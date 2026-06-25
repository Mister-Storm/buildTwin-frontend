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
  captureSessionAId: string,
  captureSessionBId: string,
): Promise<ChangeDetectionLoadResult> {
  try {
    const dto = await getProjectCompare(projectId, captureSessionAId, captureSessionBId);
    const viewModel = mapChangeDetectionViewModel(dto);

    debugLog("change_detection_loaded", {
      projectId,
      captureSessionA: captureSessionAId,
      captureSessionB: captureSessionBId,
      changePercentage: dto.changePercentage,
      changeLevel: dto.changeLevel,
      comparisonQuality: dto.comparisonQuality,
      heatmapArtifactId: dto.heatmapArtifactId,
    });

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadChangeDetection: failed", {
      projectId,
      captureSessionA: captureSessionAId,
      captureSessionB: captureSessionBId,
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
