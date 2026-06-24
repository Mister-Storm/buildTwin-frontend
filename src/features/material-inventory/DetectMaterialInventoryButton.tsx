"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/shared/NativeSelect";
import { detectMaterialInventory } from "@/services/material-inventory.service";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";
import { formatDate, parseDateOnly } from "@/lib/formatters";

type DetectMaterialInventoryButtonProps = {
  flights: ProjectFlightListItemDto[];
  onDetected?: (previewArtifactId: string | null) => void;
};

export function DetectMaterialInventoryButton({
  flights,
  onDetected,
}: DetectMaterialInventoryButtonProps) {
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
        const result = await detectMaterialInventory(selectedFlightId);
        onDetected?.(result.previewArtifactId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha na detecção de materiais");
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
          {isPending ? "Detectando..." : "Detectar Materiais com IA"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
