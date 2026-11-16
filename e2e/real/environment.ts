export interface RealBrowserEnvironment {
  baseURL: string;
  apiURL: string;
}

function requireURL(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is required for real-service browser tests`);
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error(`${name} must be an HTTP service URL without credentials`);
  }
  return url.origin;
}

export function resolveRealBrowserEnvironment(
  environment: Record<string, string | undefined>,
): RealBrowserEnvironment {
  if (
    environment.BUILDTWIN_DEMO_MODE !== "false" ||
    environment.NEXT_PUBLIC_BUILDTWIN_DEMO_MODE !== "false"
  ) {
    throw new Error("Real-service browser tests require both demo flags explicitly false");
  }
  return {
    baseURL: requireURL(environment.BUILDTWIN_REAL_BASE_URL, "BUILDTWIN_REAL_BASE_URL"),
    apiURL: requireURL(environment.BUILDTWIN_API_URL, "BUILDTWIN_API_URL"),
  };
}
