import type { ProcessingArtifactResponseDto } from "@/types/api/processing.api";

export type ProcessingProfileDto = "STANDARD" | "DEGRADED" | "FALLBACK";

export type MeasurementReliabilityDto = "LOW" | "MEDIUM" | "HIGH";

export type OrthomosaicQualityInfo = {
  processingProfile: ProcessingProfileDto;
  qualityNotice: string | null;
  measurementReliability: MeasurementReliabilityDto | null;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function getOrthomosaicQualityInfo(
  orthomosaic: ProcessingArtifactResponseDto | undefined,
): OrthomosaicQualityInfo | null {
  if (!orthomosaic) {
    return null;
  }

  const profile = asString(orthomosaic.metadata.processingProfile) as
    | ProcessingProfileDto
    | null;
  if (!profile || profile === "STANDARD") {
    return null;
  }

  return {
    processingProfile: profile,
    qualityNotice: asString(orthomosaic.metadata.qualityNotice),
    measurementReliability: asString(
      orthomosaic.metadata.measurementReliability,
    ) as MeasurementReliabilityDto | null,
  };
}

export function shouldShowDegradedQualityBanner(
  quality: OrthomosaicQualityInfo | null,
): boolean {
  return (
    quality?.processingProfile === "DEGRADED" ||
    quality?.processingProfile === "FALLBACK"
  );
}
