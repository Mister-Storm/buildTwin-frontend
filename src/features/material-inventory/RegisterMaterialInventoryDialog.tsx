"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { registerMaterialInventory } from "@/services/material-inventory.service";
import { ApiError } from "@/types/api/common.api";
import type { ProjectCaptureSessionListItemDto } from "@/types/api/capture-session.api";
import type { InventoryUnit, MaterialType } from "@/types/api/material-inventory.api";
import { MATERIAL_TYPE_LABELS } from "@/features/material-inventory/material-inventory.mapper";
import { formatDate, parseDateOnly } from "@/lib/formatters";

type InventoryRow = {
  id: string;
  materialType: MaterialType;
  quantityInput: string;
  unit: InventoryUnit;
  storageZoneInput: string;
};

const MATERIAL_TYPES = Object.keys(MATERIAL_TYPE_LABELS) as MaterialType[];

type RegisterMaterialInventoryDialogProps = {
  captureSessions: ProjectCaptureSessionListItemDto[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function createEmptyRow(): InventoryRow {
  return {
    id: crypto.randomUUID(),
    materialType: "BRICK",
    quantityInput: "",
    unit: "UNIT",
    storageZoneInput: "",
  };
}

export function RegisterMaterialInventoryDialog({
  captureSessions,
  open: controlledOpen,
  onOpenChange,
}: RegisterMaterialInventoryDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [captureSessionId, setCaptureSessionId] = useState(captureSessions[0]?.captureSessionId ?? "");
  const [rows, setRows] = useState<InventoryRow[]>([createEmptyRow()]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateRow(id: string, patch: Partial<InventoryRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((current) => [...current, createEmptyRow()]);
  }

  function removeRow(id: string) {
    setRows((current) => (current.length === 1 ? current : current.filter((row) => row.id !== id)));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!captureSessionId) {
      errors.captureSessionId = "Selecione um levantamento.";
    }

    const items = rows.map((row) => {
      const parsedQuantity = Number(row.quantityInput.replace(",", "."));
      if (!row.quantityInput.trim() || Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
        errors[`quantity-${row.id}`] = "Informe uma quantidade maior que zero.";
      }
      return {
        materialType: row.materialType,
        quantity: parsedQuantity,
        unit: row.unit,
        storageZone: row.storageZoneInput.trim() ? row.storageZoneInput.trim() : null,
      };
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerMaterialInventory(captureSessionId, { items });
      setOpen(false);
      setRows([createEmptyRow()]);
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível registrar o inventário de materiais.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-1.5 shrink-0" />}>
        <Plus className="size-4" />
        Registrar Inventário
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Inventário de Materiais</DialogTitle>
          <DialogDescription>
            Informe os materiais observados no levantamento. Cada tipo de material é registrado
            como estoque no local indicado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Levantamento" htmlFor="inventory-flight" error={fieldErrors.captureSessionId}>
            <NativeSelect
              id="inventory-flight"
              value={captureSessionId}
              onChange={(event) => setCaptureSessionId(event.target.value)}
              disabled={captureSessions.length === 0 || isSubmitting}
            >
              {captureSessions.length === 0 ? (
                <option value="">Nenhum levantamento disponível</option>
              ) : (
                captureSessions.map((captureSession) => (
                  <option key={captureSession.captureSessionId} value={captureSession.captureSessionId}>
                    {formatDate(parseDateOnly(captureSession.captureDate))} — {captureSession.operatorName}
                  </option>
                ))
              )}
            </NativeSelect>
          </FormField>

          <div className="space-y-3">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid gap-3 rounded-lg border border-border/60 p-3 sm:grid-cols-2"
              >
                <FormField label={`Material ${index + 1}`} htmlFor={`material-${row.id}`}>
                  <NativeSelect
                    id={`material-${row.id}`}
                    value={row.materialType}
                    onChange={(event) =>
                      updateRow(row.id, { materialType: event.target.value as MaterialType })
                    }
                    disabled={isSubmitting}
                  >
                    {MATERIAL_TYPES.map((materialType) => (
                      <option key={materialType} value={materialType}>
                        {MATERIAL_TYPE_LABELS[materialType]}
                      </option>
                    ))}
                  </NativeSelect>
                </FormField>

                <FormField
                  label="Quantidade"
                  htmlFor={`quantity-${row.id}`}
                  error={fieldErrors[`quantity-${row.id}`]}
                >
                  <Input
                    id={`quantity-${row.id}`}
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex.: 5000"
                    value={row.quantityInput}
                    onChange={(event) => updateRow(row.id, { quantityInput: event.target.value })}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Unidade" htmlFor={`unit-${row.id}`}>
                  <NativeSelect
                    id={`unit-${row.id}`}
                    value={row.unit}
                    onChange={(event) =>
                      updateRow(row.id, { unit: event.target.value as InventoryUnit })
                    }
                    disabled={isSubmitting}
                  >
                    <option value="UNIT">Unidade</option>
                    <option value="BAG">Saco</option>
                    <option value="CUBIC_METER">Metro cúbico</option>
                    <option value="KILOGRAM">Quilograma</option>
                  </NativeSelect>
                </FormField>

                <FormField label="Zona de armazenamento" htmlFor={`zone-${row.id}`}>
                  <Input
                    id={`zone-${row.id}`}
                    type="text"
                    placeholder="Ex.: North Yard (opcional)"
                    value={row.storageZoneInput}
                    onChange={(event) =>
                      updateRow(row.id, { storageZoneInput: event.target.value })
                    }
                    disabled={isSubmitting}
                  />
                </FormField>

                {rows.length > 1 ? (
                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeRow(row.id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="mr-1 size-4" />
                      Remover material
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={isSubmitting}>
            <Plus className="mr-1 size-4" />
            Adicionar material
          </Button>

          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

          <DialogFooter className="px-0 pb-0">
            <Button type="submit" disabled={isSubmitting || captureSessions.length === 0}>
              {isSubmitting ? "Salvando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
