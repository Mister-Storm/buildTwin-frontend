/**
 * Placeholder for future SSR cookie auth.
 * Client routes use auth.service guards until httpOnly sessions exist.
 */
export function requireAuth(): void {
  // TODO: read session cookie and redirect when backend supports SSR auth.
}

export function getAuthToken(): string | null {
  // Server-side token extraction from cookie — TODO with multi-tenant
  return null;
}
