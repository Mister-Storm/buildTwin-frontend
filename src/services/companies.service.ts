import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type { CompanyResponseDto } from "@/types/api/project.api";

export async function listCompanies(): Promise<CompanyResponseDto[]> {
  debugLog("listCompanies");
  return apiFetch<CompanyResponseDto[]>("/companies");
}
