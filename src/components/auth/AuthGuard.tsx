"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { isAuthenticated } from "@/services/auth.service";
import { DEMO_ENABLED } from "@/features/demo/demo-seed";

const PUBLIC_ROUTES = ["/login", "/demo"];

function subscribeToAuthStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authenticated = useSyncExternalStore<boolean | null>(subscribeToAuthStorage, isAuthenticated, () => null);
  const publicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const permitted = publicRoute || DEMO_ENABLED || authenticated;

  useEffect(() => {
    if (permitted === false) router.replace("/login");
  }, [pathname, permitted, router]);

  if (!permitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="inline-block size-6 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
