export type StatusVariant = "success" | "warning" | "error" | "neutral" | "info";

export type FlightTimelineEntry = {
  id: string;
  date: Date;
  operatorName: string;
  statusLabel: string;
  statusVariant: StatusVariant;
  imageCount: number;
  processingStatus: string;
  processingVariant: StatusVariant;
  hasOrthomosaic: boolean;
  isLatest: boolean;
};

export type ProjectDashboardView = {
  projectId: string;
  projectName: string;
  archived: boolean;
  totalFlights: number;
  flightsByStatus: Record<string, number>;
  recentFlights: FlightTimelineEntry[];
};
