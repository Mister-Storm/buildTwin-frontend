const PROCESSOR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /NODEODM_UNAVAILABLE|NodeODM unavailable|degraded/i,
    message: "NodeODM indisponível",
  },
  {
    pattern: /Processor HTTP error|Processor call failed|Processor unreachable/i,
    message: "Falha ao conectar ao Processor",
  },
  {
    pattern: /MinIO|storage|S3|bucket/i,
    message: "Falha ao acessar MinIO",
  },
  {
    pattern: /artifact|ARTIFACT/i,
    message: "Artefato não encontrado",
  },
  {
    pattern: /timeout|504|timed out/i,
    message: "Timeout de processamento",
  },
  {
    pattern: /Cannot process dataset/i,
    message:
      "O conjunto de imagens não pôde ser reconstruído em modo completo; o sistema tenta perfil degradado e, se necessário, ortomosaico simplificado.",
  },
  {
    pattern: /ODM_EXECUTION_FAILED/i,
    message: "Falha na execução do NodeODM",
  },
  {
    pattern: /WORKSPACE_VALIDATION_FAILED/i,
    message: "Falha na validação do workspace de processamento",
  },
];

export function mapFailureReasonToFriendlyMessage(
  failureReason: string | null | undefined,
): string {
  if (!failureReason?.trim()) {
    return "Falha no processamento";
  }

  for (const { pattern, message } of PROCESSOR_PATTERNS) {
    if (pattern.test(failureReason)) {
      return message;
    }
  }

  return "Falha no processamento";
}
