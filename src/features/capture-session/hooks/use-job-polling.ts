"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLatestCaptureSessionJob } from "@/services/capture-sessions.service";
import type { LatestCaptureSessionJobResponseDto } from "@/types/api/processing.api";
import { ApiError } from "@/types/api/common.api";

const POLL_INTERVAL_MS = 5000;

type UseJobPollingOptions = {
  enabled?: boolean;
  initialJob?: LatestCaptureSessionJobResponseDto | null;
  onUpdate?: (job: LatestCaptureSessionJobResponseDto) => void;
};

export function useJobPolling(
  captureSessionId: string,
  options: UseJobPollingOptions = {},
) {
  const { enabled = true, initialJob = null, onUpdate } = options;
  const [job, setJob] = useState<LatestCaptureSessionJobResponseDto | null>(initialJob);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const fetchJob = useCallback(async () => {
    try {
      const latest = await getLatestCaptureSessionJob(captureSessionId);
      setJob(latest);
      setError(null);
      onUpdateRef.current?.(latest);
      return latest;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setJob(null);
        return null;
      }
      setError(
        err instanceof ApiError ? err.message : "Erro ao consultar job.",
      );
      return null;
    }
  }, [captureSessionId]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function poll() {
      setIsPolling(true);
      const latest = await fetchJob();
      if (cancelled) return;

      const shouldContinue =
        latest?.status === "PENDING" || latest?.status === "RUNNING";

      if (!shouldContinue) {
        setIsPolling(false);
        if (timer) clearInterval(timer);
      }
    }

    void poll();
    timer = setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      setIsPolling(false);
    };
  }, [enabled, fetchJob, captureSessionId]);

  return {
    job,
    error,
    isPolling,
    refresh: fetchJob,
    setJob,
  };
}
