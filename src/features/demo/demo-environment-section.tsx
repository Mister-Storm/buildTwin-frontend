import { SystemHealthCard } from "@/components/shared/SystemHealthCard";
import type { SystemOverviewResponseDto } from "@/types/api/system.api";
import {
  Cpu,
  Database,
  HardDrive,
  Server,
  Workflow,
} from "lucide-react";

const COMPONENT_META: Record<
  string,
  { label: string; icon: typeof Server }
> = {
  backend: { label: "Backend", icon: Server },
  postgres: { label: "PostgreSQL", icon: Database },
  minio: { label: "MinIO", icon: HardDrive },
  worker: { label: "Worker", icon: Workflow },
  processor: { label: "Processor", icon: Cpu },
};

type DemoEnvironmentSectionProps = {
  overview: SystemOverviewResponseDto;
};

export function DemoEnvironmentSection({
  overview,
}: DemoEnvironmentSectionProps) {
  const entries = Object.entries(overview.components).filter(
    ([key]) => key in COMPONENT_META,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map(([key, component]) => {
        const meta = COMPONENT_META[key]!;
        return (
          <SystemHealthCard
            key={key}
            name={meta.label}
            status={component.status}
            icon={meta.icon}
            version={component.version}
            lastCheck={component.lastSeenAt ?? overview.timestamp}
            details={component.details}
          />
        );
      })}
    </div>
  );
}

export function buildInfraChecklist(overview: SystemOverviewResponseDto) {
  const components = overview.components;
  const hasCompletedJob = overview.operations.recentJobs.some(
    (job) => job.status === "COMPLETED",
  );

  return [
    {
      id: "backend",
      label: "Backend",
      completed: components.backend?.status === "UP",
    },
    {
      id: "worker",
      label: "Worker",
      completed:
        components.worker?.status === "UP" ||
        components.worker?.status === "DEGRADED",
    },
    {
      id: "processor",
      label: "Processor",
      completed:
        components.processor?.status === "UP" ||
        components.processor?.status === "DEGRADED",
    },
    {
      id: "minio",
      label: "MinIO",
      completed: components.minio?.status === "UP",
    },
    {
      id: "postgres",
      label: "PostgreSQL",
      completed: components.postgres?.status === "UP",
    },
    {
      id: "artifacts",
      label: "Artefatos",
      completed: hasCompletedJob,
    },
  ];
}
