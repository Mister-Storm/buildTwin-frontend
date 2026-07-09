"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CaptureSessionImageList } from "@/features/capture-session/components/capture-session-image-list";
import { CaptureSessionImageUpload } from "@/features/capture-session/components/capture-session-image-upload";
import { CaptureSessionProcessPanel } from "@/features/capture-session/components/capture-session-process-panel";
import { CaptureSessionResultsPanel } from "@/features/capture-session/components/capture-session-results-panel";
import { JobStatusPanel } from "@/features/capture-session/components/job-status-panel";
import { useJobPolling } from "@/features/capture-session/hooks/use-job-polling";
import { getJob } from "@/services/jobs.service";
import type {
  CaptureSessionDetailsResponseDto,
  CaptureImageResponseDto,
} from "@/types/api/capture-session.api";
import type {
  LatestCaptureSessionJobResponseDto,
  ProcessingJobDetailResponseDto,
} from "@/types/api/processing.api";
import type { ProgressReportResponseDto } from "@/types/api/report.api";

type CaptureSessionDetailWorkspaceProps = {
  projectId: string;
  captureSession: CaptureSessionDetailsResponseDto;
  initialImages: CaptureImageResponseDto[];
  initialJob: LatestCaptureSessionJobResponseDto | null;
  initialJobDetail: ProcessingJobDetailResponseDto | null;
  initialReport: ProgressReportResponseDto | null;
};

export function CaptureSessionDetailWorkspace({
  projectId,
  captureSession,
  initialImages,
  initialJob,
  initialJobDetail,
  initialReport,
}: CaptureSessionDetailWorkspaceProps) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [jobDetail, setJobDetail] = useState(initialJobDetail);
  const [report] = useState(initialReport);
  const [localJob, setLocalJob] = useState<LatestCaptureSessionJobResponseDto | null>(
    initialJob,
  );

  const activeJob = localJob;
  const shouldPoll =
    activeJob?.status === "PENDING" || activeJob?.status === "RUNNING";

  const { job: polledJob, error, isPolling, setJob, refresh } = useJobPolling(
    captureSession.captureSessionId,
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
  const imageCount = images.length || captureSession.imageCount;

  async function handleUploaded() {
    router.refresh();
    const { listCaptureSessionImages } = await import("@/services/capture-sessions.service");
    const updated = await listCaptureSessionImages(captureSession.captureSessionId);
    setImages(updated);
  }

  function handleProcessStarted(jobId: string) {
    const pendingJob: LatestCaptureSessionJobResponseDto = {
      jobId,
      captureSessionId: captureSession.captureSessionId,
      jobType: "ORTHOMOSAIC_PROCESSING",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      failureReason: null,
    };
    setLocalJob(pendingJob);
    setJobDetail(null);
    setJob(pendingJob);
    void refresh();
  }

  const showResults =
    currentJob?.status === "COMPLETED" &&
    jobDetail?.status === "COMPLETED";

  return (
    <div className="space-y-8">
      <CaptureSessionImageUpload captureSessionId={captureSession.captureSessionId} onUploaded={handleUploaded} />
      <CaptureSessionImageList
        images={images}
        captureSessionId={captureSession.captureSessionId}
        onDeleted={handleUploaded}
      />
      <CaptureSessionProcessPanel
        captureSessionId={captureSession.captureSessionId}
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
        <CaptureSessionResultsPanel
          projectId={projectId}
          captureSessionId={captureSession.captureSessionId}
          job={jobDetail}
          report={report}
        />
      ) : null}
    </div>
  );
}
