"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { archiveProject } from "@/services/projects.service";
import { ApiError } from "@/types/api/common.api";

type ArchiveProjectDialogProps = {
  projectId: string;
  projectName: string;
};

export function ArchiveProjectDialog({
  projectId,
  projectName,
}: ArchiveProjectDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleArchive() {
    setError(null);
    setIsSubmitting(true);
    try {
      await archiveProject(projectId);
      router.push("/projects");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível arquivar a obra.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive" />
        }
      >
        <Archive className="size-4" />
        Arquivar
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arquivar obra?</AlertDialogTitle>
          <AlertDialogDescription>
            A obra &quot;{projectName}&quot; será arquivada. Esta ação pode ser
            revertida apenas via backend.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleArchive}
          >
            {isSubmitting ? "Arquivando..." : "Confirmar arquivamento"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
