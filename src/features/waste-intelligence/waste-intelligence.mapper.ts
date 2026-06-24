import { MATERIAL_TYPE_LABELS } from "@/features/material-inventory/material-inventory.mapper";
import {
  getBenchmarkSourceLabel,
  getWasteClassificationLabel,
} from "@/features/waste-intelligence/waste-classification.mapper";
import type {
  ProjectWasteAnalysisDto,
  WasteAnalysisMaterialItemDto,
  WasteClassification,
} from "@/features/waste-intelligence/waste-intelligence.api";

export type WasteAnalysisRow = {
  materialLabel: string;
  actualPerSquareMeterLabel: string;
  expectedPerSquareMeterLabel: string;
  variancePercentLabel: string;
  classification: WasteClassification | null;
  classificationLabel: string | null;
  benchmarkSourceLabel: string | null;
};

export type WasteIntelligenceViewModel = {
  wasteScoreLabel: string;
  materialsAtRiskLabel: string;
  criticalMaterialsLabel: string;
  confidenceLabel: string;
  benchmarkVersionLabel: string;
  builtAreaUnavailableNote: string | null;
  rows: WasteAnalysisRow[];
};

export function mapWasteAnalysisRows(
  materials: WasteAnalysisMaterialItemDto[],
): WasteAnalysisRow[] {
  return materials.map((item) => ({
    materialLabel: MATERIAL_TYPE_LABELS[item.materialType],
    actualPerSquareMeterLabel: formatPerSquareMeter(item.actualPerSquareMeter, item.unit),
    expectedPerSquareMeterLabel: formatPerSquareMeter(item.expectedPerSquareMeter, item.unit),
    variancePercentLabel: formatVariance(item.variancePercent),
    classification: item.classification,
    classificationLabel: item.classification
      ? getWasteClassificationLabel(item.classification)
      : null,
    benchmarkSourceLabel: item.benchmarkSource
      ? getBenchmarkSourceLabel(item.benchmarkSource)
      : null,
  }));
}

export function mapWasteIntelligenceViewModel(
  dto: ProjectWasteAnalysisDto,
): WasteIntelligenceViewModel {
  const rows = mapWasteAnalysisRows(dto.materials);
  const warningCount = dto.materials.filter((item) => item.classification === "WARNING").length;
  const criticalCount = dto.materials.filter((item) => item.classification === "CRITICAL").length;

  return {
    wasteScoreLabel: String(dto.overallWasteScore),
    materialsAtRiskLabel: String(warningCount),
    criticalMaterialsLabel: String(criticalCount),
    confidenceLabel: formatConfidence(dto.analysisConfidence),
    benchmarkVersionLabel: dto.benchmarkVersion,
    builtAreaUnavailableNote: dto.dataCompleteness.builtAreaAvailable
      ? null
      : "Variação indisponível — área construída ausente em um dos levantamentos",
    rows,
  };
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function formatVariance(value: number | null): string {
  if (value == null) {
    return "—";
  }
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function formatPerSquareMeter(
  value: number | null,
  unit: string,
): string {
  if (value == null) {
    return "—";
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${formatUnit(unit)}/m²`;
}

function formatUnit(unit: string): string {
  switch (unit) {
    case "UNIT":
      return "un";
    case "BAG":
      return "sacos";
    case "CUBIC_METER":
      return "m³";
    case "KILOGRAM":
      return "kg";
    default:
      return unit;
  }
}
