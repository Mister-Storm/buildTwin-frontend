import { ApiError, type ApiErrorResponse } from "@/types/api/common.api";

function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.BUILDTWIN_API_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    );
  }
  return "";
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = `${base}/api/v1${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = response.statusText;
    let code = "UNKNOWN_ERROR";
    try {
      const body = (await response.json()) as ApiErrorResponse;
      message = body.message;
      code = body.error;
    } catch {
      // keep defaults
    }
    throw new ApiError(response.status, code, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function artifactPreviewUrl(artifactId: string): string {
  return `/api/v1/artifacts/${artifactId}/preview`;
}

export function artifactDownloadUrl(artifactId: string): string {
  return `/api/v1/artifacts/${artifactId}/download`;
}
