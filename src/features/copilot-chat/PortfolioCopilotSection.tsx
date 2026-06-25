"use client";

import { CopilotChatPanel } from "@/features/copilot-chat/CopilotChatPanel";
import { askPortfolioCopilot } from "@/features/copilot-chat/copilot-chat.service";

const PORTFOLIO_PROMPTS = [
  "Quais obras requerem atenção executiva?",
  "Resuma o risco de atraso no portfólio.",
  "Como está a saúde média das obras ativas?",
];

export function PortfolioCopilotSection() {
  return (
    <CopilotChatPanel
      scope="portfolio"
      suggestedPrompts={PORTFOLIO_PROMPTS}
      onAsk={(message, history) => askPortfolioCopilot({ message, conversationHistory: history })}
    />
  );
}
