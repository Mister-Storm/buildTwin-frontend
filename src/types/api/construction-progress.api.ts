export type ProjectTypeDto =
  | "RESIDENTIAL_BUILDING"
  | "COMMERCIAL_BUILDING"
  | "WAREHOUSE"
  | "ROAD"
  | "BRIDGE"
  | "INDUSTRIAL"
  | "OTHER";

export type ProjectConstructionProgressDto = {
  projectId: string;
  firstCaptureDate: string | null;
  lastCaptureDate: string | null;
  timelineSize: number;
  currentObservedAreaSquareMeters: number | null;
  deltaAreaFromPreviousCapture: number | null;
  deltaAreaFromFirstCapture: number | null;
  averageGrowthPerDay: number | null;
  estimatedCompletionPercent: number | null;
  plannedAreaSquareMeters: number | null;
  dataCoveragePercent: number;
  currentBuiltAreaSquareMeters?: number | null;
  currentObservedFloors?: number | null;
  plannedFloors?: number | null;
  averageAreaPerFloor?: number | null;
  verticalCompletionPercent?: number | null;
};

export type ProjectProgressHistoryItemDto = {
  captureSessionId: string;
  captureDate: string;
  observedAreaSquareMeters: number;
  deltaAreaFromPreviousCapture: number | null;
};

export type ProjectProgressHistoryDto = {
  projectId: string;
  history: ProjectProgressHistoryItemDto[];
};

export type ConstructionProgressSnapshotDto = {
  captureSessionSequence: number;
  captureSessionId: string;
  captureDate: string;
  occupiedAreaSquareMeters: number | null;
  footprintIndex: number | null;
  visualChangeIndex: number | null;
};

export type ProjectConstructionProgressTimelineDto = {
  projectId: string;
  timeline: ConstructionProgressSnapshotDto[];
};
