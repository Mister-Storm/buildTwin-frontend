export type DetectVerticalConstructionResponseDto = {
  captureSessionId: string;
  detectedFloors: number;
  estimatedHeightMeters: number;
  confidenceScore: number;
  source: string;
  previewArtifactId: string | null;
  detectionArtifactId: string;
  modelVersion: string;
};
