import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiOrthomosaicResolver } from "@/features/domain/resolvers/api-orthomosaic-resolver";
import { ApiError } from "@/types/api/common.api";

vi.mock("@/services/capture-sessions.service", () => ({
  getLatestCaptureSessionJob: vi.fn(),
  listCaptureSessionsByProject: vi.fn(),
}));

vi.mock("@/services/jobs.service", () => ({
  getJob: vi.fn(),
}));

import { getLatestCaptureSessionJob, listCaptureSessionsByProject } from "@/services/capture-sessions.service";
import { getJob } from "@/services/jobs.service";

const projectId = "proj-1";
const captureSessionId = "flight-1";
const jobId = "job-1";
const previewArtifactId = "preview-1";

describe("ApiOrthomosaicResolver", () => {
  const resolver = new ApiOrthomosaicResolver();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolve returns resolution when latest job has preview artifact", async () => {
    vi.mocked(getLatestCaptureSessionJob).mockResolvedValue({
      jobId,
      captureSessionId,
      jobType: "ORTHOMOSAIC_PROCESSING",
      status: "COMPLETED",
      createdAt: "2026-06-12T10:00:00Z",
      startedAt: "2026-06-12T10:01:00Z",
      completedAt: "2026-06-12T11:00:00Z",
      failureReason: null,
    });
    vi.mocked(getJob).mockResolvedValue({
      jobId,
      captureSessionId,
      jobType: "ORTHOMOSAIC_PROCESSING",
      status: "COMPLETED",
      createdAt: "2026-06-12T10:00:00Z",
      startedAt: "2026-06-12T10:01:00Z",
      completedAt: "2026-06-12T11:00:00Z",
      failureReason: null,
      artifacts: [
        {
          artifactId: previewArtifactId,
          artifactType: "ORTHOMOSAIC_PREVIEW",
          artifactStatus: "PUBLISHED",
          storagePath: "path/preview.jpg",
          fileSize: 1024,
          checksum: "abc",
          metadata: {},
          createdAt: "2026-06-12T11:00:00Z",
        },
      ],
    });

    const result = await resolver.resolve(captureSessionId, projectId);

    expect(result).toEqual({
      projectId,
      captureSessionId,
      jobId,
      previewArtifactId,
    });
    expect(getLatestCaptureSessionJob).toHaveBeenCalledWith(captureSessionId);
  });

  it("resolve returns null when latest job endpoint returns 404", async () => {
    vi.mocked(getLatestCaptureSessionJob).mockRejectedValue(
      new ApiError(404, "NOT_FOUND", "No job"),
    );

    const result = await resolver.resolve(captureSessionId, projectId);

    expect(result).toBeNull();
  });

  it("resolveLatestForProject picks newest flight with preview", async () => {
    vi.mocked(listCaptureSessionsByProject).mockResolvedValue([
      {
        captureSessionId: "flight-new",
        captureDate: "2026-06-12",
        operatorName: "B",
        imageCount: 20,
        latestProcessingStatus: "COMPLETED",
        latestJobId: "job-new",
      },
    ]);

    vi.mocked(getLatestCaptureSessionJob).mockResolvedValue({
      jobId: "job-new",
      captureSessionId: "flight-new",
      jobType: "ORTHOMOSAIC_PROCESSING",
      status: "COMPLETED",
      createdAt: "2026-06-12T10:00:00Z",
      startedAt: null,
      completedAt: "2026-06-12T11:00:00Z",
      failureReason: null,
    });

    vi.mocked(getJob).mockResolvedValue({
      jobId: "job-new",
      captureSessionId: "flight-new",
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
          storagePath: "path/preview.jpg",
          fileSize: 2048,
          checksum: "def",
          metadata: {},
          createdAt: "2026-06-12T11:00:00Z",
        },
      ],
    });

    const result = await resolver.resolveLatestForProject(projectId);

    expect(result?.captureSessionId).toBe("flight-new");
  });
});
