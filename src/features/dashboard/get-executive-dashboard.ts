import type { ExecutiveDashboard } from "@/features/domain/models/dashboard";
import { UNAVAILABLE_EXECUTIVE_DASHBOARD } from "@/features/domain/models/dashboard";
import { formatDate } from "@/lib/formatters";
import { debugLog } from "@/lib/debug";
import { getProjectDashboard } from "@/services/dashboard.service";
import { listCaptureSessionsByProject } from "@/services/capture-sessions.service";
import { listProjects } from "@/services/projects.service";

type CaptureSessionAggregate = {
  date: Date;
  projectName: string;
};

export async function getExecutiveDashboard(): Promise<ExecutiveDashboard> {
  try {
    const projects = await listProjects();
    const activeProjects = projects.filter((p) => p.archivedAt === null);

    const captureSessionAggregates: CaptureSessionAggregate[] = [];
    let completedProcessings = 0;
    let processedCaptureSessionsTotal = 0;

    await Promise.all(
      activeProjects.map(async (project) => {
        const [captureSessions, dashboard] = await Promise.all([
          listCaptureSessionsByProject(project.id),
          getProjectDashboard(project.id),
        ]);

        processedCaptureSessionsTotal += dashboard.processedCaptureSessions;

        for (const captureSession of captureSessions) {
          captureSessionAggregates.push({
            date: new Date(captureSession.captureDate),
            projectName: project.name,
          });
        }

        completedProcessings += dashboard.processedCaptureSessions;
      }),
    );

    const lastCaptureSession = captureSessionAggregates.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    )[0];

    debugLog("getExecutiveDashboard", {
      activeProjects: activeProjects.length,
      completedProcessings,
    });

    return {
      activeProjects: {
        label: "Obras Ativas",
        value: String(activeProjects.length),
        subtitle: `${projects.length} obras no total`,
      },
      lastCaptureSession: lastCaptureSession
        ? {
            label: "Última Captura Realizado",
            value: formatDate(lastCaptureSession.date),
            subtitle: lastCaptureSession.projectName,
          }
        : {
            label: "Última Captura Realizado",
            value: "—",
            subtitle: "Nenhuma captura registrado",
          },
      processedCaptureSessions: {
        label: "Capturas Processadas",
        value: String(processedCaptureSessionsTotal),
        subtitle: "Com ortomosaico concluído",
      },
      completedProcessings: {
        label: "Processamentos Concluídos",
        value: String(completedProcessings),
        subtitle: "Jobs finalizados com sucesso",
      },
      isUnavailable: false,
    };
  } catch (error) {
    debugLog("getExecutiveDashboard: unavailable", {
      error: error instanceof Error ? error.message : String(error),
    });
    return UNAVAILABLE_EXECUTIVE_DASHBOARD;
  }
}
