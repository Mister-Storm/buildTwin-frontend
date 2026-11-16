import { ApiError } from "@/types/api/common.api";

export function formatCaptureUploadError(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Falha no upload.";
  }

  const support =
    error.traceId && error.traceId.trim().length > 0
      ? ` Referência de suporte: ${error.traceId}.`
      : "";

  switch (error.code) {
    case "VALIDATION_ERROR":
      return `${error.message || "Arquivo inválido para upload."}${support}`;
    case "CONFLICT":
      return `Imagem duplicada nesta sessão.${support}`;
    case "FORBIDDEN":
      return `Sem permissão para enviar imagens neste projeto.${support}`;
    case "UNAUTHORIZED":
      return `Sessão inválida ou expirada. Entre novamente.${support}`;
    case "NOT_FOUND":
      return `Sessão de captura não encontrada.${support}`;
    case "UNSUPPORTED_MEDIA_TYPE":
      return `Tipo de conteúdo não suportado para upload.${support}`;
    case "METHOD_NOT_ALLOWED":
      return `Operação de upload não permitida neste caminho.${support}`;
    case "INTERNAL_ERROR":
      return `Falha inesperada no upload.${support}`;
    case "NETWORK_ERROR":
      return "Falha de rede no upload. Verifique a conexão e tente novamente.";
    default:
      return `${error.message || "Falha no upload."}${support}`;
  }
}

export function shouldPreserveUploadSession(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403 && error.code === "FORBIDDEN";
}
