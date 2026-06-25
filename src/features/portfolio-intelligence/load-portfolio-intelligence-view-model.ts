import { debugLog } from "@/lib/debug";
import {
  mapPortfolioIntelligenceViewModel,
  type PortfolioIntelligenceViewModel,
} from "@/features/portfolio-intelligence/portfolio-intelligence.mapper";
import { getPortfolioIntelligence } from "@/features/portfolio-intelligence/portfolio-intelligence.service";
import { ApiError } from "@/types/api/common.api";

export type PortfolioIntelligenceLoadResult =
  | { status: "success"; viewModel: PortfolioIntelligenceViewModel }
  | { status: "error"; message: string };

export async function loadPortfolioIntelligenceViewModel(): Promise<PortfolioIntelligenceLoadResult> {
  try {
    const dto = await getPortfolioIntelligence();
    const viewModel = mapPortfolioIntelligenceViewModel(dto);

    debugLog("portfolio_intelligence_loaded", {
      activeProjects: dto.overview.activeProjects,
      insightCount: dto.insights.length,
    });

    return { status: "success", viewModel };
  } catch (error) {
    debugLog("loadPortfolioIntelligenceViewModel: failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return { status: "error", message: "Portfólio não encontrado." };
    }
    return {
      status: "error",
      message: "Não foi possível carregar a inteligência do portfólio.",
    };
  }
}
