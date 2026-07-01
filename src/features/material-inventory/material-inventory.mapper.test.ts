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
        captureSessionId: "flight-1",
        captureDate: "2026-05-01",
        materialType: "BRICK",
        quantity: 5000,
        detectedObjects: null,
        estimatedQuantity: null,
        unit: "UNIT",
        source: "MANUAL",
        movementType: "STOCK",
        storageZone: "North Yard",
        confidenceScore: null,
        detectionMetadata: null,
        recordedAt: "2026-05-01T10:00:00Z",
        createdAt: "2026-05-01T10:00:00Z",
      },
      {
        captureSessionId: "flight-2",
        captureDate: "2026-06-15",
        materialType: "BRICK",
        quantity: 3000,
        detectedObjects: null,
        estimatedQuantity: null,
        unit: "UNIT",
        source: "MANUAL",
        movementType: "STOCK",
        storageZone: null,
        confidenceScore: null,
        detectionMetadata: null,
        recordedAt: "2026-06-15T14:30:00Z",
        createdAt: "2026-06-15T14:30:00Z",
      },
    ],
  };

  it("maps all material type labels in Portuguese", () => {
    expect(MATERIAL_TYPE_LABELS.BRICK).toBe("Tijolo");
    expect(MATERIAL_TYPE_LABELS.CONCRETE_BLOCK).toBe("Bloco de Concreto");
    expect(MATERIAL_TYPE_LABELS.TILE).toBe("Azulejo");
    expect(MATERIAL_TYPE_LABELS.MORTAR).toBe("Argamassa");
    expect(MATERIAL_TYPE_LABELS.CABLES).toBe("Cabos");
  });

  it("defines a label for every MaterialType union member", () => {
    const materialTypes = Object.keys(MATERIAL_TYPE_LABELS) as (keyof typeof MATERIAL_TYPE_LABELS)[];
    expect(materialTypes).toHaveLength(14);
    for (const materialType of materialTypes) {
      expect(MATERIAL_TYPE_LABELS[materialType].length).toBeGreaterThan(0);
    }
  });

  it("maps history rows and current quantity from latest flight", () => {
    const viewModel = mapMaterialInventoryViewModel(inventoryDto);

    expect(viewModel.historyRows).toHaveLength(2);
    expect(viewModel.historyRows[0].storageZoneLabel).toBe("North Yard");
    expect(viewModel.historyRows[1].movementTypeLabel).toBe("Estoque");
    expect(viewModel.historyRows[0].metricLabel).toBe("Quantidade");
    expect(viewModel.currentQuantityLabel).toContain("3.000");
  });

  it("labels AI rows as detected objects with confidence", () => {
    const viewModel = mapMaterialInventoryViewModel({
      projectId: "proj-1",
      snapshots: [
        {
          captureSessionId: "flight-3",
          captureDate: "2026-06-20",
          materialType: "WOOD",
          quantity: null,
          detectedObjects: 42,
          estimatedQuantity: null,
          unit: "UNIT",
          source: "AI_DETECTED",
          movementType: "STOCK",
          storageZone: null,
          confidenceScore: 0.87,
          detectionMetadata: {
            detectorVersion: "yolov8-material-mvp-1.0",
            confidenceScore: 0.87,
          },
          recordedAt: "2026-06-20T10:00:00Z",
          createdAt: "2026-06-20T10:00:00Z",
        },
      ],
    });

    expect(viewModel.historyRows[0].metricLabel).toBe("Objetos detectados");
    expect(viewModel.historyRows[0].metricValueLabel).toContain("42");
    expect(viewModel.historyRows[0].confidenceLabel).toBe("87%");
    expect(viewModel.historyRows[0].isAiSource).toBe(true);
  });

  it("formats inventoryDelta in compare rows", () => {
    const rows = mapCompareRows([
      {
        materialType: "BRICK",
        quantityAtCaptureSessionA: 5000,
        quantityAtCaptureSessionB: 3000,
        inventoryDelta: 2000,
        storageZoneAtCaptureSessionA: "North Yard",
        storageZoneAtCaptureSessionB: null,
        unit: "UNIT",
      },
    ]);

    expect(rows[0].inventoryDeltaLabel).toContain("+2.000");
    expect(rows[0].storageZoneAtCaptureSessionALabel).toBe("North Yard");
  });

  it("calculates stock variation from inventoryDelta values", () => {
    expect(
      calculateStockVariation([
        {
          materialType: "BRICK",
          quantityAtCaptureSessionA: 5000,
          quantityAtCaptureSessionB: 3000,
          inventoryDelta: 2000,
          storageZoneAtCaptureSessionA: null,
          storageZoneAtCaptureSessionB: null,
          unit: "UNIT",
        },
      ]),
    ).toBe("+2.000");
  });
});
