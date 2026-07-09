/**
 * Demo seed data for investor demo when backend is offline or empty.
 * IDs are stable so ORTHOMOSAIC_MAPPINGS and navigation stay consistent.
 */
export const DEMO_PROJECT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export const DEMO_FLIGHT_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
export const DEMO_FLIGHT_ID_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc";
export const DEMO_JOB_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
export const DEMO_PREVIEW_ARTIFACT_ID =
  "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

export const DEMO_ORTHOMOSAIC_PREVIEW_URL = "/demo/orthomosaic-preview.jpg";

export const DEMO_ENABLED =
  process.env.BUILDTWIN_DEMO_MODE === "true";

export function isDemoProject(projectId: string): boolean {
  return projectId === DEMO_PROJECT_ID;
}

export function isDemoFlight(captureSessionId: string): boolean {
  return captureSessionId === DEMO_FLIGHT_ID || captureSessionId === DEMO_FLIGHT_ID_B;
}
