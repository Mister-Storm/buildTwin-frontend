import { debugLog } from "@/lib/debug";
import { listCompanies } from "@/services/companies.service";
import { ApiError } from "@/types/api/common.api";

export async function resolveDefaultCompany(): Promise<string> {
  debugLog("resolveDefaultCompany");

  const companies = await listCompanies();
  const organization = companies[0];

  if (!organization) {
    throw new ApiError(
      403,
      "NO_ORGANIZATION",
      "Seu usuário não está vinculado a nenhuma organização. Peça ao administrador da sua organização.",
    );
  }

  return organization.id;
}
