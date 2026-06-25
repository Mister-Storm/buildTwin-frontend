import type { InventoryUnit, MaterialType } from "@/types/api/material-inventory.api";

export type ConsumptionDataCompletenessDto = {
  inventoryAvailable: boolean;
  builtAreaAvailable: boolean;
};

export type MaterialConsumptionItemDto = {
  materialType: MaterialType;
  quantityAtCaptureSessionA: number;
  quantityAtCaptureSessionB: number;
  quantityConsumed: number;
  consumptionPerSquareMeter: number | null;
  unit: InventoryUnit;
};

export type ProjectMaterialConsumptionDto = {
  projectId: string;
  captureSessionAId: string;
  captureSessionBId: string;
  analysisGeneratedAt: string;
  dataCompleteness: ConsumptionDataCompletenessDto;
  builtAreaAtCaptureSessionA: number | null;
  builtAreaAtCaptureSessionB: number | null;
  builtAreaDelta: number | null;
  totalConsumedMaterials: number;
  materials: MaterialConsumptionItemDto[];
};
