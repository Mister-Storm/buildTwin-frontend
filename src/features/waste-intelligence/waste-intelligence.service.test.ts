import { describe, expect, it, vi } from "vitest";
import { getProjectWasteAnalysis } from "@/features/waste-intelligence/waste-intelligence.service";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/api-client";

describe("waste-intelligence.service", () => {
  it("fetches waste analysis with benchmark version and confidence", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      projectId: "proj-1",
      flightAId: "a",
      flightBId: "b",
      builtAreaDelta: 420,
      overallWasteScore: 82,
      analysisConfidence: 0.85,
      normalizationType: "AREA_BASED",
      benchmarkVersion: "2026.1",
      materials: [],
      dataCompleteness: {
        inventoryAvailable: true,
        builtAreaAvailable: true,
        benchmarksAvailable: true,
      },
    });

    await getProjectWasteAnalysis("proj-1", "a", "b");

    expect(apiFetch).toHaveBeenCalledWith(
      "/projects/proj-1/waste-analysis?flightA=a&flightB=b",
    );
  });
});
