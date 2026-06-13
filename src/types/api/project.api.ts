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

export type CreateProjectRequestDto = {
  companyId: string;
  name: string;
  location: LocationDto;
  startDate: string;
};

export type ProjectResponseDto = {
  id: string;
  companyId: string;
  name: string;
  location: LocationDto;
  startDate: string;
  createdAt: string;
  archivedAt: string | null;
};
