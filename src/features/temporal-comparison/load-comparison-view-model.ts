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
  flightAId?: string,
  flightBId?: string,
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
    const resolvedAId = flightAId ?? defaults?.flightAId;
    const resolvedBId = flightBId ?? defaults?.flightBId;

    if (!resolvedAId || !resolvedBId) {
      return {
        status: "insufficient",
        message:
          "São necessários pelo menos dois levantamentos processados para realizar uma comparação temporal.",
        timeline: items,
      };
    }

    const flightA = findTimelineItem(items, resolvedAId);
    const flightB = findTimelineItem(items, resolvedBId);

    if (!flightA || !flightB || flightA.flightId === flightB.flightId) {
      return {
        status: "error",
        message: "Não foi possível selecionar dois levantamentos distintos.",
        timeline: items,
      };
    }

    const [older, newer] =
      flightA.flightDate <= flightB.flightDate
        ? [flightA, flightB]
        : [flightB, flightA];

    const viewModel = buildComparisonViewModel(projectId, older, newer);

    debugLog("comparison_opened", {
      projectId,
      flightA: older.flightId,
      flightB: newer.flightId,
    });

    debugLog("comparison_analytics_generated", {
      projectId,
      flightA: older.flightId,
      flightB: newer.flightId,
      daysBetween: viewModel.analytics.daysBetween,
      areaDeltaPercent: viewModel.analytics.areaDeltaPercent,
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
