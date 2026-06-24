import { afterEach, describe, expect, it, vi } from "vitest";
import { registerBuiltArea, getProjectBuiltArea, detectBuiltArea } from "@/services/built-area.service";
import { apiFetch } from "@/services/api-client";

vi.mock("@/services/api-client", () => ({
  apiFetch: vi.fn(),
}));

describe("built-area.service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("getProjectBuiltArea calls API path", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ projectId: "proj-1", snapshots: [] });

    await getProjectBuiltArea("proj-1");

    expect(apiFetch).toHaveBeenCalledWith("/projects/proj-1/built-area");
  });

  it("registerBuiltArea posts extended payload", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: "snap-1" });

    await registerBuiltArea("flight-1", {
      observedBuiltAreaSquareMeters: 5200,
      observedFloors: 4,
      notes: "Structural phase completed",
    });

    expect(apiFetch).toHaveBeenCalledWith("/flights/flight-1/built-area", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        observedBuiltAreaSquareMeters: 5200,
        observedFloors: 4,
        notes: "Structural phase completed",
      }),
    });
  });

  it("detectBuiltArea posts detect endpoint", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      flightId: "flight-1",
      detectedAreaSquareMeters: 1243.5,
      confidenceScore: 0.82,
      source: "AI_DETECTED",
      previewArtifactId: "artifact-1",
      detectionArtifactId: "dataset-1",
    });

    await detectBuiltArea("flight-1");

    expect(apiFetch).toHaveBeenCalledWith("/flights/flight-1/built-area/detect", {
      method: "POST",
    });
  });
});
