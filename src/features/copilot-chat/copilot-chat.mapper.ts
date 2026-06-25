import type { CopilotAskResponseDto } from "@/features/copilot-chat/copilot-chat.api";

export type CopilotChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  disclaimer?: string;
};

export function mapCopilotResponseToAssistantMessage(
  response: CopilotAskResponseDto,
  id: string,
): CopilotChatMessage {
  return {
    id,
    role: "assistant",
    content: response.answer,
    disclaimer: response.disclaimer,
  };
}

export function mapCopilotErrorLabel(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("429") || error.message.toLowerCase().includes("rate limit")) {
      return "Limite de requisições atingido. Aguarde um momento.";
    }
  }
  return "Não foi possível obter resposta do copiloto.";
}
