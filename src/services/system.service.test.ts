import { describe, expect, it, vi } from "vitest";
import { getSystemOverview } from "@/services/system.service";

describe("system.service", () => {
  it("getSystemOverview calls overview endpoint", async () => {
    const mockOverview = {
      timestamp: "2026-06-13T12:00:00Z",
      overallStatus: "UP",
      components: {},
      operations: {
        projects: 1,
        flights: 2,
        jobs: 1,
        processedJobs: 1,
        pendingJobs: 0,
        failedJobs: 0,
        recentJobs: [],
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockOverview,
    }) as typeof fetch;

    const result = await getSystemOverview();
    expect(result.overallStatus).toBe("UP");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/system/overview"),
      expect.any(Object),
    );
  });
});
