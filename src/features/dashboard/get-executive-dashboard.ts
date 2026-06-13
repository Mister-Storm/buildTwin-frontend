import type { ExecutiveDashboard } from "@/features/domain/models/dashboard";
import { UNAVAILABLE_EXECUTIVE_DASHBOARD } from "@/features/domain/models/dashboard";
import { formatDate } from "@/lib/formatters";
import { debugLog } from "@/lib/debug";
import { getProjectDashboard } from "@/services/dashboard.service";
import { listFlightsByProject } from "@/services/flights.service";
import { listProjects } from "@/services/projects.service";

type FlightAggregate = {
  date: Date;
  projectName: string;
};

export async function getExecutiveDashboard(): Promise<ExecutiveDashboard> {
  try {
    const projects = await listProjects();
    const activeProjects = projects.filter((p) => p.archivedAt === null);

    const flightAggregates: FlightAggregate[] = [];
    let completedProcessings = 0;
    let processedFlightsTotal = 0;

    await Promise.all(
      activeProjects.map(async (project) => {
        const [flights, dashboard] = await Promise.all([
          listFlightsByProject(project.id),
          getProjectDashboard(project.id),
        ]);

        processedFlightsTotal += dashboard.processedFlights;

        for (const flight of flights) {
          flightAggregates.push({
            date: new Date(flight.flightDate),
            projectName: project.name,
          });
        }

        completedProcessings += dashboard.processedFlights;
      }),
    );

    const lastFlight = flightAggregates.sort(
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
      lastFlight: lastFlight
        ? {
            label: "Último Voo Realizado",
            value: formatDate(lastFlight.date),
            subtitle: lastFlight.projectName,
          }
        : {
            label: "Último Voo Realizado",
            value: "—",
            subtitle: "Nenhum voo registrado",
          },
      processedFlights: {
        label: "Voos Processados",
        value: String(processedFlightsTotal),
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
