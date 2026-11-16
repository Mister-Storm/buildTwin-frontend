import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getOrthomosaicQualityInfo,
  shouldShowDegradedQualityBanner,
} from "@/features/capture-session/orthomosaic-quality";
import { jobStatusFriendlyMessage } from "@/features/capture-session/job-status-utils";
import { getJob, recoverJob } from "@/services/jobs.service";
import wire from "@/services/__fixtures__/jobs-wire.json";
import type {
  JobStatusDto,
  ProcessingArtifactResponseDto,
  ProcessingJobDetailResponseDto,
} from "@/types/api/processing.api";

const JOBS_WIRE_SHA256 =
  "b60a8802e7bd226776187cea0d84c662f2412387a54430a80d4c7f0b58ba0f5f";

function orthomosaicOf(body: { artifacts: unknown[] }) {
  return (body.artifacts as ProcessingArtifactResponseDto[]).find(
    (artifact) => artifact.artifactType === "ORTHOMOSAIC",
  );
}

describe("K-C1 serialized backend job delivery contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function serve(body: unknown, status: number) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
  }

  it("should pin the shared job wire when frontend and backend copies are compared", () => {
    const bytes = readFileSync(
      resolve(__dirname, "__fixtures__/jobs-wire.json"),
    );
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      JOBS_WIRE_SHA256,
    );
  });

  it("should preserve every job field when the delivered job wire is consumed", async () => {
    const sut = getJob;
    for (const name of [
      "standardCompleted",
      "legacyProfileOmitted",
      "failedAfterEngine",
      "cancelledRestricted",
    ] as const) {
      const fixture = wire[name];
      serve(fixture.body, fixture.actualStatus);
      expect(await sut(fixture.body.jobId)).toEqual(fixture.body);
    }
  });

  it("should report unknown quality when the orthomosaic metadata omits profile and reliability", () => {
    const sut = getOrthomosaicQualityInfo;
    const body =
      wire.legacyProfileOmitted.body as unknown as ProcessingJobDetailResponseDto;

    const quality = sut(orthomosaicOf(body));

    expect(quality).toMatchObject({
      processingProfile: "UNKNOWN",
      measurementReliability: "UNKNOWN",
    });
    expect(shouldShowDegradedQualityBanner(quality)).toBe(true);
  });

  it("should not warn about quality when the orthomosaic declares the standard profile", () => {
    const sut = shouldShowDegradedQualityBanner;
    const body =
      wire.standardCompleted.body as unknown as ProcessingJobDetailResponseDto;

    expect(sut(getOrthomosaicQualityInfo(orthomosaicOf(body)))).toBe(false);
  });

  it("should describe a failed job when the delivered job wire is failed", () => {
    const sut = jobStatusFriendlyMessage;

    expect(sut(wire.failedAfterEngine.body.status as JobStatusDto)).toBe(
      "Falha no processamento",
    );
  });

  it("should preserve recovery, attempt and stage fields when a recoverable job wire is consumed", async () => {
    const sut = getJob;
    const fixture = wire.recoverableInterrupted;
    serve(fixture.body, fixture.actualStatus);

    const job = await sut(fixture.body.jobId);

    expect(job).toEqual(fixture.body);
    expect(job.recoverable).toBe(true);
    expect(job.recoveryCause).toBe("PROGRESS_UNVERIFIED");
    expect(job.attempt?.state).toBe("FAILED");
    expect(job.stageEvidence).toBe("NOT_RECORDED");
  });

  it("should post recovery for the same job when the operator requests it", async () => {
    const sut = recoverJob;
    const accepted = {
      ...wire.recoverableInterrupted.body,
      status: "PENDING",
      recoverable: null,
      recoveryCause: null,
    };
    serve(accepted, 202);

    const job = await sut(accepted.jobId);

    expect(job).toEqual(accepted);
    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(String(url)).toMatch(new RegExp(`/api/v1/jobs/${accepted.jobId}/recover$`));
    expect(init?.method).toBe("POST");
  });

  it("should reject with the server next action when recovery is unsafe", async () => {
    const sut = recoverJob;
    serve(
      { status: 409, error: "CONFLICT", message: "No retained execution evidence supports recovery; start a new processing run" },
      409,
    );

    await expect(sut("00000000-0000-4000-8000-000000000144")).rejects.toMatchObject({
      status: 409,
      message: "No retained execution evidence supports recovery; start a new processing run",
    });
  });

  it("should not describe a restricted cancellation as absent processing when the job wire is cancelled", () => {
    const sut = jobStatusFriendlyMessage;

    expect(sut(wire.cancelledRestricted.body.status as JobStatusDto)).not.toBe(
      "Sem processamento",
    );
  });
});
