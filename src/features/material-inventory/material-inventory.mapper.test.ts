import { describe, expect, it } from "vitest";
import {
  calculateStockVariation,
  mapCompareRows,
  mapMaterialInventoryViewModel,
  MATERIAL_TYPE_LABELS,
} from "@/features/material-inventory/material-inventory.mapper";
import type { ProjectMaterialInventoryDto } from "@/types/api/material-inventory.api";

describe("material-inventory.mapper", () => {
  const inventoryDto: ProjectMaterialInventoryDto = {
    projectId: "proj-1",
    snapshots: [
      {
        flightId: "flight-1",
        flightDate: "2026-05-01",
        materialType: "BRICK",
        quantity: 5000,
        unit: "UNIT",
        source: "MANUAL",
        movementType: "STOCK",
        storageZone: "North Yard",
        confidenceScore: null,
        recordedAt: "2026-05-01T10:00:00Z",
        createdAt: "2026-05-01T10:00:00Z",
      },
      {
        flightId: "flight-2",
        flightDate: "2026-06-15",
        materialType: "BRICK",
        quantity: 3000,
        unit: "UNIT",
        source: "MANUAL",
        movementType: "STOCK",
        storageZone: null,
        confidenceScore: null,
        recordedAt: "2026-06-15T14:30:00Z",
        createdAt: "2026-06-15T14:30:00Z",
      },
    ],
  };

  it("maps all material type labels in Portuguese", () => {
    expect(MATERIAL_TYPE_LABELS.BRICK).toBe("Tijolo");
    expect(MATERIAL_TYPE_LABELS.CONCRETE_BLOCK).toBe("Bloco de Concreto");
    expect(MATERIAL_TYPE_LABELS.CABLES).toBe("Cabos");
  });

  it("maps history rows and current quantity from latest flight", () => {
    const viewModel = mapMaterialInventoryViewModel(inventoryDto);

    expect(viewModel.historyRows).toHaveLength(2);
    expect(viewModel.historyRows[0].storageZoneLabel).toBe("North Yard");
    expect(viewModel.historyRows[1].movementTypeLabel).toBe("Estoque");
    expect(viewModel.currentQuantityLabel).toContain("3.000");
  });

  it("formats inventoryDelta in compare rows", () => {
    const rows = mapCompareRows([
      {
        materialType: "BRICK",
        quantityAtFlightA: 5000,
        quantityAtFlightB: 3000,
        inventoryDelta: 2000,
        storageZoneAtFlightA: "North Yard",
        storageZoneAtFlightB: null,
        unit: "UNIT",
      },
    ]);

    expect(rows[0].inventoryDeltaLabel).toContain("+2.000");
    expect(rows[0].storageZoneAtFlightALabel).toBe("North Yard");
  });

  it("calculates stock variation from inventoryDelta values", () => {
    expect(
      calculateStockVariation([
        {
          materialType: "BRICK",
          quantityAtFlightA: 5000,
          quantityAtFlightB: 3000,
          inventoryDelta: 2000,
          storageZoneAtFlightA: null,
          storageZoneAtFlightB: null,
          unit: "UNIT",
        },
      ]),
    ).toBe("+2.000");
  });
});
