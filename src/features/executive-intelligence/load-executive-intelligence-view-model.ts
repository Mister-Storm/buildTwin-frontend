import { debugLog } from "@/lib/debug";
import {
  mapExecutiveIntelligenceViewModel,
  type ExecutiveIntelligenceViewModel,
} from "@/features/executive-intelligence/executive-intelligence.mapper";
import { getExecutiveConstructionIntelligence } from "@/features/executive-intelligence/executive-intelligence.service";
import { ApiError } from "@/types/api/common.api";

export type ExecutiveIntelligenceLoadResult =
  | { status: "success"; viewModel: ExecutiveIntelligenceViewModel }
  | { status: "error"; message: string };

export async function loadExecutiveIntelligenceViewModel(
  projectId: string,
): Promise<ExecutiveIntelligenceLoadResult> {
  try {
    const dto = await getExecutiveConstructionIntelligence(projectId);
    const viewModel = mapExecutiveIntelligenceViewModel(dto);

    debugLog("executive_intelligence_loaded", {
      projectId,
      constructionHealthScore: dto.constructionHealthScore,
      classification: dto.classification,
    });

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadExecutiveIntelligenceViewModel: failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return { status: "error", message: "Obra não encontrada." };
    }
    return {
      status: "error",
      message: "Não foi possível carregar a inteligência executiva.",
    };
  }
}
