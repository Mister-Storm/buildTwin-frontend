"use client";

import { CopilotChatPanel } from "@/features/copilot-chat/CopilotChatPanel";
import { askProjectCopilot } from "@/features/copilot-chat/copilot-chat.service";

type ProjectCopilotSectionProps = {
  projectId: string;
};

const PROJECT_PROMPTS = [
  "Por que a saúde da obra está neste patamar?",
  "Explique o risco de cronograma previsto.",
  "Qual a tendência de desperdício de materiais?",
];

export function ProjectCopilotSection({ projectId }: ProjectCopilotSectionProps) {
  return (
    <CopilotChatPanel
      scope="project"
      projectId={projectId}
      suggestedPrompts={PROJECT_PROMPTS}
      onAsk={(message, history) => askProjectCopilot(projectId, { message, conversationHistory: history })}
    />
  );
}
