import type { StatusVariant } from "@/features/domain/models/capture-session";
import type {
  ChangeLevelDto,
  ComparisonQualityDto,
} from "@/types/api/compare.api";

const CHANGE_LEVEL_LABELS: Record<ChangeLevelDto, string> = {
  VERY_LOW: "Muito baixa",
  LOW: "Baixa",
  MODERATE: "Moderada",
  HIGH: "Alta",
  VERY_HIGH: "Muito alta",
};

const CHANGE_LEVEL_VARIANTS: Record<ChangeLevelDto, StatusVariant> = {
  VERY_LOW: "neutral",
  LOW: "info",
  MODERATE: "warning",
  HIGH: "warning",
  VERY_HIGH: "error",
};

export function getChangeLevelLabel(level: ChangeLevelDto): string {
  return CHANGE_LEVEL_LABELS[level];
}

export function getChangeLevelVariant(level: ChangeLevelDto): StatusVariant {
  return CHANGE_LEVEL_VARIANTS[level];
}

export function getComparisonQualityLabel(quality: ComparisonQualityDto): string {
  return quality === "NORMAL" ? "Normal" : "Baixa";
}

export function getComparisonQualityVariant(
  quality: ComparisonQualityDto,
): StatusVariant {
  return quality === "NORMAL" ? "success" : "warning";
}

export const LOW_COMPARISON_QUALITY_WARNING =
  "Os levantamentos possuem resoluções significativamente diferentes. Os resultados devem ser interpretados com cautela.";
