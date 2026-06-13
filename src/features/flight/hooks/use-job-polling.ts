"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLatestFlightJob } from "@/services/flights.service";
import type { LatestFlightJobResponseDto } from "@/types/api/processing.api";
import { ApiError } from "@/types/api/common.api";

const POLL_INTERVAL_MS = 5000;

type UseJobPollingOptions = {
  enabled?: boolean;
  initialJob?: LatestFlightJobResponseDto | null;
  onUpdate?: (job: LatestFlightJobResponseDto) => void;
};

export function useJobPolling(
  flightId: string,
  options: UseJobPollingOptions = {},
) {
  const { enabled = true, initialJob = null, onUpdate } = options;
  const [job, setJob] = useState<LatestFlightJobResponseDto | null>(initialJob);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const fetchJob = useCallback(async () => {
    try {
      const latest = await getLatestFlightJob(flightId);
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
  }, [flightId]);

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
  }, [enabled, fetchJob, flightId]);

  return {
    job,
    error,
    isPolling,
    refresh: fetchJob,
    setJob,
  };
}
