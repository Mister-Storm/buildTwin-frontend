import { AppShell } from "@/components/layout/AppShell";
import { ProjectDetailSkeleton } from "@/components/shared/States";

export default function FlightDetailLoading() {
  return (
    <AppShell
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos", href: "/projects" },
        { label: "…" },
      ]}
    >
      <ProjectDetailSkeleton />
    </AppShell>
  );
}
