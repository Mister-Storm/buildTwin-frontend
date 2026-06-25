import type { ComparisonLoadResult } from "@/features/domain/models/temporal-comparison";
import { buildComparisonViewModel } from "@/features/temporal-comparison/comparison-metrics.mapper";
import {
  findTimelineItem,
  mapTimelineItems,
  resolveDefaultComparisonFlights,
} from "@/features/temporal-comparison/timeline.mapper";
import { debugLog } from "@/lib/debug";
import { getProjectTimeline } from "@/services/timeline.service";
import { ApiError } from "@/types/api/common.api";

export async function loadComparisonViewModel(
  projectId: string,
  captureSessionAId?: string,
  captureSessionBId?: string,
): Promise<ComparisonLoadResult> {
  try {
    const response = await getProjectTimeline(projectId);
    const items = mapTimelineItems(response.timeline);

    if (items.length === 0) {
      return {
        status: "empty",
        message: "Nenhum levantamento processado encontrado para esta obra.",
        timeline: items,
      };
    }

    if (items.length === 1) {
      return {
        status: "insufficient",
        message:
          "São necessários pelo menos dois levantamentos processados para realizar uma comparação temporal.",
        timeline: items,
      };
    }

    const defaults = resolveDefaultComparisonFlights(items);
    const resolvedAId = captureSessionAId ?? defaults?.captureSessionAId;
    const resolvedBId = captureSessionBId ?? defaults?.captureSessionBId;

    if (!resolvedAId || !resolvedBId) {
      return {
        status: "insufficient",
        message:
          "São necessários pelo menos dois levantamentos processados para realizar uma comparação temporal.",
        timeline: items,
      };
    }

    const captureSessionA = findTimelineItem(items, resolvedAId);
    const captureSessionB = findTimelineItem(items, resolvedBId);

    if (!captureSessionA || !captureSessionB || captureSessionA.captureSessionId === captureSessionB.captureSessionId) {
      return {
        status: "error",
        message: "Não foi possível selecionar dois levantamentos distintos.",
        timeline: items,
      };
    }

    const [older, newer] =
      captureSessionA.captureDate <= captureSessionB.captureDate
        ? [captureSessionA, captureSessionB]
        : [captureSessionB, captureSessionA];

    const viewModel = buildComparisonViewModel(projectId, older, newer);

    debugLog("comparison_opened", {
      projectId,
      captureSessionA: older.captureSessionId,
      captureSessionB: newer.captureSessionId,
    });

    debugLog("comparison_analytics_generated", {
      projectId,
      captureSessionA: older.captureSessionId,
      captureSessionB: newer.captureSessionId,
      daysBetween: viewModel.analytics.daysBetween,
      areaDeltaPercent: viewModel.analytics.areaDeltaPercent,
    });

    debugLog("progress_metrics_calculated", {
      projectId,
      areaDelta: viewModel.areaEvolutionMetrics.areaDelta,
      areaDeltaPercent: viewModel.areaEvolutionMetrics.areaDeltaPercent,
      daysBetween: viewModel.areaEvolutionMetrics.daysBetween,
    });

    return {
      status: "success",
      viewModel,
      timeline: items,
    };
  } catch (error) {
    debugLog("loadComparisonViewModel: failed", {
      projectId,
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: "empty",
        message: "Obra não encontrada.",
        timeline: [],
      };
    }
    return {
      status: "error",
      message: "Não foi possível carregar a timeline da obra.",
      timeline: [],
    };
  }
}
