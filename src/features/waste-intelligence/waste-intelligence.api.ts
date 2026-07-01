import type { InventoryUnit, MaterialType } from "@/types/api/material-inventory.api";

export type BenchmarkSource =
  | "SYSTEM_DEFAULT"
  | "TCPO_SINAPI"
  | "REGIONAL"
  | "PROJECT_TYPE"
  | "AI_GENERATED";

export type ConstructionType =
  | "RESIDENTIAL_1F"
  | "RESIDENTIAL_MF"
  | "COMMERCIAL"
  | "INDUSTRIAL";

export type WasteClassification = "NORMAL" | "WARNING" | "CRITICAL";

export type WasteNormalizationType = "AREA_BASED";

export type WasteDataCompletenessDto = {
  inventoryAvailable: boolean;
  builtAreaAvailable: boolean;
  benchmarksAvailable: boolean;
};

export type WasteAnalysisMaterialItemDto = {
  materialType: MaterialType;
  actualPerSquareMeter: number | null;
  expectedPerSquareMeter: number | null;
  variancePercent: number | null;
  classification: WasteClassification | null;
  benchmarkSource: BenchmarkSource | null;
  unit: InventoryUnit;
};

export type ProjectWasteAnalysisDto = {
  projectId: string;
  captureSessionAId: string;
  captureSessionBId: string;
  builtAreaDelta: number | null;
  overallWasteScore: number;
  analysisConfidence: number;
  normalizationType: WasteNormalizationType;
  benchmarkVersion: string;
  constructionType: ConstructionType;
  materials: WasteAnalysisMaterialItemDto[];
  dataCompleteness: WasteDataCompletenessDto;
};
