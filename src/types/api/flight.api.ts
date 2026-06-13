export type FlightStatusDto =
  | "CREATED"
  | "UPLOADING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export type FlightResponseDto = {
  id: string;
  projectId: string;
  flightDate: string;
  operatorName: string;
  status: FlightStatusDto;
  imageCount: number;
};
