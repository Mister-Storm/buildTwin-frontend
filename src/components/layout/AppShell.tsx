"use client";

import { useState, type ReactNode, useCallback } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar, type BreadcrumbItem } from "@/components/layout/AppTopbar";
import { AuthGuard } from "@/components/auth/AuthGuard";

const STORAGE_KEY = "buildtwin-sidebar-collapsed";

type AppShellProps = {
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
};

function getStoredCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function AppShell({ breadcrumbs, children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(getStoredCollapsed);

  const handleToggle = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // storage unavailable (privacy mode, quota, etc.) — keep toggling in-session
      }
      return next;
    });
  }, []);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={handleToggle}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar breadcrumbs={breadcrumbs} />
          <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
