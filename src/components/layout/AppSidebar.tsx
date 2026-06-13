"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Building2, LayoutDashboard, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/demo", label: "Demo", icon: Presentation },
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projetos", icon: Building2 },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const [logoError, setLogoError] = useState(false);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-4 py-5">
        <Link href="/demo" className="block">
          {logoError ? (
            <span className="text-xl font-bold tracking-tight text-white">
              BuildTwin
            </span>
          ) : (
            <div className="inline-block rounded-lg bg-white px-3 py-2 shadow-sm">
              <Image
                src="/brand/logo-sidebar-physical.png"
                alt="BuildTwin"
                width={200}
                height={72}
                className="h-auto w-full max-w-[180px]"
                priority
                unoptimized
                onError={() => setLogoError(true)}
              />
            </div>
          )}
          <p className="mt-3 text-xs text-sidebar-foreground/70">
            See Your Construction Site Evolve
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-brand-accent">
            Construction Intelligence Platform
          </p>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-sidebar-foreground/60">
          Pilot Readiness · Sprint 6C
        </p>
      </div>
    </aside>
  );
}
