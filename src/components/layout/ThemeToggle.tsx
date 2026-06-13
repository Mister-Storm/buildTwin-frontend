"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function useIsMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function isActiveTheme(
  value: (typeof themes)[number]["value"],
  theme: string | undefined,
  resolvedTheme: string | undefined,
): boolean {
  if (value === "system") return theme === "system";
  if (theme === value) return true;
  if (!theme || theme === "system") return resolvedTheme === value;
  return false;
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useIsMounted();

  if (!mounted) {
    return <div className="size-8" aria-hidden />;
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5"
      role="group"
      aria-label="Alternar tema"
    >
      {themes.map(({ value, label, icon: Icon }) => {
        const active = isActiveTheme(value, theme, resolvedTheme);
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-md transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
