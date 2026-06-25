"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/shared/NativeSelect";
import { detectVerticalConstruction } from "@/services/vertical-construction.service";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";
import { formatDate, parseDateOnly } from "@/lib/formatters";

type DetectVerticalConstructionButtonProps = {
  flights: ProjectFlightListItemDto[];
  onDetected?: (result: {
    previewArtifactId: string | null;
    detectedFloors: number;
    estimatedHeightMeters: number;
    confidenceScore: number;
  }) => void;
};

export function DetectVerticalConstructionButton({
  flights,
  onDetected,
}: DetectVerticalConstructionButtonProps) {
  const router = useRouter();
  const [selectedFlightId, setSelectedFlightId] = useState(flights[0]?.flightId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (flights.length === 0) {
    return null;
  }

  const handleDetect = () => {
    if (!selectedFlightId) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await detectVerticalConstruction(selectedFlightId);
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
          value={selectedFlightId}
          onChange={(event) => setSelectedFlightId(event.target.value)}
          disabled={isPending}
        >
          {flights.map((flight) => (
            <option key={flight.flightId} value={flight.flightId}>
              {formatDate(parseDateOnly(flight.flightDate))}
            </option>
          ))}
        </NativeSelect>
        <Button type="button" onClick={handleDetect} disabled={isPending || !selectedFlightId}>
          <Sparkles className="mr-2 size-4" />
          {isPending ? "Detectando..." : "Detectar Pavimentos com IA"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
