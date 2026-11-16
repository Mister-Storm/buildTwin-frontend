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
  TILE: "Azulejo",
  MORTAR: "Argamassa",
  FORMWORK: "Forma",
  PIPES: "Tubulação",
  CABLES: "Cabos",
  OTHER: "Outro",
};

export const MOVEMENT_TYPE_LABELS = {
  STOCK: "Estoque",
  RECEIVED: "Recebido",
  CONSUMED: "Consumido",
  WASTE: "Desperdício",
} as const;

export type MaterialInventoryHistoryRow = {
  rowKey: string;
  captureDateLabel: string;
  recordedAtLabel: string;
  materialLabel: string;
  metricLabel: string;
  metricValueLabel: string;
  unitLabel: string;
  confidenceLabel: string | null;
  storageZoneLabel: string;
  movementTypeLabel: string;
  source: string;
  isAiSource: boolean;
};

export type MaterialInventoryCompareRow = {
  materialLabel: string;
  quantityAtCaptureSessionALabel: string;
  quantityAtCaptureSessionBLabel: string;
  inventoryDeltaLabel: string;
  storageZoneAtCaptureSessionALabel: string;
  storageZoneAtCaptureSessionBLabel: string;
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
  const historyRows = dto.snapshots.map((snapshot) => {
    const isAiSource = snapshot.source === "AI_DETECTED";
    const observedValue = observedSnapshotValue(snapshot);
    return {
      rowKey: `${snapshot.captureSessionId}-${snapshot.materialType}-${snapshot.source}-${snapshot.recordedAt}`,
      captureDateLabel: formatDate(parseDateOnly(snapshot.captureDate)),
      recordedAtLabel: formatDateTime(snapshot.recordedAt),
      materialLabel: MATERIAL_TYPE_LABELS[snapshot.materialType],
      metricLabel: isAiSource ? "Objetos detectados" : "Quantidade",
      metricValueLabel: observedValue === null ? UNKNOWN_QUANTITY_LABEL : formatQuantity(observedValue),
      unitLabel: observedValue === null ? "" : formatUnit(snapshot.unit),
      confidenceLabel:
        isAiSource && snapshot.confidenceScore != null
          ? `${Math.round(snapshot.confidenceScore * 100)}%`
          : null,
      storageZoneLabel: snapshot.storageZone?.trim() ? snapshot.storageZone : "—",
      movementTypeLabel: MOVEMENT_TYPE_LABELS[snapshot.movementType],
      source: snapshot.source,
      isAiSource,
    };
  });

  const latestCaptureSessionDate =
    dto.snapshots.length > 0
      ? dto.snapshots.reduce((latest, snapshot) => {
          const current = parseDateOnly(snapshot.captureDate).getTime();
          return current > latest ? current : latest;
        }, 0)
      : null;

  const latestSnapshots =
    latestCaptureSessionDate == null
      ? []
      : dto.snapshots.filter(
          (snapshot) =>
            parseDateOnly(snapshot.captureDate).getTime() === latestCaptureSessionDate,
        );

  return {
    projectId: dto.projectId,
    currentQuantityLabel: formatCurrentQuantity(latestSnapshots),
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
    quantityAtCaptureSessionALabel: formatQuantityWithUnit(item.quantityAtCaptureSessionA, item.unit),
    quantityAtCaptureSessionBLabel: formatQuantityWithUnit(item.quantityAtCaptureSessionB, item.unit),
    inventoryDeltaLabel:
      item.inventoryDelta === null
        ? UNAVAILABLE_LABEL
        : formatSignedDelta(item.inventoryDelta, item.unit),
    storageZoneAtCaptureSessionALabel: item.storageZoneAtCaptureSessionA?.trim() ? item.storageZoneAtCaptureSessionA : "—",
    storageZoneAtCaptureSessionBLabel: item.storageZoneAtCaptureSessionB?.trim() ? item.storageZoneAtCaptureSessionB : "—",
  }));
}

export function calculateStockVariation(materials: MaterialInventoryCompareItemDto[]): string {
  if (materials.length === 0) {
    return UNAVAILABLE_LABEL;
  }
  const deltas: number[] = [];
  for (const item of materials) {
    if (item.inventoryDelta === null) {
      return UNAVAILABLE_LABEL;
    }
    deltas.push(item.inventoryDelta);
  }
  if (new Set(materials.map((item) => item.unit)).size > 1) {
    return UNAVAILABLE_LABEL;
  }
  return formatSignedNumber(deltas.reduce((sum, delta) => sum + delta, 0));
}

const UNAVAILABLE_LABEL = "Não disponível";
const UNKNOWN_QUANTITY_LABEL = "Não informado";

type InventorySnapshotItem = ProjectMaterialInventoryDto["snapshots"][number];

function observedSnapshotValue(snapshot: InventorySnapshotItem): number | null {
  const value = snapshot.source === "AI_DETECTED" ? snapshot.detectedObjects : snapshot.quantity;
  return value === null || value === undefined || !Number.isFinite(value) ? null : value;
}

function formatCurrentQuantity(latestSnapshots: InventorySnapshotItem[]): string {
  if (latestSnapshots.length === 0) {
    return UNAVAILABLE_LABEL;
  }
  const known = latestSnapshots.flatMap((snapshot) => {
    const value = observedSnapshotValue(snapshot);
    return value === null ? [] : [{ value, unit: snapshot.unit }];
  });
  if (known.length === 0) {
    return UNAVAILABLE_LABEL;
  }
  const unknownCount = latestSnapshots.length - known.length;
  const materialsLabel =
    unknownCount > 0
      ? `${latestSnapshots.length} materiais, ${unknownCount} sem quantidade informada`
      : `${latestSnapshots.length} materiais`;
  if (new Set(known.map((entry) => entry.unit)).size > 1) {
    return `Total indisponível: unidades distintas (${materialsLabel})`;
  }
  const total = known.reduce((sum, entry) => sum + entry.value, 0);
  return `${formatQuantity(total)} ${formatUnit(known.at(0)?.unit ?? "UNIT")} (${materialsLabel})`;
}

function formatQuantityWithUnit(value: number | null, unit: string): string {
  return value === null ? UNKNOWN_QUANTITY_LABEL : `${formatQuantity(value)} ${formatUnit(unit)}`;
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
