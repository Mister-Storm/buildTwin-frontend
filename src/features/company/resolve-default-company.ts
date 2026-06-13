import { debugLog } from "@/lib/debug";
import { createCompany, listCompanies } from "@/services/companies.service";

const DEFAULT_COMPANY_NAME =
  process.env.BUILDTWIN_DEFAULT_COMPANY_NAME ?? "Construtora Parceira";

let cachedCompanyId: string | null = null;

export function getDefaultCompanyName(): string {
  return DEFAULT_COMPANY_NAME;
}

export async function resolveDefaultCompany(): Promise<string> {
  if (cachedCompanyId) return cachedCompanyId;

  debugLog("resolveDefaultCompany", { name: DEFAULT_COMPANY_NAME });

  const companies = await listCompanies();
  const existing = companies.find(
    (c) => c.name.toLowerCase() === DEFAULT_COMPANY_NAME.toLowerCase(),
  );

  if (existing) {
    cachedCompanyId = existing.id;
    return existing.id;
  }

  const created = await createCompany(DEFAULT_COMPANY_NAME);
  cachedCompanyId = created.id;
  return created.id;
}

export function resetDefaultCompanyCache(): void {
  cachedCompanyId = null;
}
