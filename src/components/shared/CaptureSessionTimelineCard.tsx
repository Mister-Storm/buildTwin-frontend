import type { CaptureSessionTimelineEntry } from "@/features/domain/models/capture-session";
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

type CaptureSessionTimelineCardProps = {
  captureSession: CaptureSessionTimelineEntry;
};

export function CaptureSessionTimelineCard({ captureSession }: CaptureSessionTimelineCardProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{formatDate(captureSession.date)}</CardTitle>
          <StatusBadge label={captureSession.statusLabel} variant={captureSession.statusVariant} />
        </div>
        <CardDescription className="flex items-center gap-1">
          <User className="size-3.5" />
          {captureSession.operatorName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Camera className="size-3.5" />
          {captureSession.imageCount} imagens
        </span>
        <StatusBadge
          label={captureSession.processingStatus}
          variant={captureSession.processingVariant}
        />
      </CardContent>
    </Card>
  );
}
