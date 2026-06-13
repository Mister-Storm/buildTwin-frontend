import { getOrthomosaicResolver } from "@/features/domain/resolvers/orthomosaic-resolver";
import { toProjectSummary } from "@/features/domain/mappers/project.mapper";
import { getProjectDashboard } from "@/services/dashboard.service";
import { listFlightsByProject } from "@/services/flights.service";
import { listProjects } from "@/services/projects.service";

export type DemoChecklistItem = {
  id: string;
  label: string;
  completed: boolean;
};

export type DemoPageData = {
  activeProjects: number;
  totalProjects: number;
  totalFlights: number;
  processedJobs: number;
  pendingJobs: number;
  checklist: DemoChecklistItem[];
  recentProjects: ReturnType<typeof toProjectSummary>[];
  isUnavailable: boolean;
};

export async function getDemoPageData(): Promise<DemoPageData> {
  try {
    const projects = await listProjects();
    const active = projects.filter((p) => p.archivedAt === null);
    const recentProjects = active.slice(0, 6).map(toProjectSummary);

    let totalFlights = 0;
    let processedJobs = 0;
    let pendingJobs = 0;

    let checklist: DemoChecklistItem[] = [
      { id: "project", label: "Projeto criado", completed: projects.length > 0 },
      { id: "flight", label: "Voo cadastrado", completed: false },
      { id: "images", label: "Imagens carregadas", completed: false },
      { id: "processing", label: "Processamento concluído", completed: false },
      { id: "ortho", label: "Ortomosaico disponível", completed: false },
    ];

    if (active.length > 0) {
      const focusProject = active[0]!;
      const [flights, dashboard] = await Promise.all([
        listFlightsByProject(focusProject.id),
        getProjectDashboard(focusProject.id),
      ]);

      totalFlights = dashboard.totalFlights;
      processedJobs = dashboard.processedFlights;
      pendingJobs = dashboard.pendingFlights;

      const latestFlight = [...flights].sort(
        (a, b) =>
          new Date(b.flightDate).getTime() - new Date(a.flightDate).getTime(),
      )[0];

      const hasFlight = flights.length > 0;
      const hasImages = (latestFlight?.imageCount ?? 0) > 0;
      const processingDone =
        latestFlight?.latestProcessingStatus === "COMPLETED";

      let orthoAvailable = false;
      if (latestFlight && processingDone) {
        const resolver = getOrthomosaicResolver();
        const resolution = await resolver.resolve(
          latestFlight.flightId,
          focusProject.id,
        );
        orthoAvailable = resolution !== null;
      }

      checklist = [
        { id: "project", label: "Projeto criado", completed: true },
        { id: "flight", label: "Voo cadastrado", completed: hasFlight },
        { id: "images", label: "Imagens carregadas", completed: hasImages },
        {
          id: "processing",
          label: "Processamento concluído",
          completed: processingDone,
        },
        {
          id: "ortho",
          label: "Ortomosaico disponível",
          completed: orthoAvailable,
        },
      ];

      for (const project of active.slice(1)) {
        const dash = await getProjectDashboard(project.id);
        totalFlights += dash.totalFlights;
        processedJobs += dash.processedFlights;
        pendingJobs += dash.pendingFlights;
      }
    }

    return {
      activeProjects: active.length,
      totalProjects: projects.length,
      totalFlights,
      processedJobs,
      pendingJobs,
      checklist,
      recentProjects,
      isUnavailable: false,
    };
  } catch {
    return {
      activeProjects: 0,
      totalProjects: 0,
      totalFlights: 0,
      processedJobs: 0,
      pendingJobs: 0,
      checklist: [
        { id: "project", label: "Projeto criado", completed: false },
        { id: "flight", label: "Voo cadastrado", completed: false },
        { id: "images", label: "Imagens carregadas", completed: false },
        { id: "processing", label: "Processamento concluído", completed: false },
        { id: "ortho", label: "Ortomosaico disponível", completed: false },
      ],
      recentProjects: [],
      isUnavailable: true,
    };
  }
}
