import { describe, expect, it, vi } from "vitest";
import { loadMaterialInventoryViewModel } from "@/features/material-inventory/load-material-inventory-view-model";
import { ApiError } from "@/types/api/common.api";

vi.mock("@/services/material-inventory.service", () => ({
  getProjectMaterialInventory: vi.fn(),
}));

import { getProjectMaterialInventory } from "@/services/material-inventory.service";

describe("loadMaterialInventoryViewModel", () => {
  it("returns success when snapshots exist", async () => {
    vi.mocked(getProjectMaterialInventory).mockResolvedValue({
      projectId: "proj-1",
      snapshots: [
        {
          captureSessionId: "flight-1",
          captureDate: "2026-05-01",
          materialType: "BRICK",
          quantity: 100,
          unit: "UNIT",
          source: "MANUAL",
          movementType: "STOCK",
          storageZone: null,
          confidenceScore: null,
          recordedAt: "2026-05-01T10:00:00Z",
          createdAt: "2026-05-01T10:00:00Z",
        },
      ],
    });

    const result = await loadMaterialInventoryViewModel("proj-1");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.viewModel.hasSnapshots).toBe(true);
    }
  });

  it("returns empty when no snapshots", async () => {
    vi.mocked(getProjectMaterialInventory).mockResolvedValue({
      projectId: "proj-1",
      snapshots: [],
    });

    const result = await loadMaterialInventoryViewModel("proj-1");

    expect(result.status).toBe("empty");
  });

  it("returns error on 404", async () => {
    vi.mocked(getProjectMaterialInventory).mockRejectedValue(new ApiError("Not found", 404));

    const result = await loadMaterialInventoryViewModel("proj-1");

    expect(result.status).toBe("error");
  });
});
