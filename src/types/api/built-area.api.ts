export type BuiltAreaSourceDto = "MANUAL" | "ESTIMATED" | "AI_DETECTED";

export type BuiltAreaSnapshotResponseDto = {
  id: string;
  projectId: string;
  flightId: string;
  observedBuiltAreaSquareMeters: number;
  confidenceScore: number | null;
  source: BuiltAreaSourceDto;
  observedFloors: number | null;
  notes: string | null;
  createdAt: string;
};

export type ProjectBuiltAreaSnapshotItemDto = {
  flightId: string;
  flightDate: string;
  observedBuiltAreaSquareMeters: number;
  confidenceScore: number | null;
  source: BuiltAreaSourceDto;
  observedFloors: number | null;
  notes: string | null;
  createdAt: string;
};

export type ProjectBuiltAreaSnapshotsDto = {
  projectId: string;
  snapshots: ProjectBuiltAreaSnapshotItemDto[];
};

export type RegisterBuiltAreaSnapshotRequestDto = {
  observedBuiltAreaSquareMeters: number;
  observedFloors?: number | null;
  notes?: string | null;
};
