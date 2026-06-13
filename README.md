# BuildTwin Frontend

Investor Demo UI for the BuildTwin Construction Intelligence Platform.

**Tagline:** See Your Construction Site Evolve

## Prerequisites

- Node.js 20+
- BuildTwin backend running at `http://localhost:8080`

```bash
cd /home/mister-storm/development/BuildTwin
docker compose up
```

## Setup

```bash
cd /home/mister-storm/development/buildtwin-frontend
npm install
npm run prepare:brand   # extrai logo (quadrante "O FÍSICO ENCONTRA O DIGITAL") de ~/Downloads/buildTwin.png
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Mode (backend offline)

When `BUILDTWIN_DEMO_MODE` is not `false`, the app includes a sample project **Riverside Tower** with 3 flights and a demo orthomosaic preview.

**Quick path to see the mosaic viewer:**

1. Open [http://localhost:3000/projects](http://localhost:3000/projects)
2. Click **Riverside Tower**
3. Click **View Orthomosaic** (or a flight node on the timeline)

Direct URL:

`/projects/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/orthomosaic?flightId=bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BUILDTWIN_API_URL` | `http://localhost:8080` | Backend API (server-side fetch + Next.js rewrite proxy) |
| `BUILDTWIN_DEMO_MODE` | enabled | Set to `false` to disable demo project fallback |
| `ORTHOMOSAIC_MAPPINGS` | — | JSON array for `MockOrthomosaicResolver` |

### ORTHOMOSAIC_MAPPINGS example

After processing a flight, populate `.env.local`:

```env
ORTHOMOSAIC_MAPPINGS=[{"projectId":"YOUR_PROJECT_ID","flightId":"YOUR_FLIGHT_ID","jobId":"YOUR_JOB_ID","previewArtifactId":"OPTIONAL_PREVIEW_ID"}]
```

To discover IDs:

```bash
# Start processing
curl -X POST http://localhost:8080/api/v1/flights/{flightId}/process

# Poll until COMPLETED
curl http://localhost:8080/api/v1/jobs/{jobId}

# Find ORTHOMOSAIC_PREVIEW artifactId in artifacts[]
```

## 60-Second Demo Flow

1. **Dashboard** (`/`) — executive KPIs: Obras Ativas, Último Voo, Área Monitorada, Processamentos Concluídos
2. **Projetos** (`/projects`) — select a construction project
3. **Detalhe da Obra** (`/projects/{id}`) — flight timeline + View Orthomosaic CTA
4. **Visualizador** (`/projects/{id}/orthomosaic`) — processed orthomosaic JPEG preview

## Architecture

```
Service (DTO) → Mapper → Domain Model → Component
```

- **OrthomosaicResolver** — abstraction for flight→job resolution; swap `MockOrthomosaicResolver` for `ApiOrthomosaicResolver` without changing pages
- **Theme** — Light / Dark / System via `next-themes` + shadcn/ui
- **API proxy** — `/api/v1/*` rewritten to backend (no CORS issues)

## API Reference

Backend Swagger: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

Validated endpoints used by this frontend:

- `GET /api/v1/projects`
- `GET /api/v1/projects/{id}`
- `GET /api/v1/projects/{id}/dashboard`
- `GET /api/v1/projects/{id}/flights`
- `GET /api/v1/jobs/{id}`
- `GET /api/v1/artifacts/{id}`
- `GET /api/v1/artifacts/{id}/preview`

## Out of Scope (Sprint 5A)

- Authentication
- Maps (Leaflet / OpenLayers / Cesium)
- Temporal comparison
- CRUD operations

## Testing

```bash
npm test              # Vitest (unit + component)
npm run test:watch    # Vitest watch mode
npm run test:e2e      # Playwright E2E (starts dev server automatically)
npm run test:e2e:ui   # Playwright UI mode
```

First-time E2E setup:

```bash
npx playwright install chromium
```

E2E runs in **demo mode** (`BUILDTWIN_DEMO_MODE=true`) — no backend required.

## CI

GitHub Actions runs on push/PR to `main` or `master`:

1. **lint** — ESLint
2. **test** — Vitest unit + component tests
3. **build** — Next.js production build
4. **e2e** — Playwright demo flow + theme toggle

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm run start    # Production server
npm test         # Run tests
```
