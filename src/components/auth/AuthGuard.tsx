"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/services/auth.service";

const PUBLIC_ROUTES = ["/login", "/demo"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      // Skip auth check for public routes
      if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        setChecking(false);
        return;
      }

      if (!isAuthenticated()) {
        router.replace("/login");
      } else {
        setChecking(false);
      }
    };
    check();
  }, [pathname, router]);

  // Show nothing while checking to avoid flash of protected content
  if (checking && !PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="inline-block size-6 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
