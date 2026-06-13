import http from "node:http";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const FLIGHT_ID = "22222222-2222-4222-8222-222222222222";
const JOB_ID = "33333333-3333-4333-8333-333333333333";
const PREVIEW_ID = "44444444-4444-4444-8444-444444444444";
const ORTHO_ID = "55555555-5555-4555-8555-555555555555";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const routes = new Map([
  [
    "GET /api/v1/companies",
    (_req, res) =>
      json(res, 200, [
        {
          id: "66666666-6666-4666-8666-666666666666",
          name: "Construtora Parceira",
          createdAt: "2026-01-01T00:00:00Z",
        },
      ]),
  ],
  [
    `GET /api/v1/flights/${FLIGHT_ID}/images`,
    (_req, res) => json(res, 200, []),
  ],
  [
    "GET /api/v1/projects",
    (_req, res) =>
      json(res, 200, [
        {
          id: PROJECT_ID,
          companyId: "66666666-6666-4666-8666-666666666666",
          name: "Obra Integração",
          location: {
            address: "Rua Teste, 100",
            city: "São Paulo",
            state: "SP",
            country: "Brasil",
            latitude: -23.55,
            longitude: -46.63,
          },
          startDate: "2026-01-01",
          createdAt: "2026-01-01T00:00:00Z",
          archivedAt: null,
        },
      ]),
  ],
  [
    `GET /api/v1/projects/${PROJECT_ID}`,
    (_req, res) =>
      json(res, 200, {
        id: PROJECT_ID,
        companyId: "66666666-6666-4666-8666-666666666666",
        name: "Obra Integração",
        location: {
          address: "Rua Teste, 100",
          city: "São Paulo",
          state: "SP",
          country: "Brasil",
          latitude: -23.55,
          longitude: -46.63,
        },
        startDate: "2026-01-01",
        createdAt: "2026-01-01T00:00:00Z",
        archivedAt: null,
      }),
  ],
  [
    `GET /api/v1/projects/${PROJECT_ID}/flights`,
    (_req, res) =>
      json(res, 200, [
        {
          flightId: FLIGHT_ID,
          flightDate: "2026-06-12",
          operatorName: "Operador E2E",
          imageCount: 42,
          latestProcessingStatus: "COMPLETED",
          latestJobId: JOB_ID,
        },
      ]),
  ],
  [
    `GET /api/v1/projects/${PROJECT_ID}/dashboard`,
    (_req, res) =>
      json(res, 200, {
        projectId: PROJECT_ID,
        projectName: "Obra Integração",
        archived: false,
        totalFlights: 1,
        flightsByStatus: { COMPLETED: 1 },
        processedFlights: 1,
        pendingFlights: 0,
        failedFlights: 0,
        latestFlightDate: "2026-06-12",
        recentFlights: [
          {
            flightId: FLIGHT_ID,
            flightDate: "2026-06-12",
            imageCount: 42,
            latestProcessingStatus: "COMPLETED",
            latestJobId: JOB_ID,
            hasReport: true,
          },
        ],
      }),
  ],
  [
    `GET /api/v1/flights/${FLIGHT_ID}/latest-job`,
    (_req, res) =>
      json(res, 200, {
        jobId: JOB_ID,
        flightId: FLIGHT_ID,
        jobType: "ORTHOMOSAIC_PROCESSING",
        status: "COMPLETED",
        createdAt: "2026-06-12T10:00:00Z",
        startedAt: "2026-06-12T10:01:00Z",
        completedAt: "2026-06-12T11:00:00Z",
        failureReason: null,
      }),
  ],
  [
    `GET /api/v1/flights/${FLIGHT_ID}`,
    (_req, res) =>
      json(res, 200, {
        flightId: FLIGHT_ID,
        projectId: PROJECT_ID,
        flightDate: "2026-06-12",
        operatorName: "Operador E2E",
        imageCount: 42,
        createdAt: "2026-06-12T09:00:00Z",
        latestJob: {
          jobId: JOB_ID,
          status: "COMPLETED",
          createdAt: "2026-06-12T10:00:00Z",
          startedAt: "2026-06-12T10:01:00Z",
          completedAt: "2026-06-12T11:00:00Z",
        },
      }),
  ],
  [
    `GET /api/v1/jobs/${JOB_ID}`,
    (_req, res) =>
      json(res, 200, {
        jobId: JOB_ID,
        flightId: FLIGHT_ID,
        jobType: "ORTHOMOSAIC_PROCESSING",
        status: "COMPLETED",
        createdAt: "2026-06-12T10:00:00Z",
        startedAt: "2026-06-12T10:01:00Z",
        completedAt: "2026-06-12T11:00:00Z",
        failureReason: null,
        artifacts: [
          {
            artifactId: PREVIEW_ID,
            artifactType: "ORTHOMOSAIC_PREVIEW",
            artifactStatus: "PUBLISHED",
            storagePath: "preview.jpg",
            fileSize: 512000,
            checksum: "abc",
            metadata: { width: 800, height: 600 },
            createdAt: "2026-06-12T11:00:00Z",
          },
          {
            artifactId: ORTHO_ID,
            artifactType: "ORTHOMOSAIC",
            artifactStatus: "PUBLISHED",
            storagePath: "ortho.tif",
            fileSize: 50000000,
            checksum: "def",
            metadata: {},
            createdAt: "2026-06-12T11:00:00Z",
          },
        ],
      }),
  ],
  [
    `GET /api/v1/artifacts/${PREVIEW_ID}`,
    (_req, res) =>
      json(res, 200, {
        artifactId: PREVIEW_ID,
        artifactType: "ORTHOMOSAIC_PREVIEW",
        storagePath: "preview.jpg",
        fileSize: 512000,
        checksum: "abc",
        metadata: { width: 800, height: 600 },
        createdAt: "2026-06-12T11:00:00Z",
      }),
  ],
  [
    `GET /api/v1/artifacts/${PREVIEW_ID}/preview`,
    (_req, res) => {
      res.writeHead(200, { "Content-Type": "image/png" });
      res.end(PNG_1X1);
    },
  ],
  [
    "GET /api/v1/system/readiness",
    (_req, res) => json(res, 200, { status: "UP" }),
  ],
  [
    "GET /api/v1/system/overview",
    (_req, res) =>
      json(res, 200, {
        timestamp: "2026-06-13T12:00:00Z",
        overallStatus: "UP",
        components: {
          backend: { status: "UP", version: "0.1.0-SNAPSHOT" },
          postgres: { status: "UP" },
          minio: { status: "UP" },
          worker: {
            status: "UP",
            version: "0.1.0-SNAPSHOT",
            lastSeenAt: "2026-06-13T11:59:45Z",
            currentStatus: "IDLE",
            processedJobsCount: 1,
            lastJobId: JOB_ID,
            lastJobFinishedAt: "2026-06-12T11:00:00Z",
          },
          processor: { status: "UP", version: "0.1.0" },
        },
        operations: {
          projects: 1,
          flights: 1,
          jobs: 1,
          processedJobs: 1,
          pendingJobs: 0,
          failedJobs: 0,
          recentJobs: [
            {
              projectId: PROJECT_ID,
              projectName: "Obra Integração",
              flightId: FLIGHT_ID,
              flightDate: "2026-06-12",
              operatorName: "Operador E2E",
              status: "COMPLETED",
              jobId: JOB_ID,
            },
          ],
        },
      }),
  ],
  [
    "GET /api/v1/system/operations-summary",
    (_req, res) =>
      json(res, 200, {
        projects: 1,
        flights: 1,
        jobs: 1,
        processedJobs: 1,
        pendingJobs: 0,
        failedJobs: 0,
        recentJobs: [],
      }),
  ],
  [
    "POST /api/v1/system/self-test",
    (_req, res) =>
      json(res, 200, {
        success: true,
        timestamp: "2026-06-13T12:00:00Z",
        checks: [
          { component: "postgres", status: "PASS", message: "SELECT 1 OK" },
          { component: "minio", status: "PASS", message: "Bucket exists" },
          { component: "processor", status: "PASS" },
          { component: "worker", status: "PASS", message: "Heartbeat 15s ago" },
        ],
      }),
  ],
]);

const server = http.createServer((req, res) => {
  const key = `${req.method} ${req.url?.split("?")[0]}`;
  const handler = routes.get(key);
  if (handler) {
    handler(req, res);
    return;
  }
  json(res, 404, { error: "NOT_FOUND", message: `No mock for ${key}` });
});

const port = Number(process.env.PORT ?? 8080);
server.listen(port, () => {
  console.log(`[e2e] Mock BuildTwin API listening on http://localhost:${port}`);
});
