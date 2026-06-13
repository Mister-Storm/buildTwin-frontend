import { describe, expect, it } from "vitest";
import {
  buildDemoOrthomosaicViewModel,
  canUseDemoOrthomosaic,
} from "@/features/demo/demo-orthomosaic";
import {
  DEMO_FLIGHT_ID,
  DEMO_ORTHOMOSAIC_PREVIEW_URL,
  DEMO_PROJECT_ID,
} from "@/features/demo/demo-seed";

describe("buildDemoOrthomosaicViewModel", () => {
  it("uses demo preview url", () => {
    const viewModel = buildDemoOrthomosaicViewModel();

    expect(viewModel.previewUrl).toBe(DEMO_ORTHOMOSAIC_PREVIEW_URL);
    expect(viewModel.previewUrl).toBe("/demo/orthomosaic-preview.jpg");
    expect(viewModel.projectId).toBe(DEMO_PROJECT_ID);
    expect(viewModel.flightId).toBe(DEMO_FLIGHT_ID);
  });
});

describe("canUseDemoOrthomosaic", () => {
  it("returns true for demo project and flight", () => {
    expect(canUseDemoOrthomosaic(DEMO_PROJECT_ID, DEMO_FLIGHT_ID)).toBe(true);
  });

  it("returns true for demo project without flight id", () => {
    expect(canUseDemoOrthomosaic(DEMO_PROJECT_ID)).toBe(true);
  });

  it("returns false for non-demo project", () => {
    expect(canUseDemoOrthomosaic("other-project", DEMO_FLIGHT_ID)).toBe(false);
  });

  it("returns false for demo project with unknown flight", () => {
    expect(canUseDemoOrthomosaic(DEMO_PROJECT_ID, "unknown-flight")).toBe(
      false,
    );
  });
});
