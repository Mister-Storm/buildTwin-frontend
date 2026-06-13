"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FlightImageList } from "@/features/flight/components/flight-image-list";
import { FlightImageUpload } from "@/features/flight/components/flight-image-upload";
import { FlightProcessPanel } from "@/features/flight/components/flight-process-panel";
import { FlightResultsPanel } from "@/features/flight/components/flight-results-panel";
import { JobStatusPanel } from "@/features/flight/components/job-status-panel";
import { useJobPolling } from "@/features/flight/hooks/use-job-polling";
import { getJob } from "@/services/jobs.service";
import type {
  FlightDetailsResponseDto,
  FlightImageResponseDto,
} from "@/types/api/flight.api";
import type {
  LatestFlightJobResponseDto,
  ProcessingJobDetailResponseDto,
} from "@/types/api/processing.api";
import type { ProgressReportResponseDto } from "@/types/api/report.api";

type FlightDetailWorkspaceProps = {
  projectId: string;
  flight: FlightDetailsResponseDto;
  initialImages: FlightImageResponseDto[];
  initialJob: LatestFlightJobResponseDto | null;
  initialJobDetail: ProcessingJobDetailResponseDto | null;
  initialReport: ProgressReportResponseDto | null;
};

export function FlightDetailWorkspace({
  projectId,
  flight,
  initialImages,
  initialJob,
  initialJobDetail,
  initialReport,
}: FlightDetailWorkspaceProps) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [jobDetail, setJobDetail] = useState(initialJobDetail);
  const [report] = useState(initialReport);
  const [localJob, setLocalJob] = useState<LatestFlightJobResponseDto | null>(
    initialJob,
  );

  const activeJob = localJob;
  const shouldPoll =
    activeJob?.status === "PENDING" || activeJob?.status === "RUNNING";

  const { job: polledJob, error, isPolling, setJob, refresh } = useJobPolling(
    flight.flightId,
    {
      enabled: shouldPoll,
      initialJob: activeJob,
      onUpdate: async (latest) => {
        setLocalJob(latest);
        if (latest.status === "COMPLETED" || latest.status === "FAILED") {
          try {
            const detail = await getJob(latest.jobId);
            setJobDetail(detail);
          } catch {
            // ignore
          }
          router.refresh();
        }
      },
    },
  );

  const currentJob = polledJob ?? localJob;
  const imageCount = images.length || flight.imageCount;

  async function handleUploaded() {
    router.refresh();
    const { listFlightImages } = await import("@/services/flights.service");
    const updated = await listFlightImages(flight.flightId);
    setImages(updated);
  }

  function handleProcessStarted(jobId: string) {
    const pendingJob: LatestFlightJobResponseDto = {
      jobId,
      flightId: flight.flightId,
      jobType: "ORTHOMOSAIC_PROCESSING",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      failureReason: null,
    };
    setLocalJob(pendingJob);
    setJob(pendingJob);
    void refresh();
  }

  const showResults =
    currentJob?.status === "COMPLETED" &&
    jobDetail?.status === "COMPLETED";

  return (
    <div className="space-y-8">
      <FlightImageUpload flightId={flight.flightId} onUploaded={handleUploaded} />
      <FlightImageList images={images} />
      <FlightProcessPanel
        flightId={flight.flightId}
        imageCount={imageCount}
        jobStatus={currentJob?.status ?? null}
        onStarted={handleProcessStarted}
      />
      <JobStatusPanel
        imageCount={imageCount}
        job={currentJob}
        isPolling={isPolling}
        error={error}
      />
      {showResults && jobDetail ? (
        <FlightResultsPanel
          projectId={projectId}
          flightId={flight.flightId}
          job={jobDetail}
          report={report}
        />
      ) : null}
    </div>
  );
}
