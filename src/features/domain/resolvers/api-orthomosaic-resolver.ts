import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";
import type { OrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import {
  findPreviewArtifactId,
} from "@/features/orthomosaic-viewer/artifact-utils";
import { debugLog } from "@/lib/debug";
import {
  getLatestCaptureSessionJob,
  listCaptureSessionsByProject,
} from "@/services/capture-sessions.service";
import { getJob } from "@/services/jobs.service";
import { ApiError } from "@/types/api/common.api";

export class ApiOrthomosaicResolver implements OrthomosaicResolver {
  async resolve(
    captureSessionId: string,
    projectId: string,
  ): Promise<OrthomosaicResolution | null> {
    debugLog("ApiOrthomosaicResolver.resolve", { captureSessionId, projectId });

    try {
      const latestJob = await getLatestCaptureSessionJob(captureSessionId);
      return this.resolutionFromJob(
        projectId,
        captureSessionId,
        latestJob.jobId,
        undefined,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async resolveLatestForProject(
    projectId: string,
  ): Promise<OrthomosaicResolution | null> {
    debugLog("ApiOrthomosaicResolver.resolveLatestForProject", { projectId });

    const captureSessions = await listCaptureSessionsByProject(projectId);
    const sorted = [...captureSessions].sort(
      (a, b) =>
        new Date(b.captureDate).getTime() - new Date(a.captureDate).getTime(),
    );

    for (const captureSession of sorted) {
      const resolution = await this.resolve(captureSession.captureSessionId, projectId);
      if (resolution) return resolution;
    }

    return null;
  }

  async getOrthomosaicCaptureSessionIds(
    projectId: string,
  ): Promise<ReadonlySet<string>> {
    debugLog("ApiOrthomosaicResolver.getOrthomosaicCaptureSessionIds", { projectId });

    const captureSessions = await listCaptureSessionsByProject(projectId);
    const ids = new Set<string>();

    await Promise.all(
      captureSessions.map(async (captureSession) => {
        if (!captureSession.latestJobId) return;
        const resolution = await this.resolutionFromJob(
          projectId,
          captureSession.captureSessionId,
          captureSession.latestJobId,
          undefined,
        );
        if (resolution) ids.add(captureSession.captureSessionId);
      }),
    );

    return ids;
  }

  private async resolutionFromJob(
    projectId: string,
    captureSessionId: string,
    jobId: string,
    preferredPreviewId?: string,
  ): Promise<OrthomosaicResolution | null> {
    try {
      const job = await getJob(jobId);
      if (job.status !== "COMPLETED") {
        return null;
      }
      const previewArtifactId = findPreviewArtifactId(
        job.artifacts,
        preferredPreviewId,
      );

      if (!previewArtifactId) {
        return null;
      }

      return {
        projectId,
        captureSessionId,
        jobId,
        previewArtifactId,
      };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
}
