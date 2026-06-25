"use client";

import { CreateCaptureSessionDialog } from "@/features/capture-session/create-capture-session-dialog";
import { EmptyState } from "@/components/shared/States";

type ProjectCaptureSessionsEmptyProps = {
  projectId: string;
};

export function ProjectCaptureSessionsEmpty({ projectId }: ProjectCaptureSessionsEmptyProps) {
  return (
    <div className="space-y-4">
      <EmptyState
        title="Nenhuma captura cadastrado"
        message="Crie o primeiro voo para iniciar o monitoramento da obra."
      />
      <div className="flex justify-center">
        <CreateCaptureSessionDialog
          projectId={projectId}
          triggerLabel="Criar primeira captura"
          redirectToCaptureSession
        />
      </div>
    </div>
  );
}
