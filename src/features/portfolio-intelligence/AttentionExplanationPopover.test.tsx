import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AttentionExplanationPopover } from "@/features/portfolio-intelligence/AttentionExplanationPopover";
import { mapMetricExplanation } from "@/features/explainability/explainability.mapper";
import { sampleMetricExplanationDto } from "@/features/explainability/explainability.test-fixtures";

describe("AttentionExplanationPopover", () => {
  it("shows principal fator inside popover content", async () => {
    const user = userEvent.setup();
    const explanation = mapMetricExplanation(sampleMetricExplanationDto);

    render(<AttentionExplanationPopover explanation={explanation} />);

    await user.click(
      screen.getByRole("button", { name: "Ver explicação da atenção executiva" }),
    );

    expect(screen.getByText("Principal fator")).toBeInTheDocument();
    expect(screen.getAllByText(explanation.mainDriver!.label).length).toBeGreaterThan(0);
  });
});
