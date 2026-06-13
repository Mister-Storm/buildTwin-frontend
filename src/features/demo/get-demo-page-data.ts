import { getSystemOverview } from "@/services/system.service";
import type { ComponentHealthStatus } from "@/types/api/system.api";

export type DemoChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type DemoPageData = {
  overallStatus: ComponentHealthStatus;
  timestamp: string;
  components: Awaited<ReturnType<typeof getSystemOverview>>["components"];
  operations: Awaited<ReturnType<typeof getSystemOverview>>["operations"];
  isUnavailable: boolean;
};

export async function getDemoPageData(): Promise<DemoPageData> {
  try {
    const overview = await getSystemOverview();
    return {
      overallStatus: overview.overallStatus,
      timestamp: overview.timestamp,
      components: overview.components,
      operations: overview.operations,
      isUnavailable: false,
    };
  } catch {
    return {
      overallStatus: "DOWN",
      timestamp: new Date().toISOString(),
      components: {},
      operations: {
        projects: 0,
        flights: 0,
        jobs: 0,
        processedJobs: 0,
        pendingJobs: 0,
        failedJobs: 0,
        recentJobs: [],
      },
      isUnavailable: true,
    };
  }
}
