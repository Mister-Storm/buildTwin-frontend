import type { StatusVariant } from "@/features/domain/models/capture-session";
import type {
  BenchmarkSource,
  WasteClassification,
} from "@/features/waste-intelligence/waste-intelligence.api";

const CLASSIFICATION_LABELS: Record<WasteClassification, string> = {
  NORMAL: "Normal",
  WARNING: "Atenção",
  CRITICAL: "Crítico",
};

const CLASSIFICATION_VARIANTS: Record<WasteClassification, StatusVariant> = {
  NORMAL: "success",
  WARNING: "warning",
  CRITICAL: "error",
};

const BENCHMARK_SOURCE_LABELS: Record<BenchmarkSource, string> = {
  SYSTEM_DEFAULT: "Padrão do sistema",
  REGIONAL: "Regional",
  PROJECT_TYPE: "Tipo de obra",
  AI_GENERATED: "Gerado por IA",
};

export function getWasteClassificationLabel(classification: WasteClassification): string {
  return CLASSIFICATION_LABELS[classification];
}

export function getWasteClassificationVariant(classification: WasteClassification): StatusVariant {
  return CLASSIFICATION_VARIANTS[classification];
}

export function getBenchmarkSourceLabel(source: BenchmarkSource): string {
  return BENCHMARK_SOURCE_LABELS[source];
}
