import { afterEach, describe, expect, it, vi } from "vitest";
import { loadBuiltAreaViewModel } from "@/features/built-area/load-built-area-view-model";
import { getProjectBuiltArea } from "@/services/built-area.service";
import { getProject } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";

vi.mock("@/services/built-area.service", () => ({
  getProjectBuiltArea: vi.fn(),
}));

vi.mock("@/services/projects.service", () => ({
  getProject: vi.fn(),
}));

describe("loadBuiltAreaViewModel", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns success when snapshots exist", async () => {
    vi.mocked(getProjectBuiltArea).mockResolvedValue({
      projectId: "proj-1",
      snapshots: [
        {
          captureSessionId: "flight-1",
          captureDate: "2026-06-01",
          observedBuiltAreaSquareMeters: 1200,
          confidenceScore: null,
          source: "MANUAL",
          createdAt: "2026-06-01T10:00:00Z",
        },
      ],
    });
    vi.mocked(getProject).mockResolvedValue({
      id: "proj-1",
      plannedAreaSquareMeters: 2400,
    } as Awaited<ReturnType<typeof getProject>>);

    const result = await loadBuiltAreaViewModel("proj-1");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.viewModel.currentBuiltAreaSquareMeters).toBe(1200);
    }
  });

  it("returns empty when no snapshots", async () => {
    vi.mocked(getProjectBuiltArea).mockResolvedValue({
      projectId: "proj-1",
      snapshots: [],
    });
    vi.mocked(getProject).mockResolvedValue({
      id: "proj-1",
      plannedAreaSquareMeters: null,
    } as Awaited<ReturnType<typeof getProject>>);

    const result = await loadBuiltAreaViewModel("proj-1");

    expect(result.status).toBe("empty");
  });

  it("returns error on 404", async () => {
    vi.mocked(getProjectBuiltArea).mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "Project not found"),
    );
    vi.mocked(getProject).mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "Project not found"),
    );

    const result = await loadBuiltAreaViewModel("proj-1");

    expect(result.status).toBe("error");
  });
});
