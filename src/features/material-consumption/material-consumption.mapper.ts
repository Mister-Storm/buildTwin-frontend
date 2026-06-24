import { MATERIAL_TYPE_LABELS } from "@/features/material-inventory/material-inventory.mapper";
import type {
  MaterialConsumptionItemDto,
  ProjectMaterialConsumptionDto,
} from "@/features/material-consumption/material-consumption.api";

export type MaterialConsumptionRow = {
  materialLabel: string;
  quantityAtFlightALabel: string;
  quantityAtFlightBLabel: string;
  quantityConsumedLabel: string;
  consumptionPerSquareMeterLabel: string;
};

export type ConsumptionAnalysisViewModel = {
  builtAreaDeltaLabel: string;
  totalConsumedMaterialsLabel: string;
  builtAreaUnavailableNote: string | null;
  rows: MaterialConsumptionRow[];
};

export function mapConsumptionRows(
  materials: MaterialConsumptionItemDto[],
): MaterialConsumptionRow[] {
  return materials.map((item) => ({
    materialLabel: MATERIAL_TYPE_LABELS[item.materialType],
    quantityAtFlightALabel: `${formatQuantity(item.quantityAtFlightA)} ${formatUnit(item.unit)}`,
    quantityAtFlightBLabel: `${formatQuantity(item.quantityAtFlightB)} ${formatUnit(item.unit)}`,
    quantityConsumedLabel: formatSignedQuantity(item.quantityConsumed, item.unit),
    consumptionPerSquareMeterLabel: formatConsumptionPerSquareMeter(
      item.consumptionPerSquareMeter,
      item.unit,
    ),
  }));
}

export function mapConsumptionAnalysisViewModel(
  dto: ProjectMaterialConsumptionDto,
): ConsumptionAnalysisViewModel {
  return {
    builtAreaDeltaLabel: formatBuiltAreaDelta(dto.builtAreaDelta),
    totalConsumedMaterialsLabel: formatQuantity(dto.totalConsumedMaterials),
    builtAreaUnavailableNote: dto.dataCompleteness.builtAreaAvailable
      ? null
      : "Normalização por m² indisponível — área construída ausente em um dos levantamentos",
    rows: mapConsumptionRows(dto.materials),
  };
}

function formatBuiltAreaDelta(delta: number | null): string {
  if (delta == null) {
    return "—";
  }
  return `${formatQuantity(delta)} m²`;
}

function formatConsumptionPerSquareMeter(
  value: number | null,
  unit: string,
): string {
  if (value == null) {
    return "—";
  }
  return `${formatQuantity(value)} ${formatUnit(unit)}/m²`;
}

function formatQuantity(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
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

function formatSignedQuantity(value: number, unit: string): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const formatted = Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return `${sign}${formatted} ${formatUnit(unit)}`;
}
