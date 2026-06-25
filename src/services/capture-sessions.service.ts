import { apiFetch, apiUpload, type UploadProgressCallback } from "@/services/api-client";
import { debugLog } from "@/lib/debug";
import type {
  CreateCaptureSessionRequestDto,
  CreateCaptureSessionResponseDto,
  CaptureSessionDetailsResponseDto,
  CaptureImageResponseDto,
  ProjectCaptureSessionListItemDto,
  UploadCaptureImageResponseDto,
} from "@/types/api/capture-session.api";
import type { LatestCaptureSessionJobResponseDto } from "@/types/api/processing.api";

export async function listCaptureSessionsByProject(
  projectId: string,
): Promise<ProjectCaptureSessionListItemDto[]> {
  debugLog("listCaptureSessionsByProject", { projectId });
  return apiFetch<ProjectCaptureSessionListItemDto[]>(
    `/projects/${projectId}/capture-sessions`,
  );
}

export async function getCaptureSession(
  captureSessionId: string,
): Promise<CaptureSessionDetailsResponseDto> {
  debugLog("getCaptureSession", { captureSessionId });
  return apiFetch<CaptureSessionDetailsResponseDto>(`/capture-sessions/${captureSessionId}`);
}

export async function getLatestCaptureSessionJob(
  captureSessionId: string,
): Promise<LatestCaptureSessionJobResponseDto> {
  debugLog("getLatestCaptureSessionJob", { captureSessionId });
  return apiFetch<LatestCaptureSessionJobResponseDto>(
    `/capture-sessions/${captureSessionId}/latest-job`,
  );
}

export async function createCaptureSession(
  projectId: string,
  dto: CreateCaptureSessionRequestDto,
): Promise<CreateCaptureSessionResponseDto> {
  debugLog("createCaptureSession", { projectId });
  return apiFetch<CreateCaptureSessionResponseDto>(`/projects/${projectId}/capture-sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function listCaptureSessionImages(
  captureSessionId: string,
): Promise<CaptureImageResponseDto[]> {
  debugLog("listCaptureSessionImages", { captureSessionId });
  return apiFetch<CaptureImageResponseDto[]>(`/capture-sessions/${captureSessionId}/images`);
}

export async function uploadCaptureSessionImages(
  captureSessionId: string,
  files: File[],
  onProgress?: UploadProgressCallback,
): Promise<UploadCaptureImageResponseDto[]> {
  debugLog("uploadCaptureSessionImages", { captureSessionId, count: files.length });
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  return apiUpload<UploadCaptureImageResponseDto[]>(
    `/capture-sessions/${captureSessionId}/images`,
    formData,
    onProgress,
  );
}
