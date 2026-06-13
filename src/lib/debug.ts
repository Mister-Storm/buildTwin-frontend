export function debugLog(
  message: string,
  data?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === "development") {
    console.debug("[BuildTwin]", message, data ?? "");
  }
}
