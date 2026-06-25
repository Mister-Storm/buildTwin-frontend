import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";
import { ApiOrthomosaicResolver } from "@/features/domain/resolvers/api-orthomosaic-resolver";

export type { OrthomosaicResolution };

export interface OrthomosaicResolver {
  resolve(
    captureSessionId: string,
    projectId: string,
  ): Promise<OrthomosaicResolution | null>;
  resolveLatestForProject(
    projectId: string,
  ): Promise<OrthomosaicResolution | null>;
  getOrthomosaicCaptureSessionIds?(
    projectId: string,
  ): Promise<ReadonlySet<string>>;
}

let resolverInstance: OrthomosaicResolver | null = null;

export function setOrthomosaicResolver(resolver: OrthomosaicResolver): void {
  resolverInstance = resolver;
}

export function getOrthomosaicResolver(): OrthomosaicResolver {
  if (!resolverInstance) {
    resolverInstance = new ApiOrthomosaicResolver();
  }
  return resolverInstance;
}
