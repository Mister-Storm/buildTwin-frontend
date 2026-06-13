export type ProjectStatus = "active" | "archived";

export type ProjectSummary = {
  id: string;
  name: string;
  locationLabel: string;
  startDate: Date;
  status: ProjectStatus;
  statusLabel: string;
};

export type ProjectDetail = ProjectSummary & {
  companyId: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
};
