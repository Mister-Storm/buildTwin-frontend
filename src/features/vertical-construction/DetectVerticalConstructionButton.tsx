"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/shared/NativeSelect";
import { detectVerticalConstruction } from "@/services/vertical-construction.service";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";
import { formatDate, parseDateOnly } from "@/lib/formatters";

type DetectVerticalConstructionButtonProps = {
  captureSessions: ProjectCaptureSessionListItemDto[];
  onDetected?: (result: {
    previewArtifactId: string | null;
    detectedFloors: number;
    estimatedHeightMeters: number;
    confidenceScore: number;
  }) => void;
};

export function DetectVerticalConstructionButton({
  captureSessions,
  onDetected,
}: DetectVerticalConstructionButtonProps) {
  const router = useRouter();
  const [selectedCaptureSessionId, setSelectedCaptureSessionId] = useState(captureSessions[0]?.captureSessionId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (captureSessions.length === 0) {
    return null;
  }

  const handleDetect = () => {
    if (!selectedCaptureSessionId) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await detectVerticalConstruction(selectedCaptureSessionId);
        onDetected?.({
          previewArtifactId: result.previewArtifactId,
          detectedFloors: result.detectedFloors,
          estimatedHeightMeters: result.estimatedHeightMeters,
          confidenceScore: result.confidenceScore,
        });
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Falha na detecção de construção vertical",
        );
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <NativeSelect
          className="w-[220px]"
          value={selectedCaptureSessionId}
          onChange={(event) => setSelectedCaptureSessionId(event.target.value)}
          disabled={isPending}
        >
          {captureSessions.map((captureSession) => (
            <option key={captureSession.captureSessionId} value={captureSession.captureSessionId}>
              {formatDate(parseDateOnly(captureSession.captureDate))}
            </option>
          ))}
        </NativeSelect>
        <Button type="button" onClick={handleDetect} disabled={isPending || !selectedCaptureSessionId}>
          <Sparkles className="mr-2 size-4" />
          {isPending ? "Detectando..." : "Detectar Pavimentos com IA"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
