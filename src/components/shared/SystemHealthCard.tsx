import type { ComponentHealthStatus } from "@/types/api/system.api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StatusVariant } from "@/features/domain/models/flight";
import { formatDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type SystemHealthCardProps = {
  name: string;
  status: ComponentHealthStatus;
  icon: LucideIcon;
  version?: string | null | undefined;
  lastCheck?: string | null | undefined;
  details?: string | null | undefined;
  className?: string;
};

function healthVariant(status: ComponentHealthStatus): StatusVariant {
  switch (status) {
    case "UP":
      return "success";
    case "DEGRADED":
      return "warning";
    case "DOWN":
      return "error";
    default:
      return "neutral";
  }
}

function healthLabel(status: ComponentHealthStatus): string {
  switch (status) {
    case "UP":
      return "UP";
    case "DEGRADED":
      return "DEGRADED";
    case "DOWN":
      return "DOWN";
    default:
      return status;
  }
}

export function SystemHealthCard({
  name,
  status,
  icon: Icon,
  version,
  lastCheck,
  details,
  className,
}: SystemHealthCardProps) {
  return (
    <Card className={cn("border-border/60", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-brand-support" />
            <CardTitle className="text-base">{name}</CardTitle>
          </div>
          <StatusBadge label={healthLabel(status)} variant={healthVariant(status)} />
        </div>
        {version ? (
          <CardDescription>v{version}</CardDescription>
        ) : (
          <CardDescription>Componente operacional</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground">
        {lastCheck ? (
          <p>Último check: {formatDateTime(new Date(lastCheck))}</p>
        ) : null}
        {details ? <p className="text-brand-warning">{details}</p> : null}
      </CardContent>
    </Card>
  );
}
