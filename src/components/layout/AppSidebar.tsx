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
        "flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo / Brand */}
      <div className={cn("border-b border-sidebar-border", collapsed ? "px-2 py-4" : "px-4 py-5")}>
        <Link href="/demo" className="block">
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
          {!collapsed && (
            <>
              <p className="mt-3 text-xs text-sidebar-foreground/70">
                See Your Construction Site Evolve
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-accent">
                Construction Intelligence Platform
              </p>
            </>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1", collapsed ? "p-2" : "p-4")}>
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

      {/* Collapse toggle + footer */}
      <div className={cn("border-t border-sidebar-border", collapsed ? "p-2" : "p-4")}>
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg text-xs text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground/80",
            collapsed ? "justify-center p-2" : "p-2",
          )}
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          {!collapsed && <span>Recolher</span>}
        </button>
        {!collapsed && (
          <p className="mt-2 text-xs text-sidebar-foreground/60">
            Pilot Readiness · Sprint 6C
          </p>
        )}
      </div>
    </aside>
  );
}
