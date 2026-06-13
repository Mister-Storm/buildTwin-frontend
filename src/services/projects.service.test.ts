import { afterEach, describe, expect, it, vi } from "vitest";
import { createProject, archiveProject } from "@/services/projects.service";
import { apiFetch } from "@/services/api-client";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("projects.service write ops", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("createProject posts to API", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: "p1", name: "Obra" });

    await createProject({
      companyId: "c1",
      name: "Obra",
      startDate: "2026-01-01",
      location: {
        address: "Rua",
        city: "SP",
        state: "SP",
        country: "BR",
        latitude: 0,
        longitude: 0,
      },
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "/projects",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("archiveProject deletes project", async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined);

    await archiveProject("p1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/projects/p1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
