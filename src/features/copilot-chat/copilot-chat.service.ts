import { apiFetch } from "@/services/api-client";
import type {
  CopilotAskRequestDto,
  CopilotAskResponseDto,
} from "@/features/copilot-chat/copilot-chat.api";

export async function askProjectCopilot(
  projectId: string,
  request: CopilotAskRequestDto,
): Promise<CopilotAskResponseDto> {
  return apiFetch<CopilotAskResponseDto>(`/projects/${projectId}/copilot/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}

export async function askPortfolioCopilot(
  request: CopilotAskRequestDto,
): Promise<CopilotAskResponseDto> {
  return apiFetch<CopilotAskResponseDto>("/portfolio/copilot/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
}
