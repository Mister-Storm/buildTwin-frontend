import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";
import type { OrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import {
  DEMO_FLIGHT_ID,
  DEMO_JOB_ID,
  DEMO_PREVIEW_ARTIFACT_ID,
  DEMO_PROJECT_ID,
  DEMO_ENABLED,
} from "@/features/demo/demo-seed";

export type OrthomosaicMapping = Readonly<{
  projectId: string;
  captureSessionId: string;
  jobId: string;
  previewArtifactId?: string | undefined;
}>;

const DEMO_MAPPINGS: readonly OrthomosaicMapping[] = [
  {
    projectId: DEMO_PROJECT_ID,
    captureSessionId: DEMO_FLIGHT_ID,
    jobId: DEMO_JOB_ID,
    previewArtifactId: DEMO_PREVIEW_ARTIFACT_ID,
  },
];

const DEFAULT_MAPPINGS: readonly OrthomosaicMapping[] = DEMO_ENABLED
  ? DEMO_MAPPINGS
  : [];

function parseMappingsFromEnv(): readonly OrthomosaicMapping[] {
  const raw = process.env.ORTHOMOSAIC_MAPPINGS;
  if (!raw) return DEFAULT_MAPPINGS;
  try {
    const parsed = JSON.parse(raw) as OrthomosaicMapping[];
    return parsed.length > 0 ? parsed : DEFAULT_MAPPINGS;
  } catch {
    return DEFAULT_MAPPINGS;
  }
}

export class MockOrthomosaicResolver implements OrthomosaicResolver {
  private readonly mappings: readonly OrthomosaicMapping[];

  constructor(mappings?: readonly OrthomosaicMapping[]) {
    this.mappings = mappings ?? parseMappingsFromEnv();
  }

  async resolve(
    captureSessionId: string,
    projectId: string,
  ): Promise<OrthomosaicResolution | null> {
    const match = this.mappings.find(
      (m) => m.captureSessionId === captureSessionId && m.projectId === projectId,
    );
    if (!match) return null;
    return this.toResolution(match);
  }

  async resolveLatestForProject(
    projectId: string,
  ): Promise<OrthomosaicResolution | null> {
    const projectMappings = this.mappings.filter(
      (m) => m.projectId === projectId,
    );
    if (projectMappings.length === 0) return null;
    const latest = projectMappings[projectMappings.length - 1];
    if (!latest) return null;
    return this.toResolution(latest);
  }

  getMappedCaptureSessionIds(): ReadonlySet<string> {
    return new Set(this.mappings.map((m) => m.captureSessionId));
  }

  getMappings(): readonly OrthomosaicMapping[] {
    return this.mappings;
  }

  private toResolution(mapping: OrthomosaicMapping): OrthomosaicResolution {
    const resolution: OrthomosaicResolution = {
      projectId: mapping.projectId,
      captureSessionId: mapping.captureSessionId,
      jobId: mapping.jobId,
    };
    if (mapping.previewArtifactId) {
      return { ...resolution, previewArtifactId: mapping.previewArtifactId };
    }
    return resolution;
  }
}

export function getOrthomosaicCaptureSessionIds(
  mappings: readonly OrthomosaicMapping[],
): ReadonlySet<string> {
  return new Set(mappings.map((m) => m.captureSessionId));
}
