import { describe, expect, it } from "vitest";
import {
  calculateStockVariation,
  mapCompareRows,
  mapMaterialInventoryViewModel,
  MATERIAL_TYPE_LABELS,
} from "@/features/material-inventory/material-inventory.mapper";
import type {
  ProjectMaterialInventoryDto,
  ProjectMaterialInventoryItemDto,
} from "@/types/api/material-inventory.api";

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

  const latestSnapshot: ProjectMaterialInventoryItemDto = {
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

  it("should leave unknown manual quantity distinct from observed zero", () => {
    const viewModel = mapMaterialInventoryViewModel({
      projectId: "proj-1",
      snapshots: [
        {
          captureSessionId: "flight-missing",
          captureDate: "2026-06-15",
          materialType: "BRICK",
          quantity: null,
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
    });

    expect(viewModel.historyRows[0].metricValueLabel).not.toBe("0");
    expect(viewModel.currentQuantityLabel).not.toContain("0");
  });

  it("should keep observed zero quantity as zero", () => {
    const viewModel = mapMaterialInventoryViewModel({
      projectId: "proj-1",
      snapshots: [
        {
          captureSessionId: "flight-zero",
          captureDate: "2026-06-15",
          materialType: "BRICK",
          quantity: 0,
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
    });

    expect(viewModel.historyRows[0].metricValueLabel).toBe("0");
  });

  it("should leave compare unknown sides and delta unavailable when either observation is missing", () => {
    const rows = mapCompareRows([
      {
        materialType: "CEMENT",
        quantityAtCaptureSessionA: 120,
        quantityAtCaptureSessionB: null,
        inventoryDelta: null,
        storageZoneAtCaptureSessionA: null,
        storageZoneAtCaptureSessionB: null,
        unit: "BAG",
      },
    ]);

    expect(rows[0].quantityAtCaptureSessionBLabel).not.toMatch(/^0\b/);
    expect(rows[0].inventoryDeltaLabel).not.toMatch(/^[+−]?0(\s|$)/);
    expect(
      calculateStockVariation([
        {
          materialType: "CEMENT",
          quantityAtCaptureSessionA: 120,
          quantityAtCaptureSessionB: null,
          inventoryDelta: null,
          storageZoneAtCaptureSessionA: null,
          storageZoneAtCaptureSessionB: null,
          unit: "BAG",
        },
      ]),
    ).toBe("Não disponível");
  });

  it("should show unknown quantity wording instead of zero when a manual snapshot has no quantity", () => {
    const sut = mapMaterialInventoryViewModel({
      projectId: "proj-1",
      snapshots: [{ ...latestSnapshot, quantity: null }],
    });

    expect(sut.historyRows[0].metricValueLabel).toBe("Não informado");
    expect(sut.historyRows[0].unitLabel).toBe("");
    expect(sut.currentQuantityLabel).toBe("Não disponível");
  });

  it("should total only known quantities and disclose unknown materials when latest snapshots are partially unknown", () => {
    const sut = mapMaterialInventoryViewModel({
      projectId: "proj-1",
      snapshots: [
        { ...latestSnapshot, materialType: "BRICK", quantity: 3000 },
        { ...latestSnapshot, materialType: "SAND", quantity: null },
      ],
    });

    expect(sut.currentQuantityLabel).toContain("3.000");
    expect(sut.currentQuantityLabel).toContain("1 sem quantidade informada");
  });

  it("should withhold the combined quantity when latest snapshots use different units", () => {
    const sut = mapMaterialInventoryViewModel({
      projectId: "proj-1",
      snapshots: [
        { ...latestSnapshot, materialType: "BRICK", quantity: 3000, unit: "UNIT" },
        { ...latestSnapshot, materialType: "CEMENT", quantity: 40, unit: "BAG" },
      ],
    });

    expect(sut.currentQuantityLabel).toContain("unidades distintas");
    expect(sut.currentQuantityLabel).not.toContain("3.040");
  });

  it("should render explicit unknown wording for compare sides and delta when an observation is missing", () => {
    const sut = mapCompareRows([
      {
        materialType: "CEMENT",
        quantityAtCaptureSessionA: 120,
        quantityAtCaptureSessionB: null,
        inventoryDelta: null,
        storageZoneAtCaptureSessionA: null,
        storageZoneAtCaptureSessionB: null,
        unit: "BAG",
      },
    ]);

    expect(sut[0].quantityAtCaptureSessionALabel).toBe("120 sacos");
    expect(sut[0].quantityAtCaptureSessionBLabel).toBe("Não informado");
    expect(sut[0].inventoryDeltaLabel).toBe("Não disponível");
  });

  it("should keep an observed zero compare side distinct from a missing side", () => {
    const sut = mapCompareRows([
      {
        materialType: "CEMENT",
        quantityAtCaptureSessionA: 120,
        quantityAtCaptureSessionB: 0,
        inventoryDelta: 120,
        storageZoneAtCaptureSessionA: null,
        storageZoneAtCaptureSessionB: null,
        unit: "BAG",
      },
    ]);

    expect(sut[0].quantityAtCaptureSessionBLabel).toBe("0 sacos");
    expect(sut[0].inventoryDeltaLabel).toBe("+120 sacos");
  });

  it("should withhold the stock variation when any material delta is unknown", () => {
    const sut = calculateStockVariation([
      {
        materialType: "CEMENT",
        quantityAtCaptureSessionA: 120,
        quantityAtCaptureSessionB: 100,
        inventoryDelta: 20,
        storageZoneAtCaptureSessionA: null,
        storageZoneAtCaptureSessionB: null,
        unit: "BAG",
      },
      {
        materialType: "SAND",
        quantityAtCaptureSessionA: 5,
        quantityAtCaptureSessionB: null,
        inventoryDelta: null,
        storageZoneAtCaptureSessionA: null,
        storageZoneAtCaptureSessionB: null,
        unit: "BAG",
      },
    ]);

    expect(sut).toBe("Não disponível");
  });

  it("should withhold the stock variation when compared materials use different units", () => {
    const sut = calculateStockVariation([
      {
        materialType: "CEMENT",
        quantityAtCaptureSessionA: 120,
        quantityAtCaptureSessionB: 100,
        inventoryDelta: 20,
        storageZoneAtCaptureSessionA: null,
        storageZoneAtCaptureSessionB: null,
        unit: "BAG",
      },
      {
        materialType: "SAND",
        quantityAtCaptureSessionA: 5,
        quantityAtCaptureSessionB: 4,
        inventoryDelta: 1,
        storageZoneAtCaptureSessionA: null,
        storageZoneAtCaptureSessionB: null,
        unit: "CUBIC_METER",
      },
    ]);

    expect(sut).toBe("Não disponível");
  });

  it("should show observed zero stock variation as zero when every delta is known", () => {
    const sut = calculateStockVariation([
      {
        materialType: "CEMENT",
        quantityAtCaptureSessionA: 100,
        quantityAtCaptureSessionB: 100,
        inventoryDelta: 0,
        storageZoneAtCaptureSessionA: null,
        storageZoneAtCaptureSessionB: null,
        unit: "BAG",
      },
    ]);

    expect(sut).toBe("0");
  });
});
