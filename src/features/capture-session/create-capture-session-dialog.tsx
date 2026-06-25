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
import {
  createCaptureSessionSchema,
  type CreateCaptureSessionFormValues,
} from "@/features/project/schemas/create-project.schema";
import { createCaptureSession } from "@/services/capture-sessions.service";
import { ApiError } from "@/types/api/common.api";

type CreateCaptureSessionDialogProps = {
  projectId: string;
  triggerLabel?: string;
  redirectToCaptureSession?: boolean;
};

export function CreateCaptureSessionDialog({
  projectId,
  triggerLabel = "Nova Captura",
  redirectToCaptureSession = true,
}: CreateCaptureSessionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CreateCaptureSessionFormValues>({
    captureDate: new Date().toISOString().slice(0, 10),
    operatorName: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CreateCaptureSessionFormValues, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const parsed = createCaptureSessionSchema.safeParse(values);
    if (!parsed.success) {
      const errors: Partial<Record<keyof CreateCaptureSessionFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CreateCaptureSessionFormValues;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const captureSession = await createCaptureSession(projectId, parsed.data);
      setOpen(false);
      setValues({
        captureDate: new Date().toISOString().slice(0, 10),
        operatorName: "",
      });
      setFieldErrors({});
      if (redirectToCaptureSession) {
        router.push(`/projects/${projectId}/capture-sessions/${captureSession.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível criar a captura.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-1.5" />}>
        <Plus className="size-4" />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Captura</DialogTitle>
          <DialogDescription>
            Registre um voo de drone para esta obra.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <FormField
            label="Data da captura"
            htmlFor="captureDate"
            error={fieldErrors.captureDate}
          >
            <Input
              id="captureDate"
              type="date"
              value={values.captureDate}
              onChange={(e) =>
                setValues((v) => ({ ...v, captureDate: e.target.value }))
              }
            />
          </FormField>
          <FormField
            label="Operador"
            htmlFor="operatorName"
            error={fieldErrors.operatorName}
          >
            <Input
              id="operatorName"
              value={values.operatorName}
              onChange={(e) =>
                setValues((v) => ({ ...v, operatorName: e.target.value }))
              }
              placeholder="Nome do operador"
            />
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
              {isSubmitting ? "Criando..." : "Criar captura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
