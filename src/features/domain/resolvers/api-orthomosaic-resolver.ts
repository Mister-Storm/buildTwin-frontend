import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";
import type { OrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import {
  findPreviewArtifactId,
} from "@/features/orthomosaic-viewer/artifact-utils";
import { debugLog } from "@/lib/debug";
import {
  getLatestFlightJob,
  listFlightsByProject,
} from "@/services/flights.service";
import { getJob } from "@/services/jobs.service";
import { ApiError } from "@/types/api/common.api";

export class ApiOrthomosaicResolver implements OrthomosaicResolver {
  async resolve(
    flightId: string,
    projectId: string,
  ): Promise<OrthomosaicResolution | null> {
    debugLog("ApiOrthomosaicResolver.resolve", { flightId, projectId });

    try {
      const latestJob = await getLatestFlightJob(flightId);
      return this.resolutionFromJob(
        projectId,
        flightId,
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

    const flights = await listFlightsByProject(projectId);
    const sorted = [...flights].sort(
      (a, b) =>
        new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime(),
    );

    for (const flight of sorted) {
      const resolution = await this.resolve(flight.flightId, projectId);
      if (resolution) return resolution;
    }

    return null;
  }

  async getOrthomosaicFlightIds(
    projectId: string,
  ): Promise<ReadonlySet<string>> {
    debugLog("ApiOrthomosaicResolver.getOrthomosaicFlightIds", { projectId });

    const flights = await listFlightsByProject(projectId);
    const ids = new Set<string>();

    await Promise.all(
      flights.map(async (flight) => {
        if (!flight.latestJobId) return;
        const resolution = await this.resolutionFromJob(
          projectId,
          flight.flightId,
          flight.latestJobId,
          undefined,
        );
        if (resolution) ids.add(flight.flightId);
      }),
    );

    return ids;
  }

  private async resolutionFromJob(
    projectId: string,
    flightId: string,
    jobId: string,
    preferredPreviewId?: string,
  ): Promise<OrthomosaicResolution | null> {
    try {
      const job = await getJob(jobId);
      const previewArtifactId = findPreviewArtifactId(
        job.artifacts,
        preferredPreviewId,
      );

      if (!previewArtifactId) {
        return null;
      }

      return {
        projectId,
        flightId,
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
