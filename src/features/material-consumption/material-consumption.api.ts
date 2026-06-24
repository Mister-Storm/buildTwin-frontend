import type { InventoryUnit, MaterialType } from "@/types/api/material-inventory.api";

export type ConsumptionDataCompletenessDto = {
  inventoryAvailable: boolean;
  builtAreaAvailable: boolean;
};

export type MaterialConsumptionItemDto = {
  materialType: MaterialType;
  quantityAtFlightA: number;
  quantityAtFlightB: number;
  quantityConsumed: number;
  consumptionPerSquareMeter: number | null;
  unit: InventoryUnit;
};

export type ProjectMaterialConsumptionDto = {
  projectId: string;
  flightAId: string;
  flightBId: string;
  analysisGeneratedAt: string;
  dataCompleteness: ConsumptionDataCompletenessDto;
  builtAreaAtFlightA: number | null;
  builtAreaAtFlightB: number | null;
  builtAreaDelta: number | null;
  totalConsumedMaterials: number;
  materials: MaterialConsumptionItemDto[];
};
