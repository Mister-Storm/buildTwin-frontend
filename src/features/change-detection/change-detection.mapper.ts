import { artifactPreviewUrl } from "@/services/api-client";
import type { ProjectCompareDto } from "@/types/api/compare.api";

export type ChangeDetectionViewModel = {
  flightAId: string;
  flightBId: string;
  changePercentageLabel: string;
  changedPixelsLabel: string;
  changeLevel: ProjectCompareDto["changeLevel"];
  comparisonQuality: ProjectCompareDto["comparisonQuality"];
  heatmapPreviewUrl: string;
};

export function mapChangeDetectionViewModel(
  dto: ProjectCompareDto,
): ChangeDetectionViewModel {
  return {
    flightAId: dto.flightA,
    flightBId: dto.flightB,
    changePercentageLabel: formatPercent(dto.changePercentage),
    changedPixelsLabel: dto.changedPixels.toLocaleString("pt-BR"),
    changeLevel: dto.changeLevel,
    comparisonQuality: dto.comparisonQuality,
    heatmapPreviewUrl: artifactPreviewUrl(dto.heatmapArtifactId),
  };
}

function formatPercent(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}
