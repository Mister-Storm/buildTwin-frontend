export type TimelineItemViewModel = {
  sequenceNumber: number;
  flightId: string;
  flightDate: Date;
  flightDateLabel: string;
  operatorName: string;
  previewUrl: string;
  areaLabel: string | null;
  gsdLabel: string | null;
  areaSquareMeters: number | null;
  gsdCmPerPixel: number | null;
};

export type ComparisonViewModel = {
  projectId: string;
  flightA: TimelineItemViewModel;
  flightB: TimelineItemViewModel;
  deltaAreaLabel: string | null;
  deltaGsdLabel: string | null;
  intervalDaysLabel: string;
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
