"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Presentation,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoredUser } from "@/services/auth.service";

const baseNavItems = [
  { href: "/demo", label: "Demo", icon: Presentation },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfólio", icon: BarChart3 },
  { href: "/projects", label: "Projetos", icon: Building2 },
] as const;

type AppSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);
  const isAdmin = typeof window !== "undefined"
    ? getStoredUser()?.roles?.includes("ADMIN") ?? false
    : false;

  const navItems = isAdmin
    ? [...baseNavItems, { href: "/admin", label: "Administração", icon: Shield }]
    : baseNavItems;

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo / Brand + Toggle button */}
      <div className={cn("flex items-center border-b border-sidebar-border", collapsed ? "px-2 py-3" : "px-4 py-4")}>
        <Link href="/demo" className="flex-1">
          {logoError ? (
            <span
              className={cn(
                "block font-bold tracking-tight text-white",
                collapsed ? "text-center text-lg" : "text-xl",
              )}
            >
              {collapsed ? "BT" : "BuildTwin"}
            </span>
          ) : (
            <div className={cn("inline-block rounded-lg bg-white shadow-sm", collapsed ? "px-1 py-1" : "px-3 py-2")}>
              <Image
                src="/brand/logo-sidebar-physical.png"
                alt="BuildTwin"
                width={collapsed ? 40 : 200}
                height={collapsed ? 40 : 72}
                className={cn("h-auto", collapsed ? "w-8" : "w-full max-w-[180px]")}
                priority
                unoptimized
                onError={() => setLogoError(true)}
              />
            </div>
          )}
        </Link>

        {/* Toggle button — always visible at top-right of sidebar */}
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent/60 hover:text-white",
            collapsed
              ? "mx-auto mt-2 h-8 w-8 text-sidebar-foreground/60"
              : "ml-2 h-7 w-7 shrink-0 text-sidebar-foreground/40 hover:text-sidebar-foreground/80",
          )}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 pb-2 pt-3">
          <p className="text-xs text-sidebar-foreground/70">
            See Your Construction Site Evolve
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-widest text-brand-accent">
            Construction Intelligence Platform
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1", collapsed ? "p-2" : "px-4 pb-4")}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                active
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white",
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/60">
            Pilot Readiness · Sprint 6C
          </p>
        </div>
      )}
    </aside>
  );
}
