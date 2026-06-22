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
  firstFlightDate: string | null;
  lastFlightDate: string | null;
  timelineSize: number;
  currentObservedAreaSquareMeters: number | null;
  deltaAreaFromPreviousFlight: number | null;
  deltaAreaFromFirstFlight: number | null;
  averageGrowthPerDay: number | null;
  estimatedCompletionPercent: number | null;
  plannedAreaSquareMeters: number | null;
  dataCoveragePercent: number;
};

export type ProjectProgressHistoryItemDto = {
  flightId: string;
  flightDate: string;
  observedAreaSquareMeters: number;
  deltaAreaFromPreviousFlight: number | null;
};

export type ProjectProgressHistoryDto = {
  projectId: string;
  history: ProjectProgressHistoryItemDto[];
};

export type ConstructionProgressSnapshotDto = {
  flightSequence: number;
  flightId: string;
  flightDate: string;
  occupiedAreaSquareMeters: number | null;
  footprintIndex: number | null;
  visualChangeIndex: number | null;
};

export type ProjectConstructionProgressTimelineDto = {
  projectId: string;
  timeline: ConstructionProgressSnapshotDto[];
};
