import type { ProjectDetail, ProjectSummary } from "@/features/domain/models/project";
import {
  projectStatusLabel,
} from "@/lib/formatters";
import type { ProjectResponseDto } from "@/types/api/project.api";

export function toProjectSummary(dto: ProjectResponseDto): ProjectSummary {
  const archived = dto.archivedAt !== null;
  return {
    id: dto.id,
    name: dto.name,
    locationLabel: `${dto.location.city}, ${dto.location.state}`,
    startDate: new Date(dto.startDate),
    status: archived ? "archived" : "active",
    statusLabel: projectStatusLabel(archived),
  };
}

export function toProjectDetail(dto: ProjectResponseDto): ProjectDetail {
  const summary = toProjectSummary(dto);
  return {
    ...summary,
    companyId: dto.companyId,
    address: dto.location.address,
    city: dto.location.city,
    state: dto.location.state,
    country: dto.location.country,
    latitude: dto.location.latitude,
    longitude: dto.location.longitude,
    createdAt: new Date(dto.createdAt),
  };
}
