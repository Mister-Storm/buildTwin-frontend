import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadOrthomosaicViewModel } from "@/features/orthomosaic-viewer/load-orthomosaic-view-model";

vi.mock("@/features/domain/resolvers/orthomosaic-resolver", () => ({
  getOrthomosaicResolver: vi.fn(),
}));

vi.mock("@/services/jobs.service", () => ({
  getJob: vi.fn(),
}));

vi.mock("@/services/artifacts.service", () => ({
  getArtifact: vi.fn(),
}));

vi.mock("@/services/flights.service", () => ({
  getFlight: vi.fn(),
}));

import { getOrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import { getJob } from "@/services/jobs.service";
import { getArtifact } from "@/services/artifacts.service";
import { getFlight } from "@/services/flights.service";

const projectId = "proj-1";
const flightId = "flight-1";
const jobId = "job-1";
const previewArtifactId = "preview-1";
const downloadArtifactId = "ortho-1";

describe("loadOrthomosaicViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns view model with real preview and download URLs", async () => {
    vi.mocked(getOrthomosaicResolver).mockReturnValue({
      resolve: vi.fn().mockResolvedValue({
        projectId,
        flightId,
        jobId,
        previewArtifactId,
      }),
      resolveLatestForProject: vi.fn(),
    });

    vi.mocked(getJob).mockResolvedValue({
      jobId,
      flightId,
      jobType: "ORTHOMOSAIC_PROCESSING",
      status: "COMPLETED",
      createdAt: "2026-06-12T10:00:00Z",
      startedAt: null,
      completedAt: "2026-06-12T11:00:00Z",
      failureReason: null,
      artifacts: [
        {
          artifactId: previewArtifactId,
          artifactType: "ORTHOMOSAIC_PREVIEW",
          artifactStatus: "PUBLISHED",
          storagePath: "preview.jpg",
          fileSize: 512000,
          checksum: "abc",
          metadata: { width: 1920, height: 1080 },
          createdAt: "2026-06-12T11:00:00Z",
        },
        {
          artifactId: downloadArtifactId,
          artifactType: "ORTHOMOSAIC",
          artifactStatus: "PUBLISHED",
          storagePath: "ortho.tif",
          fileSize: 50000000,
          checksum: "def",
          metadata: {},
          createdAt: "2026-06-12T11:00:00Z",
        },
      ],
    });

    vi.mocked(getArtifact).mockResolvedValue({
      artifactId: previewArtifactId,
      artifactType: "ORTHOMOSAIC_PREVIEW",
      storagePath: "preview.jpg",
      fileSize: 512000,
      checksum: "abc",
      metadata: { width: 1920, height: 1080 },
      createdAt: "2026-06-12T11:00:00Z",
    });

    vi.mocked(getFlight).mockResolvedValue({
      flightId,
      projectId,
      flightDate: "2026-06-12",
      operatorName: "Operador Teste",
      imageCount: 42,
      createdAt: "2026-06-12T09:00:00Z",
      latestJob: null,
    });

    const result = await loadOrthomosaicViewModel(projectId, flightId);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.viewModel.previewUrl).toBe(
        `/api/v1/artifacts/${previewArtifactId}/preview`,
      );
      expect(result.viewModel.downloadUrl).toBe(
        `/api/v1/artifacts/${downloadArtifactId}/download`,
      );
      expect(result.viewModel.operatorName).toBe("Operador Teste");
      expect(result.viewModel.jobStatus).toBe("Concluído");
    }
  });

  it("returns empty when resolver finds no resolution", async () => {
    vi.mocked(getOrthomosaicResolver).mockReturnValue({
      resolve: vi.fn().mockResolvedValue(null),
      resolveLatestForProject: vi.fn(),
    });

    const result = await loadOrthomosaicViewModel(projectId, flightId);

    expect(result).toEqual({ status: "empty", reason: "NO_RESOLUTION" });
  });
});
