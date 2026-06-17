export type LocationDto = {
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type CompanyResponseDto = {
  id: string;
  name: string;
  createdAt: string;
};

export type CreateCompanyRequestDto = {
  name: string;
};

export type ProjectResponseDto = {
  id: string;
  companyId: string;
  name: string;
  location: LocationDto;
  startDate: string;
  createdAt: string;
  archivedAt: string | null;
  plannedAreaSquareMeters: number | null;
  plannedFloors: number | null;
  projectType: ProjectTypeDto | null;
};

export type ProjectTypeDto =
  | "RESIDENTIAL_BUILDING"
  | "COMMERCIAL_BUILDING"
  | "WAREHOUSE"
  | "ROAD"
  | "BRIDGE"
  | "INDUSTRIAL"
  | "OTHER";

export type CreateProjectRequestDto = {
  companyId: string;
  name: string;
  location: LocationDto;
  startDate: string;
  plannedAreaSquareMeters?: number | null;
  plannedFloors?: number | null;
  projectType?: ProjectTypeDto | null;
};

export type UpdateProjectRequestDto = {
  name: string;
  location: LocationDto;
  startDate: string;
  plannedAreaSquareMeters?: number | null;
  plannedFloors?: number | null;
  projectType?: ProjectTypeDto | null;
};
