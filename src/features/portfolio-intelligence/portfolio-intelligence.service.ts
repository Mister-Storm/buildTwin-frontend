import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { PortfolioIntelligenceDto } from "@/features/portfolio-intelligence/portfolio-intelligence.api";

export async function getPortfolioIntelligence(): Promise<PortfolioIntelligenceDto> {
  debugLog("getPortfolioIntelligence");
  return apiFetch<PortfolioIntelligenceDto>("/portfolio/intelligence");
}
