import { apiFetch } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  ReadinessResponseDto,
  SystemOverviewResponseDto,
  SystemSelfTestResponseDto,
} from "@/types/api/system.api";

export async function getSystemReadiness(): Promise<ReadinessResponseDto> {
  debugLog("getSystemReadiness");
  return apiFetch<ReadinessResponseDto>("/system/readiness");
}

export async function getSystemOverview(): Promise<SystemOverviewResponseDto> {
  debugLog("getSystemOverview");
  return apiFetch<SystemOverviewResponseDto>("/system/overview");
}

export async function runSystemSelfTest(): Promise<SystemSelfTestResponseDto> {
  debugLog("runSystemSelfTest");
  return apiFetch<SystemSelfTestResponseDto>("/system/self-test", {
    method: "POST",
  });
}
