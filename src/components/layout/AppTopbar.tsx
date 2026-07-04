"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ChevronRight, LogOut } from "lucide-react";
import { logout, getStoredUser } from "@/services/auth.service";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type AppTopbarProps = {
  breadcrumbs: BreadcrumbItem[];
};

export function AppTopbar({ breadcrumbs }: AppTopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight className="size-3.5" /> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted-foreground md:inline">
          {getStoredUser()?.displayName}
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Sair"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
