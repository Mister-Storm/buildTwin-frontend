"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/shared/NativeSelect";
import { detectBuiltArea } from "@/services/built-area.service";
import { describeCapabilityFailure, type CapabilityNotice } from "@/services/capabilities.service";
import { CapabilityNoticeMessage } from "@/features/capabilities/CapabilityNoticeMessage";
import { useCapabilityNotice } from "@/features/capabilities/use-capability";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";
import { formatDate, parseDateOnly } from "@/lib/formatters";

type DetectBuiltAreaButtonProps = {
  captureSessions: ProjectCaptureSessionListItemDto[];
  onDetected?: (result: {
    previewArtifactId: string | null;
    detectedAreaSquareMeters: number;
    confidenceScore: number;
  }) => void;
};

export function DetectBuiltAreaButton({
  captureSessions,
  onDetected,
}: DetectBuiltAreaButtonProps) {
  const router = useRouter();
  const [selectedCaptureSessionId, setSelectedCaptureSessionId] = useState(captureSessions[0]?.captureSessionId ?? "");
  const [error, setError] = useState<CapabilityNotice | null>(null);
  const [isPending, startTransition] = useTransition();
  const capabilityNotice = useCapabilityNotice("BUILT_AREA_DETECTION");
  const notice = error ?? capabilityNotice;

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
        const result = await detectBuiltArea(selectedCaptureSessionId);
        onDetected?.({
          previewArtifactId: result.previewArtifactId,
          detectedAreaSquareMeters: result.detectedAreaSquareMeters,
          confidenceScore: result.confidenceScore,
        });
        router.refresh();
      } catch (err) {
        setError(describeCapabilityFailure(err, "Falha na detecção de área construída"));
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
        <Button type="button" onClick={handleDetect} disabled={isPending || !selectedCaptureSessionId || capabilityNotice !== null}>
          <Sparkles className="mr-2 size-4" />
          {isPending ? "Detectando..." : "Detectar Área com IA"}
        </Button>
      </div>
      {notice ? <CapabilityNoticeMessage notice={notice} /> : null}
    </div>
  );
}
