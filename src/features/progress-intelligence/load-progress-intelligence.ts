import {
  mapProgressIntelligence,
  type ProgressIntelligenceViewModel,
} from "@/features/progress-intelligence/progress-intelligence.mapper";
import { debugLog } from "@/lib/debug";
import { getProjectProgress } from "@/services/progress.service";
import { ApiError } from "@/types/api/common.api";

export type ProgressIntelligenceLoadResult =
  | { status: "success"; viewModel: ProgressIntelligenceViewModel }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export async function loadProgressIntelligence(
  projectId: string,
  flightAId: string,
  flightBId: string,
): Promise<ProgressIntelligenceLoadResult> {
  try {
    const dto = await getProjectProgress(projectId, flightAId, flightBId);
    const viewModel = mapProgressIntelligence(dto);

    debugLog("progress_loaded", {
      projectId,
      flightA: flightAId,
      flightB: flightBId,
      changePercentage: dto.changePercentage,
      classification: dto.classification,
      trend: dto.trend,
      confidenceScore: dto.confidenceScore,
    });

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadProgressIntelligence: failed", {
      projectId,
      flightA: flightAId,
      flightB: flightBId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: "unavailable",
        message: "Indicador de progresso indisponível para estes levantamentos.",
      };
    }
    return {
      status: "error",
      message: "Não foi possível carregar o indicador de progresso.",
    };
  }
}
