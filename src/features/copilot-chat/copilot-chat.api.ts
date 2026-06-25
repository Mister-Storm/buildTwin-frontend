export type CopilotMessageDto = {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
};

export type CopilotAskRequestDto = {
  message: string;
  conversationHistory?: CopilotMessageDto[];
};

export type CopilotAskResponseDto = {
  answer: string;
  disclaimer: string;
  contextGeneratedAt: string;
  providerId: string;
  model: string;
  usage: {
    promptTokens: number | null;
    completionTokens: number | null;
  } | null;
  latencyMs: number;
};
