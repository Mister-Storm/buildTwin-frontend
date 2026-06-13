import { AppShell } from "@/components/layout/AppShell";
import { PageSkeleton } from "@/components/shared/States";

export default function ProjectsLoading() {
  return (
    <AppShell
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Projetos" },
      ]}
    >
      <PageSkeleton />
    </AppShell>
  );
}
