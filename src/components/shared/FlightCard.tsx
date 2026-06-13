import type { FlightTimelineEntry } from "@/features/domain/models/flight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/formatters";
import { Camera, User } from "lucide-react";

type FlightCardProps = {
  flight: FlightTimelineEntry;
};

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{formatDate(flight.date)}</CardTitle>
          <StatusBadge label={flight.statusLabel} variant={flight.statusVariant} />
        </div>
        <CardDescription className="flex items-center gap-1">
          <User className="size-3.5" />
          {flight.operatorName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Camera className="size-3.5" />
          {flight.imageCount} imagens
        </span>
        <StatusBadge
          label={flight.processingStatus}
          variant={flight.processingVariant}
        />
      </CardContent>
    </Card>
  );
}
