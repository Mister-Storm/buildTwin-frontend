import { describe, expect, it } from "vitest";
import {
  getArtifactDownloadLink,
  getArtifactPreviewLink,
  indexArtifactsByType,
} from "@/features/capture-session/artifact-links";

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

  it("builds preview link for MATERIAL_DETECTION_PREVIEW", () => {
    const indexed = indexArtifactsByType([
      {
        artifactId: "mat-preview-1",
        artifactType: "MATERIAL_DETECTION_PREVIEW",
        artifactStatus: "GENERATED",
        storagePath: "m.jpg",
        fileSize: 1,
        checksum: "c",
        metadata: {},
        createdAt: "",
      },
    ]);
    expect(getArtifactPreviewLink(indexed, "MATERIAL_DETECTION_PREVIEW")).toBe(
      "/api/v1/artifacts/mat-preview-1/preview",
    );
  });
});
