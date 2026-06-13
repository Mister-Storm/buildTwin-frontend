"use client";

import Link from "next/link";
import type { FlightTimelineEntry } from "@/features/domain/models/flight";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

type FlightTimelineProps = {
  projectId: string;
  flights: FlightTimelineEntry[];
};

export function FlightTimeline({ projectId, flights }: FlightTimelineProps) {
  if (flights.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="hidden md:block">
        <div className="relative flex items-start justify-between gap-4 overflow-x-auto pb-4">
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" />
          {flights.map((flight) => (
            <TimelineNode
              key={flight.id}
              flight={flight}
              projectId={projectId}
              orientation="horizontal"
            />
          ))}
        </div>
      </div>
      <div className="md:hidden">
        <div className="relative space-y-6 pl-6">
          <div className="absolute bottom-0 left-2.5 top-0 w-0.5 bg-border" />
          {flights.map((flight) => (
            <TimelineNode
              key={flight.id}
              flight={flight}
              projectId={projectId}
              orientation="vertical"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type TimelineNodeProps = {
  flight: FlightTimelineEntry;
  projectId: string;
  orientation: "horizontal" | "vertical";
};

function TimelineNode({ flight, projectId, orientation }: TimelineNodeProps) {
  const href = `/projects/${projectId}/orthomosaic?flightId=${flight.id}`;
  const isHighlighted = flight.isLatest || flight.hasOrthomosaic;

  return (
    <Link
      href={href}
      className={cn(
        "group relative z-10 flex min-w-[140px] flex-col items-center text-center",
        orientation === "vertical" && "min-w-0 flex-row items-start gap-4 text-left",
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full border-2 bg-card transition-colors",
          isHighlighted
            ? "border-brand-accent text-brand-accent shadow-md shadow-brand-accent/20"
            : "border-border text-muted-foreground group-hover:border-brand-support",
          orientation === "vertical" && "absolute -left-6 top-0",
        )}
      >
        {flight.hasOrthomosaic ? (
          <ImageIcon className="size-4" />
        ) : (
          <span className="text-xs font-bold">
            {flight.date.getDate()}
          </span>
        )}
      </div>
      <div
        className={cn(
          "mt-3 space-y-1",
          orientation === "vertical" && "mt-0 flex-1",
        )}
      >
        <p className="text-sm font-semibold">{formatDate(flight.date)}</p>
        <StatusBadge label={flight.statusLabel} variant={flight.statusVariant} />
        <p className="text-xs text-muted-foreground">
          {flight.imageCount} imgs · {flight.processingStatus}
        </p>
        {flight.hasOrthomosaic ? (
          <p className="text-xs font-medium text-brand-accent">Ortomosaico disponível</p>
        ) : null}
      </div>
    </Link>
  );
}
