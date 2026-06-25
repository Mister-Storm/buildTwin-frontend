import { debugLog } from "@/lib/debug";
import {
  mapForecastIntelligenceViewModel,
  type ForecastIntelligenceViewModel,
} from "@/features/forecast-intelligence/forecast-intelligence.mapper";
import { getConstructionForecast } from "@/features/forecast-intelligence/forecast-intelligence.service";
import { ApiError } from "@/types/api/common.api";

export type ForecastIntelligenceLoadResult =
  | { status: "success"; viewModel: ForecastIntelligenceViewModel }
  | { status: "error"; message: string };

export async function loadForecastIntelligenceViewModel(
  projectId: string,
): Promise<ForecastIntelligenceLoadResult> {
  try {
    const dto = await getConstructionForecast(projectId);
    const viewModel = mapForecastIntelligenceViewModel(dto);

    debugLog("forecast_intelligence_loaded", {
      projectId,
      confidence: dto.confidence,
      scheduleRisk: dto.scheduleRisk,
    });

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadForecastIntelligenceViewModel: failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return { status: "error", message: "Obra não encontrada." };
    }
    return {
      status: "error",
      message: "Não foi possível carregar a previsão de construção.",
    };
  }
}
