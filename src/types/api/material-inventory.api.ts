export type MaterialType =
  | "BRICK"
  | "CEMENT"
  | "SAND"
  | "GRAVEL"
  | "STEEL"
  | "CONCRETE_BLOCK"
  | "WOOD"
  | "REBAR"
  | "FORMWORK"
  | "PIPES"
  | "CABLES"
  | "OTHER";

export type InventoryUnit = "UNIT" | "BAG" | "CUBIC_METER" | "KILOGRAM";

export type InventorySource = "MANUAL" | "AI_DETECTED";

export type MaterialMovementType = "STOCK" | "RECEIVED" | "CONSUMED" | "WASTE";

export type DetectionBoundingBoxDto = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number | null;
};

export type DetectionMetadataDto = {
  detectorVersion: string;
  confidenceScore: number;
  boundingBoxes?: DetectionBoundingBoxDto[];
};

export type RegisterMaterialInventoryItemRequestDto = {
  materialType: MaterialType;
  quantity: number;
  unit: InventoryUnit;
  storageZone?: string | null;
};

export type RegisterMaterialInventoryRequestDto = {
  items: RegisterMaterialInventoryItemRequestDto[];
  recordedAt?: string | null;
};

export type MaterialInventorySnapshotResponseDto = {
  id: string;
  projectId: string;
  flightId: string;
  materialType: MaterialType;
  quantity: number | null;
  detectedObjects: number | null;
  estimatedQuantity: number | null;
  unit: InventoryUnit;
  source: InventorySource;
  movementType: MaterialMovementType;
  storageZone: string | null;
  confidenceScore: number | null;
  detectionMetadata: DetectionMetadataDto | null;
  recordedAt: string;
  createdAt: string;
};

export type RegisterMaterialInventoryResponseDto = {
  snapshots: MaterialInventorySnapshotResponseDto[];
};

export type ProjectMaterialInventoryItemDto = {
  flightId: string;
  flightDate: string;
  materialType: MaterialType;
  quantity: number | null;
  detectedObjects: number | null;
  estimatedQuantity: number | null;
  unit: InventoryUnit;
  source: InventorySource;
  movementType: MaterialMovementType;
  storageZone: string | null;
  confidenceScore: number | null;
  detectionMetadata: DetectionMetadataDto | null;
  recordedAt: string;
  createdAt: string;
};

export type ProjectMaterialInventoryDto = {
  projectId: string;
  snapshots: ProjectMaterialInventoryItemDto[];
};

export type MaterialInventoryCompareItemDto = {
  materialType: MaterialType;
  quantityAtFlightA: number;
  quantityAtFlightB: number;
  inventoryDelta: number;
  storageZoneAtFlightA: string | null;
  storageZoneAtFlightB: string | null;
  unit: InventoryUnit;
};

export type ProjectMaterialInventoryCompareDto = {
  projectId: string;
  flightAId: string;
  flightBId: string;
  materials: MaterialInventoryCompareItemDto[];
};

export type DetectedMaterialItemDto = {
  materialType: MaterialType;
  detectedObjects: number;
  estimatedQuantity: number | null;
  unit: InventoryUnit;
  confidenceScore: number;
  detectionMetadata: DetectionMetadataDto;
};

export type DetectMaterialInventoryResponseDto = {
  flightId: string;
  previewArtifactId: string | null;
  detectedMaterials: DetectedMaterialItemDto[];
};
