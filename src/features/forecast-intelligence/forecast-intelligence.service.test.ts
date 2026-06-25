import { beforeEach, describe, expect, it, vi } from "vitest";
import { getConstructionForecast } from "@/features/forecast-intelligence/forecast-intelligence.service";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/api-client";

describe("forecast-intelligence.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches construction forecast for a project", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      projectId: "project-1",
      estimatedCompletionDate: "2027-06-15",
      remainingDays: 120,
      projectedCompletionPercentAtPlannedDate: 88.5,
      predictedCompletionDate: "2027-06-15",
      scheduleRisk: "ATTENTION",
      confidence: "MEDIUM",
      averageBuiltAreaVelocity: 5.8,
      averageFloorVelocity: 0.06,
      velocityTrend: "STABLE",
      generatedAt: "2026-06-15T12:00:00Z",
    });

    const result = await getConstructionForecast("project-1");

    expect(apiFetch).toHaveBeenCalledWith("/projects/project-1/forecast");
    expect(result.confidence).toBe("MEDIUM");
    expect(result.scheduleRisk).toBe("ATTENTION");
  });
});
