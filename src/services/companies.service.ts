import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  CompanyResponseDto,
  CreateCompanyRequestDto,
} from "@/types/api/project.api";

export async function listCompanies(): Promise<CompanyResponseDto[]> {
  debugLog("listCompanies");
  return apiFetch<CompanyResponseDto[]>("/companies");
}

export async function createCompany(
  name: string,
): Promise<CompanyResponseDto> {
  debugLog("createCompany", { name });
  const body: CreateCompanyRequestDto = { name };
  return apiFetch<CompanyResponseDto>("/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
