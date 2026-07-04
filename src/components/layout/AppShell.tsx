import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar, type BreadcrumbItem } from "@/components/layout/AppTopbar";
import { AuthGuard } from "@/components/auth/AuthGuard";

type AppShellProps = {
  breadcrumbs: BreadcrumbItem[];
  children: ReactNode;
};

export function AppShell({ breadcrumbs, children }: AppShellProps) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar breadcrumbs={breadcrumbs} />
          <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
