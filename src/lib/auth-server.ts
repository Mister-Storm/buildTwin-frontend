import { redirect } from "next/navigation";

/**
 * Middleware helper — redirects unauthenticated users to /login.
 * Call from server components that require auth.
 */
export function requireAuth(): void {
  // In a real app this would read a cookie/session.
  // For the demo MVP, the client side handles auth checks.
  // This server-side guard is a future enhancement with SSR cookies.
}

export function getAuthToken(): string | null {
  // Server-side token extraction from cookie — TODO with multi-tenant
  return null;
}
