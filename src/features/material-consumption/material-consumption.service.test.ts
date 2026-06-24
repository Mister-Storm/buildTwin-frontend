import { describe, expect, it, vi } from "vitest";
import { getProjectMaterialConsumption } from "@/features/material-consumption/material-consumption.service";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/api-client";

describe("material-consumption.service", () => {
  it("fetches consumption analysis with completeness fields", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      projectId: "proj-1",
      flightAId: "a",
      flightBId: "b",
      analysisGeneratedAt: "2026-06-23T20:00:00Z",
      dataCompleteness: {
        inventoryAvailable: true,
        builtAreaAvailable: true,
      },
      builtAreaAtFlightA: 1200,
      builtAreaAtFlightB: 1380,
      builtAreaDelta: 180,
      totalConsumedMaterials: 3000,
      materials: [],
    });

    await getProjectMaterialConsumption("proj-1", "a", "b");

    expect(apiFetch).toHaveBeenCalledWith(
      "/projects/proj-1/inventory/consumption?flightA=a&flightB=b",
    );
  });
});
