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
| `/projects/[id]/capture-sessions/[id]` | Capture session details |
| `/projects/[id]/progress` | Project progress tracking |
| `/projects/[id]/compare` | Temporal comparison |
| `/projects/[id]/drone-mission` | Drone mission planning |
| `/admin` | Admin panel (users, roles, system health) — ADMIN only |
| `/login` | Authentication (email + password) |
| `/demo` | Commercial demo (public) |
| `/portfolio` | Multi-project portfolio view |

## AppShell layout

All authenticated pages use `<AppShell breadcrumbs={[...]}>` which wraps:
- `AppSidebar` — navigation links (admin link visible only for ADMIN role)
- `AppTopbar` — breadcrumbs + theme toggle + logout button + user name
- `AuthGuard` — redirects to `/login` if not authenticated

## Demo orthomosaic URL

```
/projects/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/orthomosaic?captureSessionId=bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb
```

## Brand assets

- Source: `~/Downloads/buildTwin.png` (quadrante superior esquerdo — "O FÍSICO ENCONTRA O DIGITAL", fundo branco removido)
- Regenerate: `npm run prepare:brand`
- Output: `public/brand/logo.png`, `logo-sidebar.png`, `icon.png`

## Security / CSP

- **Production:** strict CSP (`script-src 'self' 'unsafe-inline'` — no `unsafe-eval`)
- **Development:** adds `'unsafe-eval'` (React/Turbopack) + `ws:` for HMR
- `unsafe-inline` required for `next-themes`
- Map tiles: `img-src` allows `https://*.tile.openstreetmap.org`; marker PNGs served from `/public/leaflet/`

## TypeScript

Strict flags: `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`. No `any`.

## Testing

```bash
npm test           # Vitest unit + component
npm run test:e2e   # Playwright (demo mode, no backend)
```

PRs must pass CI: lint → test → build → e2e (see `.github/workflows/ci.yml`).

## Out of scope (current sprint)

Auth, maps (Leaflet/Cesium), temporal comparison, backend changes.

## E2E tests (Playwright)

E2E tests run in **demo mode** (`BUILDTWIN_DEMO_MODE=true`) — no backend required. The CI spins up the Next.js dev server and Playwright runs against it.

**Rules for E2E to pass:**
1. Pages must have **demo fallback** data when API returns 401/5xx (see `projects/page.tsx` for pattern)
2. `middleware.ts` must NOT redirect to `/login` when `BUILDTWIN_DEMO_MODE !== "false"`
3. `AuthGuard` must skip auth check when `DEMO_ENABLED` is true
4. The demo project ID must match `11111111-1111-4111-8111-111111111111` (hardcoded in E2E tests)

**Always verify before merging:**
```bash
npm run lint      # 0 errors
npm test           # 280 tests passing  
npm run build      # production build
npm run test:e2e   # 5 E2E tests passing (requires demo mode)
```

Pipeline failure = tarefa não concluída.
