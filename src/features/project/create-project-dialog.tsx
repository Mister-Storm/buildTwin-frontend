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
import { resolveDefaultCompany } from "@/features/company/resolve-default-company";
import {
  parseOptionalPlannedArea,
  parseOptionalPlannedFloors,
  parseOptionalProjectType,
} from "@/features/project/planning-field-parsers";
import { PROJECT_TYPE_OPTIONS } from "@/features/project/project-type-options";
import {
  createProjectSchema,
  validateStartDateNotTooFarFuture,
  type CreateProjectFormValues,
} from "@/features/project/schemas/create-project.schema";
import { createProject } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";

const defaultValues: CreateProjectFormValues = {
  name: "",
  address: "",
  city: "",
  state: "",
  country: "Brasil",
  latitude: 0,
  longitude: 0,
  startDate: new Date().toISOString().slice(0, 10),
  plannedAreaSquareMeters: "",
  plannedFloors: "",
  projectType: "",
};

type CreateProjectDialogProps = {
  triggerLabel?: string;
};

export function CreateProjectDialog({
  triggerLabel = "Nova Obra",
}: CreateProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CreateProjectFormValues>(defaultValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CreateProjectFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetForm() {
    setValues(defaultValues);
    setFieldErrors({});
    setSubmitError(null);
  }

  function updateField<K extends keyof CreateProjectFormValues>(
    key: K,
    value: CreateProjectFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const parsed = createProjectSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Partial<Record<keyof CreateProjectFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CreateProjectFormValues;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    const dateError = validateStartDateNotTooFarFuture(parsed.data.startDate);
    if (dateError) {
      setFieldErrors({ startDate: dateError });
      return;
    }

    setIsSubmitting(true);
    try {
      const companyId = await resolveDefaultCompany();
      const plannedAreaSquareMeters = parseOptionalPlannedArea(
        parsed.data.plannedAreaSquareMeters,
      );
      const plannedFloors = parseOptionalPlannedFloors(parsed.data.plannedFloors);
      const projectType = parseOptionalProjectType(parsed.data.projectType);
      const project = await createProject({
        companyId,
        name: parsed.data.name,
        startDate: parsed.data.startDate,
        location: {
          address: parsed.data.address,
          city: parsed.data.city,
          state: parsed.data.state,
          country: parsed.data.country,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
        },
        ...(plannedAreaSquareMeters !== undefined ? { plannedAreaSquareMeters } : {}),
        ...(plannedFloors !== undefined ? { plannedFloors } : {}),
        ...(projectType !== undefined ? { projectType } : {}),
      });
      setOpen(false);
      resetForm();
      router.push(`/projects/${project.id}`);
      router.refresh();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível criar a obra.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger render={<Button className="gap-1.5" />}>
        <Plus className="size-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Obra</DialogTitle>
          <DialogDescription>
            Cadastre uma obra para iniciar o monitoramento com drones.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FormField label="Nome" htmlFor="name" error={fieldErrors.name}>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Ex.: Residencial Horizonte"
            />
          </FormField>
          <FormField label="Endereço" htmlFor="address" error={fieldErrors.address}>
            <Input
              id="address"
              value={values.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Cidade" htmlFor="city" error={fieldErrors.city}>
              <Input
                id="city"
                value={values.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </FormField>
            <FormField label="Estado" htmlFor="state" error={fieldErrors.state}>
              <Input
                id="state"
                value={values.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="País" htmlFor="country" error={fieldErrors.country}>
            <Input
              id="country"
              value={values.country}
              onChange={(e) => updateField("country", e.target.value)}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Latitude"
              htmlFor="latitude"
              error={fieldErrors.latitude}
            >
              <Input
                id="latitude"
                type="number"
                step="any"
                value={values.latitude}
                onChange={(e) =>
                  updateField("latitude", e.target.value as unknown as number)
                }
              />
            </FormField>
            <FormField
              label="Longitude"
              htmlFor="longitude"
              error={fieldErrors.longitude}
            >
              <Input
                id="longitude"
                type="number"
                step="any"
                value={values.longitude}
                onChange={(e) =>
                  updateField("longitude", e.target.value as unknown as number)
                }
              />
            </FormField>
          </div>
          <FormField
            label="Data de início"
            htmlFor="startDate"
            error={fieldErrors.startDate}
          >
            <Input
              id="startDate"
              type="date"
              value={values.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Área planejada (m²)"
              htmlFor="plannedAreaSquareMeters"
              error={fieldErrors.plannedAreaSquareMeters}
            >
              <Input
                id="plannedAreaSquareMeters"
                type="number"
                min="0"
                step="any"
                placeholder="Opcional"
                value={values.plannedAreaSquareMeters ?? ""}
                onChange={(e) =>
                  updateField(
                    "plannedAreaSquareMeters",
                    e.target.value as CreateProjectFormValues["plannedAreaSquareMeters"],
                  )
                }
              />
            </FormField>
            <FormField
              label="Pavimentos previstos"
              htmlFor="plannedFloors"
              error={fieldErrors.plannedFloors}
            >
              <Input
                id="plannedFloors"
                type="number"
                min="1"
                step="1"
                placeholder="Opcional"
                value={values.plannedFloors ?? ""}
                onChange={(e) =>
                  updateField(
                    "plannedFloors",
                    e.target.value as CreateProjectFormValues["plannedFloors"],
                  )
                }
              />
            </FormField>
          </div>
          <FormField
            label="Tipo de obra"
            htmlFor="projectType"
            error={fieldErrors.projectType}
          >
            <select
              id="projectType"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              value={values.projectType ?? ""}
              onChange={(e) =>
                updateField(
                  "projectType",
                  e.target.value as CreateProjectFormValues["projectType"],
                )
              }
            >
              <option value="">Não informado</option>
              {PROJECT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}
          <DialogFooter className="px-0 pb-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar obra"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
