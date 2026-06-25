import { describe, expect, it } from "vitest";
import {
  mapTimelineItem,
  mapTimelineItems,
  resolveDefaultComparisonFlights,
} from "@/features/temporal-comparison/timeline.mapper";
import type { ProjectTimelineItemDto } from "@/types/api/timeline.api";

const baseItem = (
  overrides: Partial<ProjectTimelineItemDto>,
): ProjectTimelineItemDto => ({
  sequenceNumber: 1,
  captureSessionId: "flight-1",
  captureDate: "2026-05-01",
  operatorName: "Pilot A",
  jobId: "job-1",
  jobStatus: "COMPLETED",
  orthomosaicArtifactId: "ortho-1",
  orthomosaicPreviewArtifactId: "preview-1",
  processingCompletedAt: "2026-05-01T14:00:00Z",
  metrics: { areaSquareMeters: 8000, gsdCmPerPixel: 2.2 },
  ...overrides,
});

describe("timeline.mapper", () => {
  it("maps nested metrics and preview url", () => {
    const item = mapTimelineItem(baseItem({}));

    expect(item.areaSquareMeters).toBe(8000);
    expect(item.gsdLabel).toBe("2,2 cm/pixel");
    expect(item.previewUrl).toBe("/api/v1/artifacts/preview-1/preview");
    expect(item.captureDateLabel).toBe("01 de mai. de 2026");
  });

  it("auto-selects last and second-to-last items from asc timeline", () => {
    const items = mapTimelineItems([
      baseItem({ sequenceNumber: 1, captureSessionId: "older", captureDate: "2026-05-01" }),
      baseItem({ sequenceNumber: 2, captureSessionId: "newer", captureDate: "2026-06-01" }),
    ]);

    expect(resolveDefaultComparisonFlights(items)).toEqual({
      captureSessionAId: "older",
      captureSessionBId: "newer",
    });
  });

  it("returns null when fewer than two processed surveys exist", () => {
    expect(resolveDefaultComparisonFlights(mapTimelineItems([baseItem({})]))).toBeNull();
  });
});
