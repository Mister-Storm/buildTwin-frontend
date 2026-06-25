import type { TimelineItemViewModel } from "@/features/domain/models/temporal-comparison";
import { artifactPreviewUrl } from "@/services/api-client";
import type { ProjectTimelineItemDto } from "@/types/api/timeline.api";
import { formatDate, parseDateOnly } from "@/lib/formatters";

const UNAVAILABLE = "Não disponível";

function formatAreaLabel(areaSquareMeters: number | null): string | null {
  if (areaSquareMeters === null) {
    return UNAVAILABLE;
  }
  return `${areaSquareMeters.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })} m²`;
}

function formatGsdLabel(gsdCmPerPixel: number | null): string | null {
  if (gsdCmPerPixel === null) {
    return UNAVAILABLE;
  }
  return `${gsdCmPerPixel.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} cm/pixel`;
}

export function mapTimelineItem(
  item: ProjectTimelineItemDto,
): TimelineItemViewModel {
  const areaSquareMeters = item.metrics?.areaSquareMeters ?? null;
  const gsdCmPerPixel = item.metrics?.gsdCmPerPixel ?? null;

  return {
    sequenceNumber: item.sequenceNumber,
    captureSessionId: item.captureSessionId,
    captureDate: parseDateOnly(item.captureDate),
    captureDateLabel: formatDate(parseDateOnly(item.captureDate)),
    operatorName: item.operatorName,
    previewUrl: artifactPreviewUrl(item.orthomosaicPreviewArtifactId),
    areaLabel: formatAreaLabel(areaSquareMeters),
    gsdLabel: formatGsdLabel(gsdCmPerPixel),
    areaSquareMeters,
    gsdCmPerPixel,
  };
}

export function mapTimelineItems(
  items: ProjectTimelineItemDto[],
): TimelineItemViewModel[] {
  return items.map(mapTimelineItem);
}

export function resolveDefaultComparisonFlights(
  items: TimelineItemViewModel[],
): { captureSessionAId: string; captureSessionBId: string } | null {
  if (items.length < 2) {
    return null;
  }
  const previous = items[items.length - 2]!;
  const latest = items[items.length - 1]!;
  return {
    captureSessionAId: previous.captureSessionId,
    captureSessionBId: latest.captureSessionId,
  };
}

export function findTimelineItem(
  items: TimelineItemViewModel[],
  captureSessionId: string,
): TimelineItemViewModel | undefined {
  return items.find((item) => item.captureSessionId === captureSessionId);
}
