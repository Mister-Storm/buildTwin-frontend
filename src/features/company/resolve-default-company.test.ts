import { afterEach, describe, expect, it, vi } from "vitest";
import {
  resetDefaultCompanyCache,
  resolveDefaultCompany,
} from "@/features/company/resolve-default-company";

vi.mock("@/services/companies.service", () => ({
  listCompanies: vi.fn(),
  createCompany: vi.fn(),
}));

import { createCompany, listCompanies } from "@/services/companies.service";

describe("resolveDefaultCompany", () => {
  afterEach(() => {
    vi.clearAllMocks();
    resetDefaultCompanyCache();
  });

  it("returns existing company id by name", async () => {
    vi.mocked(listCompanies).mockResolvedValue([
      { id: "company-1", name: "Construtora Parceira", createdAt: "" },
    ]);

    const id = await resolveDefaultCompany();

    expect(id).toBe("company-1");
    expect(createCompany).not.toHaveBeenCalled();
  });

  it("creates company when not found", async () => {
    vi.mocked(listCompanies).mockResolvedValue([]);
    vi.mocked(createCompany).mockResolvedValue({
      id: "new-company",
      name: "Construtora Parceira",
      createdAt: "",
    });

    const id = await resolveDefaultCompany();

    expect(id).toBe("new-company");
    expect(createCompany).toHaveBeenCalledWith("Construtora Parceira");
  });
});
