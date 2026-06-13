import { describe, expect, it } from "vitest";
import {
  getArtifactDownloadLink,
  indexArtifactsByType,
} from "@/features/flight/artifact-links";

describe("artifact-links", () => {
  const artifacts = indexArtifactsByType([
    {
      artifactId: "ortho-1",
      artifactType: "ORTHOMOSAIC",
      artifactStatus: "PUBLISHED",
      storagePath: "o.tif",
      fileSize: 1,
      checksum: "a",
      metadata: {},
      createdAt: "",
    },
    {
      artifactId: "preview-1",
      artifactType: "ORTHOMOSAIC_PREVIEW",
      artifactStatus: "PUBLISHED",
      storagePath: "p.jpg",
      fileSize: 1,
      checksum: "b",
      metadata: {},
      createdAt: "",
    },
  ]);

  it("builds download link for ORTHOMOSAIC", () => {
    expect(getArtifactDownloadLink(artifacts, "ORTHOMOSAIC")).toBe(
      "/api/v1/artifacts/ortho-1/download",
    );
  });
});
