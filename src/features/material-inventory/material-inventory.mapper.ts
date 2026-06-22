import type {
  MaterialInventoryCompareItemDto,
  MaterialType,
  ProjectMaterialInventoryDto,
} from "@/types/api/material-inventory.api";
import { formatDate, parseDateOnly } from "@/lib/formatters";

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  BRICK: "Tijolo",
  CEMENT: "Cimento",
  SAND: "Areia",
  GRAVEL: "Brita",
  STEEL: "Aço",
  CONCRETE_BLOCK: "Bloco de Concreto",
  WOOD: "Madeira",
  REBAR: "Vergalhão",
  FORMWORK: "Forma",
  PIPES: "Tubulação",
  CABLES: "Cabos",
  OTHER: "Outro",
};

export const MOVEMENT_TYPE_LABELS = {
  STOCK: "Estoque",
  DELIVERY: "Entrega",
  CONSUMPTION: "Consumo",
  WASTE: "Desperdício",
} as const;

export type MaterialInventoryHistoryRow = {
  rowKey: string;
  flightDateLabel: string;
  recordedAtLabel: string;
  materialLabel: string;
  quantityLabel: string;
  unitLabel: string;
  storageZoneLabel: string;
  movementTypeLabel: string;
  source: string;
};

export type MaterialInventoryCompareRow = {
  materialLabel: string;
  quantityAtFlightALabel: string;
  quantityAtFlightBLabel: string;
  inventoryDeltaLabel: string;
  storageZoneAtFlightALabel: string;
  storageZoneAtFlightBLabel: string;
};

export type MaterialInventoryViewModel = {
  projectId: string;
  currentQuantityLabel: string;
  stockVariationLabel: string;
  hasSnapshots: boolean;
  historyRows: MaterialInventoryHistoryRow[];
};

export function mapMaterialInventoryViewModel(
  dto: ProjectMaterialInventoryDto,
): MaterialInventoryViewModel {
  const historyRows = dto.snapshots.map((snapshot) => ({
    rowKey: `${snapshot.flightId}-${snapshot.materialType}-${snapshot.source}-${snapshot.recordedAt}`,
    flightDateLabel: formatDate(parseDateOnly(snapshot.flightDate)),
    recordedAtLabel: formatDateTime(snapshot.recordedAt),
    materialLabel: MATERIAL_TYPE_LABELS[snapshot.materialType],
    quantityLabel: formatQuantity(snapshot.quantity),
    unitLabel: formatUnit(snapshot.unit),
    storageZoneLabel: snapshot.storageZone?.trim() ? snapshot.storageZone : "—",
    movementTypeLabel: MOVEMENT_TYPE_LABELS[snapshot.movementType],
    source: snapshot.source,
  }));

  const latestFlightDate =
    dto.snapshots.length > 0
      ? dto.snapshots.reduce((latest, snapshot) => {
          const current = parseDateOnly(snapshot.flightDate).getTime();
          return current > latest ? current : latest;
        }, 0)
      : null;

  const latestSnapshots =
    latestFlightDate == null
      ? []
      : dto.snapshots.filter(
          (snapshot) =>
            parseDateOnly(snapshot.flightDate).getTime() === latestFlightDate,
        );

  const currentTotal = latestSnapshots.reduce((sum, snapshot) => sum + snapshot.quantity, 0);

  return {
    projectId: dto.projectId,
    currentQuantityLabel:
      latestSnapshots.length > 0
        ? `${formatQuantity(currentTotal)} (${latestSnapshots.length} materiais)`
        : "Não disponível",
    stockVariationLabel: "Selecione dois levantamentos para comparar",
    hasSnapshots: dto.snapshots.length > 0,
    historyRows,
  };
}

export function mapCompareRows(
  materials: MaterialInventoryCompareItemDto[],
): MaterialInventoryCompareRow[] {
  return materials.map((item) => ({
    materialLabel: MATERIAL_TYPE_LABELS[item.materialType],
    quantityAtFlightALabel: `${formatQuantity(item.quantityAtFlightA)} ${formatUnit(item.unit)}`,
    quantityAtFlightBLabel: `${formatQuantity(item.quantityAtFlightB)} ${formatUnit(item.unit)}`,
    inventoryDeltaLabel: formatSignedDelta(item.inventoryDelta, item.unit),
    storageZoneAtFlightALabel: item.storageZoneAtFlightA?.trim() ? item.storageZoneAtFlightA : "—",
    storageZoneAtFlightBLabel: item.storageZoneAtFlightB?.trim() ? item.storageZoneAtFlightB : "—",
  }));
}

export function calculateStockVariation(materials: MaterialInventoryCompareItemDto[]): string {
  if (materials.length === 0) {
    return "Não disponível";
  }
  const totalDelta = materials.reduce((sum, item) => sum + item.inventoryDelta, 0);
  return formatSignedNumber(totalDelta);
}

function formatQuantity(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
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

function formatSignedDelta(delta: number, unit: string): string {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  const formatted = Math.abs(delta).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `${sign}${formatted} ${formatUnit(unit)}`;
}

function formatSignedNumber(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const formatted = Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `${sign}${formatted}`;
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
