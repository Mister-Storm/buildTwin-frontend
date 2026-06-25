"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopilotSuggestedPrompts } from "@/features/copilot-chat/CopilotSuggestedPrompts";
import {
  mapCopilotErrorLabel,
  mapCopilotResponseToAssistantMessage,
  type CopilotChatMessage,
} from "@/features/copilot-chat/copilot-chat.mapper";
import type { CopilotMessageDto } from "@/features/copilot-chat/copilot-chat.api";
import { MessageSquare } from "lucide-react";

type CopilotChatPanelProps = {
  scope: "project" | "portfolio";
  projectId?: string;
  onAsk: (
    message: string,
    history: CopilotMessageDto[],
  ) => Promise<import("@/features/copilot-chat/copilot-chat.api").CopilotAskResponseDto>;
  suggestedPrompts: string[];
};

export function CopilotChatPanel({
  scope,
  projectId,
  onAsk,
  suggestedPrompts,
}: CopilotChatPanelProps) {
  const [messages, setMessages] = useState<CopilotChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage: CopilotChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    const history: CopilotMessageDto[] = messages.map((message) => ({
      role: message.role === "user" ? ("USER" as const) : ("ASSISTANT" as const),
      content: message.content,
    }));

    try {
      const response = await onAsk(trimmed, history);
      setMessages((prev) => [
        ...prev,
        mapCopilotResponseToAssistantMessage(response, `assistant-${Date.now()}`),
      ]);
    } catch (err) {
      setError(mapCopilotErrorLabel(err));
    } finally {
      setLoading(false);
    }
  }

  const title = scope === "project" ? "Copiloto da Obra" : "Copiloto do Portfólio";
  const description =
    scope === "project"
      ? `Explicações sobre inteligência executiva, previsão e progresso${projectId ? "" : ""}. Somente leitura.`
      : "Explicações sobre o portfólio de obras ativas. Somente leitura.";

  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="size-5 text-brand-accent" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CopilotSuggestedPrompts
          prompts={suggestedPrompts}
          disabled={loading}
          onSelect={(prompt) => sendMessage(prompt)}
        />

        <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-border/60 p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Faça uma pergunta sobre os indicadores da plataforma.
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-8 rounded-lg bg-muted p-3 text-sm"
                    : "mr-8 rounded-lg border border-border/60 p-3 text-sm"
                }
              >
                <p>{message.content}</p>
                {message.disclaimer ? (
                  <p className="mt-2 text-xs text-muted-foreground">{message.disclaimer}</p>
                ) : null}
              </div>
            ))
          )}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <textarea
            className="min-h-[44px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Pergunte sobre saúde, cronograma, portfólio..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            rows={2}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? "..." : "Enviar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
