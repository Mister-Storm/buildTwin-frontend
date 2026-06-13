import { ApiError, type ApiErrorResponse } from "@/types/api/common.api";

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.BUILDTWIN_API_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    );
  }
  return "";
}

function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}/api/v1${path}`;
}

async function parseApiError(response: Response): Promise<ApiError> {
  let message = response.statusText;
  let code = "UNKNOWN_ERROR";
  try {
    const body = (await response.json()) as ApiErrorResponse;
    message = body.message;
    code = body.error;
  } catch {
    // keep defaults
  }
  return new ApiError(response.status, code, message);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildApiUrl(path);

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type UploadProgressCallback = (progress: {
  loaded: number;
  total: number;
  percent: number;
}) => void;

export function apiUpload<T>(
  path: string,
  formData: FormData,
  onProgress?: UploadProgressCallback,
): Promise<T> {
  const url = buildApiUrl(path);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Accept", "application/json");

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress({
        loaded: event.loaded,
        total: event.total,
        percent: Math.round((event.loaded / event.total) * 100),
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as T);
        } catch {
          reject(new ApiError(xhr.status, "PARSE_ERROR", "Resposta inválida"));
        }
        return;
      }
      try {
        const body = JSON.parse(xhr.responseText) as ApiErrorResponse;
        reject(new ApiError(xhr.status, body.error, body.message));
      } catch {
        reject(new ApiError(xhr.status, "UNKNOWN_ERROR", xhr.statusText));
      }
    };

    xhr.onerror = () => {
      reject(new ApiError(0, "NETWORK_ERROR", "Falha de rede no upload"));
    };

    xhr.send(formData);
  });
}

export function artifactPreviewUrl(artifactId: string): string {
  return `/api/v1/artifacts/${artifactId}/preview`;
}

export function artifactDownloadUrl(artifactId: string): string {
  return `/api/v1/artifacts/${artifactId}/download`;
}
