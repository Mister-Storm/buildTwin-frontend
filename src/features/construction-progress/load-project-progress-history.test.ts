import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadProjectProgressHistory } from "@/features/construction-progress/load-project-progress-history";

vi.mock("@/services/construction-progress.service", () => ({
  getConstructionProjectProgressHistory: vi.fn(),
}));

import { getConstructionProjectProgressHistory } from "@/services/construction-progress.service";

describe("loadProjectProgressHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when history has data", async () => {
    vi.mocked(getConstructionProjectProgressHistory).mockResolvedValue({
      projectId: "proj-1",
      history: [
        {
          flightId: "flight-1",
          flightDate: "2026-05-01",
          observedAreaSquareMeters: 3200,
          deltaAreaFromPreviousFlight: null,
        },
        {
          flightId: "flight-2",
          flightDate: "2026-06-01",
          observedAreaSquareMeters: 4100,
          deltaAreaFromPreviousFlight: 900,
        },
      ],
    });

    const result = await loadProjectProgressHistory("proj-1");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.history).toHaveLength(2);
      expect(result.history[1].deltaAreaFromPreviousFlight).toBe(900);
    }
  });

  it("returns empty when history is empty", async () => {
    vi.mocked(getConstructionProjectProgressHistory).mockResolvedValue({
      projectId: "proj-1",
      history: [],
    });

    const result = await loadProjectProgressHistory("proj-1");

    expect(result.status).toBe("empty");
  });
});
