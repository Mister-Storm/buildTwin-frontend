import { describe, expect, it, vi } from "vitest";
import {
  compareProjectMaterialInventory,
  getProjectMaterialInventory,
  registerMaterialInventory,
} from "@/services/material-inventory.service";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/api-client";

describe("material-inventory.service", () => {
  it("posts batch inventory items", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ snapshots: [] });

    await registerMaterialInventory("flight-1", {
      items: [{ materialType: "BRICK", quantity: 5000, unit: "UNIT", storageZone: "North Yard" }],
      recordedAt: "2026-06-15T14:30:00Z",
    });

    expect(apiFetch).toHaveBeenCalledWith("/capture-sessions/flight-1/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ materialType: "BRICK", quantity: 5000, unit: "UNIT", storageZone: "North Yard" }],
        recordedAt: "2026-06-15T14:30:00Z",
      }),
    });
  });

  it("gets project inventory", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ projectId: "proj-1", snapshots: [] });
    await getProjectMaterialInventory("proj-1");
    expect(apiFetch).toHaveBeenCalledWith("/projects/proj-1/inventory");
  });

  it("compares inventory between captureSessions", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      projectId: "proj-1",
      captureSessionAId: "a",
      captureSessionBId: "b",
      materials: [],
    });
    await compareProjectMaterialInventory("proj-1", "a", "b");
    expect(apiFetch).toHaveBeenCalledWith(
      "/projects/proj-1/inventory/compare?captureSessionA=a&captureSessionB=b",
    );
  });
});
