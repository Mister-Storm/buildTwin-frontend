# BuildTwin Frontend — Agent Context

Investor demo UI for the BuildTwin Construction Intelligence Platform.

## Repositories

| Repo | Path | Role |
|------|------|------|
| **Frontend** (this repo) | `/home/mister-storm/development/buildtwin-frontend` | Next.js 16 App Router, shadcn/ui |
| **Backend API** | `/home/mister-storm/development/BuildTwin` | Kotlin monolith, port **8080**, `/api/v1` |
| **Processor** | `/home/mister-storm/development/buildtwin-processor-python` | Photogrammetry only, port 8090 |

## Quick start

```bash
cd /home/mister-storm/development/buildtwin-frontend
npm install
npm run prepare:brand   # logo from ~/Downloads/buildTwin.png
cp .env.example .env.local
npm run dev               # http://localhost:3000
```

Backend (optional for demo): `docker compose up` in BuildTwin.

## Architecture

```
Service (DTO) → Mapper → Domain Model → Component
```

- DTOs: `src/types/api/` — never import in UI components
- Domain: `src/features/domain/` — models, mappers, `OrthomosaicResolver`
- Demo fallback: `BUILDTWIN_DEMO_MODE` (default on) — Riverside Tower + `/demo/orthomosaic-preview.jpg`

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Executive dashboard KPIs |
| `/projects` | Project list |
| `/projects/[id]` | Flight timeline + orthomosaic CTA |
| `/projects/[id]/orthomosaic` | Preview viewer (hero demo) |

## Demo orthomosaic URL

```
/projects/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/orthomosaic?flightId=bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb
```

## Brand assets

- Source: `~/Downloads/buildTwin.png` (Tipografia quadrant, white bg removed)
- Regenerate: `npm run prepare:brand`
- Output: `public/brand/logo.png`, `logo-sidebar.png`, `icon.png`

## Security / CSP

- **Production:** strict CSP (`script-src 'self' 'unsafe-inline'` — no `unsafe-eval`)
- **Development:** adds `'unsafe-eval'` (React/Turbopack) + `ws:` for HMR
- `unsafe-inline` required for `next-themes`

## TypeScript

Strict flags: `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`. No `any`.

## Out of scope (current sprint)

Auth, maps (Leaflet/Cesium), temporal comparison, E2E tests, backend changes.
