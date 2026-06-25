import { beforeEach, describe, expect, it, vi } from "vitest";
import { getExecutiveConstructionIntelligence } from "@/features/executive-intelligence/executive-intelligence.service";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/services/api-client";

describe("executive-intelligence.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches executive intelligence for a project", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      projectId: "project-1",
      constructionHealthScore: 82,
      classification: "GOOD",
      healthScoreBreakdown: {
        resourceEfficiencyScore: 90,
        builtAreaProgressScore: 80,
        verticalProgressScore: 70,
        dataCompletenessScore: 100,
      },
      productivityIndex: 0.06,
      productivityClassification: "NORMAL",
      builtAreaVelocity: 8.9,
      floorVelocity: 0.12,
      wasteTrend: "IMPROVING",
      generatedAt: "2026-06-15T12:00:00Z",
    });

    const result = await getExecutiveConstructionIntelligence("project-1");

    expect(apiFetch).toHaveBeenCalledWith("/projects/project-1/executive-intelligence");
    expect(result.constructionHealthScore).toBe(82);
    expect(result.healthScoreBreakdown.resourceEfficiencyScore).toBe(90);
  });
});
