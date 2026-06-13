import type { OrthomosaicResolution } from "@/features/domain/models/orthomosaic";
import { MockOrthomosaicResolver } from "@/features/domain/resolvers/mock-orthomosaic-resolver";

export type { OrthomosaicResolution };

export interface OrthomosaicResolver {
  resolve(
    flightId: string,
    projectId: string,
  ): Promise<OrthomosaicResolution | null>;
  resolveLatestForProject(
    projectId: string,
  ): Promise<OrthomosaicResolution | null>;
}

let resolverInstance: OrthomosaicResolver | null = null;

export function setOrthomosaicResolver(resolver: OrthomosaicResolver): void {
  resolverInstance = resolver;
}

export function getOrthomosaicResolver(): OrthomosaicResolver {
  if (!resolverInstance) {
    resolverInstance = new MockOrthomosaicResolver();
  }
  return resolverInstance;
}
