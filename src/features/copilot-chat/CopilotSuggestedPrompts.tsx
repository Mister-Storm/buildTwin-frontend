"use client";

import { Button } from "@/components/ui/button";

type CopilotSuggestedPromptsProps = {
  prompts: string[];
  disabled?: boolean;
  onSelect: (prompt: string) => void;
};

export function CopilotSuggestedPrompts({
  prompts,
  disabled,
  onSelect,
}: CopilotSuggestedPromptsProps) {
  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="text-xs"
          onClick={() => onSelect(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
}
