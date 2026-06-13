import { describe, expect, it } from "vitest";
import {
  MockOrthomosaicResolver,
  type OrthomosaicMapping,
} from "@/features/domain/resolvers/mock-orthomosaic-resolver";

const mappings: readonly OrthomosaicMapping[] = [
  {
    projectId: "project-a",
    flightId: "flight-1",
    jobId: "job-1",
    previewArtifactId: "artifact-1",
  },
  {
    projectId: "project-a",
    flightId: "flight-2",
    jobId: "job-2",
  },
];

describe("MockOrthomosaicResolver", () => {
  const resolver = new MockOrthomosaicResolver(mappings);

  it("resolves known flight and project", async () => {
    const result = await resolver.resolve("flight-1", "project-a");

    expect(result).toEqual({
      projectId: "project-a",
      flightId: "flight-1",
      jobId: "job-1",
      previewArtifactId: "artifact-1",
    });
  });

  it("returns null for unknown ids", async () => {
    const result = await resolver.resolve("unknown-flight", "project-a");
    expect(result).toBeNull();
  });

  it("resolves latest mapping for project", async () => {
    const result = await resolver.resolveLatestForProject("project-a");

    expect(result).toEqual({
      projectId: "project-a",
      flightId: "flight-2",
      jobId: "job-2",
    });
  });

  it("returns null when project has no mappings", async () => {
    const result = await resolver.resolveLatestForProject("project-b");
    expect(result).toBeNull();
  });
});
