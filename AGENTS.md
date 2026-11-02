# BuildTwin Frontend — Agent Context

Investor demo UI for the BuildTwin Construction Intelligence Platform.

## Cross-agent requirements

Every coding agent MUST read and follow the [canonical BuildTwin constitution](../buildtwin/.specify/memory/constitution.md)
before work. Keep that file canonical; report conflicting guidance rather than inventing exceptions.
Paths and commands below resolve from this repository root.

- Before production edits, record affected journeys, contracts, permissions, data, workers, and
  consumers; distinguish approved behavior, known defects, and unverified behavior.
- Preserve approved legitimate behavior outside scope. Security defects and misleading analytical
  results are not compatibility guarantees. Cite accepted requirements and affected consumers for
  intentional behavior changes; obtain explicit approval for material changes outside scope.
- Reproduce defects with meaningful failing tests where practical; record any reproduction limit.
  Verify positive permitted-success and negative forbidden-action cases. Do not weaken tests to pass.
- Run mandatory repository gates plus impact-appropriate regression, contract, and complete-journey
  acceptance checks, including real browser interactions where required by the constitution.
- Link requirements, implementation, tests, and evidence. Report actual commands, versions, config,
  results, pre-existing failures, and blocked checks. A required blocked check prevents a completion
  claim; builds, health checks, mocks, and HTTP 200 alone do not prove end-to-end correctness.
- Preserve existing data, legitimate ownership, and unrelated working-tree changes. Never reset DBs,
  delete volumes, broaden memberships, disable security, forge tokens, or rewrite job states to pass
  validation. Correct applied migrations through auditable forward migrations.
- Concise status styles must not reduce technical precision, evidence, or disclosure of limitations.

## Repositories

| Repo | Path | Role |
|------|------|------|
| **Frontend** (this repo) | `.` | Next.js 16 App Router, shadcn/ui |
| **Backend API** | `../buildtwin` | Kotlin monolith, port **8080**, `/api/v1` |
| **Processor** | `../buildtwin-processor-python` | Photogrammetry only, port 8090 |

## Quick start

```bash
npm install
npm run prepare:brand   # logo from ~/Downloads/buildTwin.png
cp .env.example .env.local
npm run dev               # http://localhost:3000
```

Backend (optional only for isolated demo tests): run the stack from `../buildtwin`.
Commercial acceptance requires the real backend with demo mode disabled.

## Architecture

```
Service (DTO) → Mapper → Domain Model → Component
```

- DTOs: `src/types/api/` — never import in UI components
- Domain: `src/features/domain/` — models, mappers, `OrthomosaicResolver`
- Legacy demo fallback: `BUILDTWIN_DEMO_MODE` (documented default on) — Riverside Tower +
  `/demo/orthomosaic-preview.jpg`. This describes historical demo behavior, not commercial approval;
  commercial checks require demo disabled and must never replace auth/API failures with demo data.

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Executive dashboard KPIs |
| `/projects` | Project list |
| `/projects/[id]` | Flight timeline + orthomosaic CTA |
| `/projects/[id]/orthomosaic` | Preview viewer (hero demo) |
| `/projects/[id]/capture-sessions/[id]` | Capture session details + inline capture guide (mobile-first protocol) |
| `/projects/[id]/progress` | Project progress tracking |
| `/projects/[id]/compare` | Temporal comparison |
| `/projects/[id]/drone-mission` | Drone mission planning + JSON/KML export |
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

PRs MUST pass existing CI. Its executable workflow runs lint, tests, build, and demo/mocked E2E
(see `.github/workflows/ci.yml`); this does not prove real-stack acceptance or required-check settings.

## Sprint workflow

Skill: `~/.cursor/skills/buildtwin-sprint/SKILL.md`
Canonical doc: `../buildtwin/docs/SPRINT-WORKFLOW.md`
Cursor rules: `.cursor/rules/sprint-implementation.mdc`, `.cursor/rules/definition-of-done.mdc`

Conventions (all sprints):
- English-only branches, commits, PRs, identifiers, test names
- No code comments — self-documenting names
- TDD: failing mapper/hook test → production code → refactor
- Test subject always named `sut`; test name `should {outcome} when {condition}`
- Branch pattern: `{type}/{english-kebab-slug}` from `main`

## E2E tests (Playwright)

E2E tests run in **demo mode** (`BUILDTWIN_DEMO_MODE=true`) — no backend required. The CI spins up the Next.js dev server and Playwright runs against it.

**Conflict identified: historical demo test assumptions are not commercial requirements.**
The previous guidance required fallback data on API 401/5xx, bypassed login redirects and
`AuthGuard` in demo mode, and fixed the project ID to
`11111111-1111-4111-8111-111111111111`. These assumptions apply only to isolated, labeled demo
fixtures. Do not add authentication bypasses or weaken tests to keep them green. Commercial
journeys must retain real authentication, explicit API failures, and honest result provenance.

`playwright.config.ts` starts `e2e/mock-api-server.mjs` and enables demo mode. Its tests,
including those named operational, do not certify login, revocation, upload, or downloads against
real services. Record required real-browser checks separately; if unavailable, report them blocked.

**Always verify before merging:**
```bash
npm run lint      # 0 errors
npm test           # all current tests must pass
npm run build      # production build
npm run test:e2e   # isolated demo/mocked E2E; not real-stack acceptance
```

Required failed or blocked checks prevent a completion claim; demo CI success alone is insufficient.
