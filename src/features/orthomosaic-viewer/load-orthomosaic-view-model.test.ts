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

vi.mock("@/services/capture-sessions.service", () => ({
  getCaptureSession: vi.fn(),
}));

import { getOrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import { getJob } from "@/services/jobs.service";
import { getArtifact } from "@/services/artifacts.service";
import { getCaptureSession } from "@/services/capture-sessions.service";

const projectId = "proj-1";
const captureSessionId = "flight-1";
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
        captureSessionId,
        jobId,
        previewArtifactId,
      }),
      resolveLatestForProject: vi.fn(),
    });

    vi.mocked(getJob).mockResolvedValue({
      jobId,
      captureSessionId,
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

    vi.mocked(getArtifact).mockImplementation(async (artifactId: string) => {
      if (artifactId === downloadArtifactId) {
        return {
          artifactId: downloadArtifactId,
          artifactType: "ORTHOMOSAIC",
          storagePath: "ortho.tif",
          fileSize: 50000000,
          checksum: "def",
          metadata: {
            format: "GeoTIFF",
            width: 12000,
            height: 9000,
            crs: "EPSG:31982",
            epsg: 31982,
            centerLat: -27.61234,
            centerLon: -48.63214,
            bounds: {
              minLat: -27.615,
              maxLat: -27.609,
              minLon: -48.635,
              maxLon: -48.629,
            },
            areaSquareMeters: 8421.4,
            gsdCmPerPixel: 2.1,
          },
          createdAt: "2026-06-12T11:00:00Z",
        };
      }

      return {
        artifactId: previewArtifactId,
        artifactType: "ORTHOMOSAIC_PREVIEW",
        storagePath: "preview.jpg",
        fileSize: 512000,
        checksum: "abc",
        metadata: { width: 1920, height: 1080 },
        createdAt: "2026-06-12T11:00:00Z",
      };
    });

    vi.mocked(getCaptureSession).mockResolvedValue({
      captureSessionId,
      projectId,
      captureDate: "2026-06-12",
      operatorName: "Operador Teste",
      imageCount: 42,
      createdAt: "2026-06-12T09:00:00Z",
      latestJob: null,
    });

    const result = await loadOrthomosaicViewModel(projectId, captureSessionId);

    expect(getArtifact).toHaveBeenCalledWith(downloadArtifactId);
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.viewModel.previewUrl).toBe(
        `/preview/artifacts/${previewArtifactId}`,
      );
      expect(result.viewModel.downloadUrl).toBe(
        `/api/v1/artifacts/${downloadArtifactId}/download`,
      );
      expect(result.viewModel.operatorName).toBe("Operador Teste");
      expect(result.viewModel.jobStatus).toBe("Concluído");
      expect(result.viewModel.captureDateLabel).toBe("12 de jun. de 2026");
      expect(result.viewModel.areaLabel).toBe("8.421,4 m²");
      expect(result.viewModel.gsdLabel).toBe("2,1 cm/pixel");
      expect(result.viewModel.crs).toBe("EPSG:31982");
      expect(result.viewModel.dimensionsLabel).toBe("12.000 × 9.000 px");
      expect(result.viewModel.epsg).toBe(31982);
      expect(result.viewModel.centerLat).toBe(-27.61234);
      expect(result.viewModel.bounds?.minLat).toBe(-27.615);
    }
  });

  it("returns empty when resolver finds no resolution", async () => {
    vi.mocked(getOrthomosaicResolver).mockReturnValue({
      resolve: vi.fn().mockResolvedValue(null),
      resolveLatestForProject: vi.fn(),
    });

    const result = await loadOrthomosaicViewModel(projectId, captureSessionId);

    expect(result).toEqual({ status: "empty", reason: "NO_RESOLUTION" });
  });
});
