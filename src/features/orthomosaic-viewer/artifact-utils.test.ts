import { describe, expect, it } from "vitest";
import { findPreviewArtifactId, findOrthomosaicDownloadArtifactId } from "@/features/orthomosaic-viewer/artifact-utils";

describe("artifact-utils", () => {
  const artifacts = [
    { artifactId: "ortho-1", artifactType: "ORTHOMOSAIC" as const },
    { artifactId: "preview-1", artifactType: "ORTHOMOSAIC_PREVIEW" as const },
    { artifactId: "thumb-1", artifactType: "ORTHOMOSAIC_THUMBNAIL" as const },
  ];

  it("findPreviewArtifactId prefers ORTHOMOSAIC_PREVIEW", () => {
    expect(findPreviewArtifactId(artifacts)).toBe("preview-1");
  });

  it("findOrthomosaicDownloadArtifactId finds ORTHOMOSAIC", () => {
    expect(findOrthomosaicDownloadArtifactId(artifacts)).toBe("ortho-1");
  });
});
