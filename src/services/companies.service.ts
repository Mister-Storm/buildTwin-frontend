import { apiFetch } from "@/services/api-client";
import type { CompanyResponseDto } from "@/types/api/project.api";

export async function listCompanies(): Promise<CompanyResponseDto[]> {
  return apiFetch<CompanyResponseDto[]>("/companies");
}
