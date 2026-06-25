import type { AreaEvolutionMetrics } from "@/features/progress-intelligence/area-evolution-metrics";
import type { ChangeAnalytics } from "@/features/temporal-comparison/analytics/change-analytics";

export type TimelineItemViewModel = {
  sequenceNumber: number;
  captureSessionId: string;
  captureDate: Date;
  captureDateLabel: string;
  operatorName: string;
  previewUrl: string;
  areaLabel: string | null;
  gsdLabel: string | null;
  areaSquareMeters: number | null;
  gsdCmPerPixel: number | null;
};

export type ComparisonViewModel = {
  projectId: string;
  captureSessionA: TimelineItemViewModel;
  captureSessionB: TimelineItemViewModel;
  deltaAreaLabel: string | null;
  deltaGsdLabel: string | null;
  intervalDaysLabel: string;
  analytics: ChangeAnalytics;
  areaEvolutionMetrics: AreaEvolutionMetrics;
};

export type ComparisonLoadResult =
  | {
      status: "success";
      viewModel: ComparisonViewModel;
      timeline: TimelineItemViewModel[];
    }
  | { status: "insufficient"; message: string; timeline: TimelineItemViewModel[] }
  | { status: "empty"; message: string; timeline: TimelineItemViewModel[] }
  | { status: "error"; message: string; timeline: TimelineItemViewModel[] };
