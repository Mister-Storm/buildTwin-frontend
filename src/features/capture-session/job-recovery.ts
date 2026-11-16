import type {
  JobStatusDto,
  ProcessingJobRecoveryFieldsDto,
  RecoveryCauseDto,
  StageStatusDto,
} from "@/types/api/processing.api";

type RecoverableJob = { status: JobStatusDto } & ProcessingJobRecoveryFieldsDto;

export type JobRecoveryView = {
  canRecover: boolean;
  causeLabel: string | null;
  causeDescription: string | null;
};

export type JobStageItem = {
  key: string;
  label: string;
  status: StageStatusDto;
  statusLabel: string;
  required: boolean;
  profileLabel: string | null;
  imageCountsLabel: string | null;
  failureCode: string | null;
};

export type JobStagesView = {
  recorded: boolean;
  items: JobStageItem[];
  notice: string | null;
};

const CAUSES: Record<RecoveryCauseDto, { label: string; description: string }> = {
  PROGRESS_UNVERIFIED: {
    label: "Progresso não verificado",
    description:
      "Não foi possível confirmar o progresso da execução remota; isso não comprova falha do processamento.",
  },
  CONTACT_LOST: {
    label: "Contato perdido com o processador",
    description:
      "O processador deixou de responder durante a execução; o processamento pode ser retomado.",
  },
  SUPERVISION_EXPIRED: {
    label: "Supervisão expirada",
    description:
      "O executor deixou de renovar a supervisão do processamento antes da conclusão.",
  },
  EXECUTION_DEADLINE_EXCEEDED: {
    label: "Prazo de execução excedido",
    description:
      "A execução ultrapassou o prazo máximo permitido sem concluir.",
  },
};

const GENERIC_CAUSE = {
  label: "Falha recuperável",
  description: "Esta falha pode ser recuperada no mesmo processamento.",
};

const STAGE_LABELS: Record<string, string> = {
  ENGINE: "Reconstrução fotogramétrica",
  PREVIEW: "Pré-visualização",
  THUMBNAIL: "Miniatura",
  SESSION_REPORT: "Relatório da sessão",
  FINALIZATION: "Finalização",
};

const ANALYTICAL_PREFIX = "ANALYTICAL_";

const STAGE_STATUS_LABELS: Record<StageStatusDto, string> = {
  PENDING: "Pendente",
  RUNNING: "Em execução",
  COMPLETED: "Concluída",
  FAILED: "Falhou",
  SKIPPED: "Ignorada",
  UNKNOWN: "Desconhecida",
};

export const UNRECORDED_STAGES_NOTICE =
  "As etapas deste processamento não foram registradas; não é possível confirmar quais etapas foram concluídas.";

export function describeJobRecovery(job: RecoverableJob): JobRecoveryView {
  const canRecover = job.status === "FAILED" && job.recoverable === true;
  if (!canRecover) {
    return { canRecover, causeLabel: null, causeDescription: null };
  }
  const cause = job.recoveryCause ? CAUSES[job.recoveryCause] : GENERIC_CAUSE;
  return {
    canRecover,
    causeLabel: cause.label,
    causeDescription: cause.description,
  };
}

function stageLabel(stage: string): string {
  if (stage.startsWith(ANALYTICAL_PREFIX)) {
    return `Análise: ${stage.slice(ANALYTICAL_PREFIX.length)}`;
  }
  return STAGE_LABELS[stage] ?? stage;
}

function imageCountsLabel(
  source: number | null,
  reconstructed: number | null,
): string | null {
  if (source === null || reconstructed === null) {
    return null;
  }
  return `${reconstructed} de ${source} imagens reconstruídas`;
}

export function describeJobStages(job: ProcessingJobRecoveryFieldsDto): JobStagesView {
  const stages = job.stages ?? [];
  if (stages.length === 0) {
    return { recorded: false, items: [], notice: UNRECORDED_STAGES_NOTICE };
  }
  return {
    recorded: true,
    notice: null,
    items: stages.map((stage) => ({
      key: `${stage.stage}:${stage.outputPurpose}`,
      label: stageLabel(stage.stage),
      status: stage.status,
      statusLabel: STAGE_STATUS_LABELS[stage.status] ?? stage.status,
      required: stage.required,
      profileLabel: stage.processingProfile,
      imageCountsLabel: imageCountsLabel(
        stage.sourceImageCount,
        stage.reconstructedImageCount,
      ),
      failureCode: stage.failureCode,
    })),
  };
}
