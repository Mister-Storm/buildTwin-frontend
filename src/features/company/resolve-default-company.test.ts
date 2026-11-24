import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveDefaultCompany } from "@/features/company/resolve-default-company";
import { ApiError } from "@/types/api/common.api";

vi.mock("@/services/companies.service", () => ({
  listCompanies: vi.fn(),
}));

import { listCompanies } from "@/services/companies.service";

describe("resolveDefaultCompany", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return the authorized organization id regardless of its name", async () => {
    vi.mocked(listCompanies).mockResolvedValue([
      { id: "company-1", name: "exemplo1", createdAt: "" },
    ]);

    const sut = await resolveDefaultCompany();

    expect(sut).toBe("company-1");
  });

  it("should reject with a clear message when the user has no organization", async () => {
    vi.mocked(listCompanies).mockResolvedValue([]);

    const sut = resolveDefaultCompany();

    await expect(sut).rejects.toBeInstanceOf(ApiError);
    await expect(sut).rejects.toMatchObject({
      status: 403,
      code: "NO_ORGANIZATION",
    });
  });

  it("should not reuse a previous user's organization on the next call", async () => {
    vi.mocked(listCompanies)
      .mockResolvedValueOnce([{ id: "company-1", name: "A", createdAt: "" }])
      .mockResolvedValueOnce([{ id: "company-2", name: "B", createdAt: "" }]);

    await resolveDefaultCompany();
    const sut = await resolveDefaultCompany();

    expect(sut).toBe("company-2");
  });
});
