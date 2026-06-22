"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { NativeSelect } from "@/components/shared/NativeSelect";
import { registerBuiltArea } from "@/services/built-area.service";
import { ApiError } from "@/types/api/common.api";
import type { ProjectFlightListItemDto } from "@/types/api/flight.api";
import { formatDate, parseDateOnly } from "@/lib/formatters";

type RegisterBuiltAreaDialogProps = {
  flights: ProjectFlightListItemDto[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function RegisterBuiltAreaDialog({
  flights,
  open: controlledOpen,
  onOpenChange,
}: RegisterBuiltAreaDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [flightId, setFlightId] = useState(flights[0]?.flightId ?? "");
  const [areaInput, setAreaInput] = useState("");
  const [floorsInput, setFloorsInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    flightId?: string;
    area?: string;
    floors?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const errors: { flightId?: string; area?: string; floors?: string } = {};
    if (!flightId) {
      errors.flightId = "Selecione um levantamento.";
    }

    const parsedArea = Number(areaInput.replace(",", "."));
    if (!areaInput.trim() || Number.isNaN(parsedArea) || parsedArea <= 0) {
      errors.area = "Informe uma área maior que zero.";
    }

    let parsedFloors: number | undefined;
    if (floorsInput.trim()) {
      parsedFloors = Number(floorsInput);
      if (!Number.isInteger(parsedFloors) || parsedFloors < 1) {
        errors.floors = "Informe um número inteiro maior ou igual a 1.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerBuiltArea(flightId, {
        observedBuiltAreaSquareMeters: parsedArea,
        observedFloors: parsedFloors ?? null,
        notes: notesInput.trim() ? notesInput.trim() : null,
      });
      setOpen(false);
      setAreaInput("");
      setFloorsInput("");
      setNotesInput("");
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível registrar a área construída.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-1.5 shrink-0" />}>
        <Plus className="size-4" />
        Registrar Área Construída
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar Área Construída</DialogTitle>
          <DialogDescription>
            Informe a área construída observada para um levantamento. Este valor é
            registrado manualmente e pode ser usado no cálculo de conclusão da obra.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Levantamento" htmlFor="built-area-flight" error={fieldErrors.flightId}>
            <NativeSelect
              id="built-area-flight"
              value={flightId}
              onChange={(event) => setFlightId(event.target.value)}
              disabled={flights.length === 0 || isSubmitting}
            >
              {flights.length === 0 ? (
                <option value="">Nenhum levantamento disponível</option>
              ) : (
                flights.map((flight) => (
                  <option key={flight.flightId} value={flight.flightId}>
                    {formatDate(parseDateOnly(flight.flightDate))} — {flight.operatorName}
                  </option>
                ))
              )}
            </NativeSelect>
          </FormField>

          <FormField
            label="Área construída (m²)"
            error={fieldErrors.area}
            htmlFor="built-area-input"
          >
            <Input
              id="built-area-input"
              type="text"
              inputMode="decimal"
              placeholder="Ex.: 1250"
              value={areaInput}
              onChange={(event) => setAreaInput(event.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField
            label="Pavimentos construídos"
            error={fieldErrors.floors}
            htmlFor="built-area-floors"
          >
            <Input
              id="built-area-floors"
              type="number"
              min={1}
              step={1}
              placeholder="Ex.: 4"
              value={floorsInput}
              onChange={(event) => setFloorsInput(event.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Observações" htmlFor="built-area-notes">
            <textarea
              id="built-area-notes"
              className="flex min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Como o valor foi obtido (opcional)"
              value={notesInput}
              onChange={(event) => setNotesInput(event.target.value)}
              disabled={isSubmitting}
            />
          </FormField>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter className="px-0 pb-0">
            <Button type="submit" disabled={isSubmitting || flights.length === 0}>
              {isSubmitting ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
