"use client";

import { CreateFlightDialog } from "@/features/flight/create-flight-dialog";
import { EmptyState } from "@/components/shared/States";

type ProjectFlightsEmptyProps = {
  projectId: string;
};

export function ProjectFlightsEmpty({ projectId }: ProjectFlightsEmptyProps) {
  return (
    <div className="space-y-4">
      <EmptyState
        title="Nenhum voo cadastrado"
        message="Crie o primeiro voo para iniciar o monitoramento da obra."
      />
      <div className="flex justify-center">
        <CreateFlightDialog
          projectId={projectId}
          triggerLabel="Criar primeiro voo"
          redirectToFlight
        />
      </div>
    </div>
  );
}
