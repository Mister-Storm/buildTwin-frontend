import DroneMissionPage from "@/features/drone-mission/DroneMissionPage";

type PageProps = {
  params: Promise<{ projectId: string }>;
};

export default function Page({ params }: PageProps) {
  return <DroneMissionPage params={params} />;
}
