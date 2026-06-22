import { afterEach, describe, expect, it, vi } from "vitest";
import { registerBuiltArea, getProjectBuiltArea } from "@/services/built-area.service";
import { apiFetch } from "@/services/api-client";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("built-area.service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("getProjectBuiltArea calls API path", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ projectId: "proj-1", snapshots: [] });

    await getProjectBuiltArea("proj-1");

    expect(apiFetch).toHaveBeenCalledWith("/projects/proj-1/built-area");
  });

  it("registerBuiltArea posts to API path", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: "snap-1" });

    await registerBuiltArea("flight-1", { observedBuiltAreaSquareMeters: 1250 });

    expect(apiFetch).toHaveBeenCalledWith("/flights/flight-1/built-area", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observedBuiltAreaSquareMeters: 1250 }),
    });
  });
});
