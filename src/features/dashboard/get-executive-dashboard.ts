import type { ExecutiveDashboard } from "@/features/domain/models/dashboard";
import { MOCK_EXECUTIVE_DASHBOARD } from "@/features/domain/models/dashboard";
import { formatDate } from "@/lib/formatters";
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

    await Promise.all(
      activeProjects.map(async (project) => {
        const [flights, dashboard] = await Promise.all([
          listFlightsByProject(project.id),
          getProjectDashboard(project.id),
        ]);

        for (const flight of flights) {
          flightAggregates.push({
            date: new Date(flight.flightDate),
            projectName: project.name,
          });
        }

        for (const recent of dashboard.recentFlights) {
          if (recent.latestJobStatus === "COMPLETED") {
            completedProcessings += 1;
          }
        }
      }),
    );

    const lastFlight = flightAggregates.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    )[0];

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
      monitoredArea: {
        label: "Área Monitorada",
        value: "12.4 ha",
        subtitle: "Estimativa consolidada (mock)",
      },
      completedProcessings: {
        label: "Processamentos Concluídos",
        value: String(completedProcessings),
        subtitle: "Ortomosaicos prontos",
      },
      isMockFallback: false,
    };
  } catch {
    return MOCK_EXECUTIVE_DASHBOARD;
  }
}
