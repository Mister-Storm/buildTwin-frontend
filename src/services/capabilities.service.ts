import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import { ApiError } from "@/types/api/common.api";

export type CapabilityName =
  | "CAPTURE_UPLOAD_INTEGRITY"
  | "ORTHOMOSAIC_PHOTOGRAMMETRY"
  | "TEMPORAL_VISUAL_COMPARISON"
  | "EXECUTIVE_REPORT_PDF"
  | "BUILT_AREA_DETECTION"
  | "VERTICAL_CONSTRUCTION_DETECTION"
  | "MATERIAL_INVENTORY_DETECTION"
  | "TEMPORAL_PROGRESS_PERCENTAGE"
  | "DRONE_MISSION_OPERATIONAL_EXPORT"
  | "DIGITAL_TWIN_INGESTION"
  | "INVESTOR_DEMO_MODE";

export type CapabilityState =
  | "AVAILABLE"
  | "UNAVAILABLE_MISSING_RESOURCES"
  | "RESTRICTED_PENDING_VALIDATION"
  | "DEMONSTRATION_ONLY";

export type CapabilitySummary = {
  name: CapabilityName;
  state: CapabilityState;
  userFriendlyReason: string;
};

type CapabilitiesResponse = {
  releaseVersion: string;
  environmentProfile: string;
  capabilities: CapabilitySummary[];
};

export type CapabilityNotice = {
  kind: "unavailable" | "restricted" | "permission" | "other";
  title: string;
  message: string;
};

const UNAVAILABLE_TITLE = "Recurso indisponível";
const RESTRICTED_TITLE = "Restrito pela política comercial";

export async function getCapabilities(): Promise<CapabilitySummary[]> {
  debugLog("getCapabilities");
  const response = await apiFetch<CapabilitiesResponse>("/capabilities");
  return response.capabilities;
}

export function describeCapabilityState(capability: CapabilitySummary): CapabilityNotice | null {
  switch (capability.state) {
    case "AVAILABLE":
      return null;
    case "UNAVAILABLE_MISSING_RESOURCES":
      return { kind: "unavailable", title: UNAVAILABLE_TITLE, message: capability.userFriendlyReason };
    case "RESTRICTED_PENDING_VALIDATION":
    case "DEMONSTRATION_ONLY":
      return { kind: "restricted", title: RESTRICTED_TITLE, message: capability.userFriendlyReason };
  }
}

export function describeCapabilityFailure(error: unknown, fallbackTitle: string): CapabilityNotice {
  if (!(error instanceof ApiError)) {
    return { kind: "other", title: fallbackTitle, message: fallbackTitle };
  }
  if (error.code === "CAPABILITY_UNAVAILABLE") {
    return { kind: "unavailable", title: UNAVAILABLE_TITLE, message: error.message };
  }
  if (error.code === "CAPABILITY_RESTRICTED") {
    return { kind: "restricted", title: RESTRICTED_TITLE, message: error.message };
  }
  if (error.status === 403) {
    return { kind: "permission", title: "Sem permissão", message: "Seu perfil não permite executar esta ação neste projeto." };
  }
  return { kind: "other", title: fallbackTitle, message: error.message };
}
