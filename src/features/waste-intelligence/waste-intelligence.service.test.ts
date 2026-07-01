import { describe, expect, it, vi, beforeEach } from "vitest";
import { getProjectWasteAnalysis } from "@/features/waste-intelligence/waste-intelligence.service";
import { DEMO_PROJECT_ID } from "@/features/demo/demo-seed";
import { DEMO_WASTE_ANALYSIS_DTO } from "@/features/demo/demo-data";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("@/features/demo/demo-seed", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/demo/demo-seed")>();
  return {
    ...actual,
    DEMO_ENABLED: true,
  };
});

import { apiFetch } from "@/services/api-client";

describe("waste-intelligence.service", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("returns canned demo data for demo project when demo mode is enabled", async () => {
    const result = await getProjectWasteAnalysis(DEMO_PROJECT_ID, "session-a", "session-b");

    expect(apiFetch).not.toHaveBeenCalled();
    expect(result.overallWasteScore).toBe(DEMO_WASTE_ANALYSIS_DTO.overallWasteScore);
    expect(result.captureSessionAId).toBe("session-a");
    expect(result.dataCompleteness.inventoryAvailable).toBe(true);
  });

  it("fetches waste analysis from API for non-demo projects", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      projectId: "proj-1",
      captureSessionAId: "a",
      captureSessionBId: "b",
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
      "/projects/proj-1/waste-analysis?captureSessionA=a&captureSessionB=b",
    );
  });
});
