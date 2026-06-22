import { afterEach, describe, expect, it, vi } from "vitest";
import { loadVerticalConstructionViewModel } from "@/features/vertical-construction/load-vertical-construction-view-model";
import { getProjectBuiltArea } from "@/services/built-area.service";
import { getConstructionProjectProgress } from "@/services/construction-progress.service";
import { getProject } from "@/services/projects.service";

vi.mock("@/services/built-area.service", () => ({
  getProjectBuiltArea: vi.fn(),
}));

vi.mock("@/services/construction-progress.service", () => ({
  getConstructionProjectProgress: vi.fn(),
}));

vi.mock("@/services/projects.service", () => ({
  getProject: vi.fn(),
}));

describe("loadVerticalConstructionViewModel", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when snapshots exist", async () => {
    vi.mocked(getProjectBuiltArea).mockResolvedValue({
      projectId: "proj-1",
      snapshots: [
        {
          flightId: "flight-1",
          flightDate: "2026-06-01",
          observedBuiltAreaSquareMeters: 5200,
          confidenceScore: null,
          source: "MANUAL",
          observedFloors: 4,
          notes: "Done",
          createdAt: "2026-06-01T10:00:00Z",
        },
      ],
    });
    vi.mocked(getProject).mockResolvedValue({
      id: "proj-1",
      plannedAreaSquareMeters: 20_000,
      plannedFloors: 20,
    } as Awaited<ReturnType<typeof getProject>>);
    vi.mocked(getConstructionProjectProgress).mockResolvedValue({
      projectId: "proj-1",
      currentBuiltAreaSquareMeters: 5200,
      currentObservedFloors: 4,
      plannedFloors: 20,
      averageAreaPerFloor: 1300,
      verticalCompletionPercent: 20,
    } as Awaited<ReturnType<typeof getConstructionProjectProgress>>);

    const result = await loadVerticalConstructionViewModel("proj-1");

    expect(result.status).toBe("success");
  });
});
