# Quickstart: Incident Response Coordination

## Prerequisites

- Node.js 20.x (LTS) with pnpm 9.x installed globally (`corepack enable`).
- Expo CLI (`npm install -g expo-cli`) for mobile development.
- Docker Desktop (or equivalent) for local PostgreSQL and Redis containers.
- AWS CLI or Cloudflare R2 CLI configured for media bucket access.
- GitHub CLI (optional) for pipeline management.

## Initial Setup

1. Clone repository and check out branch:
   ```bash
   git clone <repo-url>
   cd RESQ-LINK
   git checkout 001-incident-response
   ```
2. Install dependencies with pnpm:
   ```bash
   corepack enable
   pnpm install
   ```
3. Copy environment templates:
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/mobile/.env.example apps/mobile/.env
   ```
4. Launch local services via Docker Compose:
   ```bash
   docker compose up -d postgres redis minio
   ```

## Database & Prisma

1. Generate Prisma client and run migrations:
   ```bash
   pnpm turbo run db:generate --filter=api
   pnpm turbo run db:migrate --filter=api
   ```
2. Seed baseline data (roles, test accounts):
   ```bash
   pnpm --filter api seed
   ```

## Running Applications

1. Start API with live reload:
   ```bash
   pnpm --filter api dev
   ```
2. Start dispatcher web app:
   ```bash
   pnpm --filter web dev
   ```
3. Launch Expo mobile client:
   ```bash
   pnpm --filter mobile start
   ```
   - Use Expo Go on device or simulator. Provide tunnel or LAN option as needed.

## Testing & Quality Gates

1. Run lint and format checks:
   ```bash
   pnpm lint
   pnpm format:check
   ```
2. Execute unit tests across packages:
   ```bash
   pnpm turbo run test --filter=...
   ```
3. API integration tests with Supertest:
   ```bash
   pnpm --filter api test:integration
   ```
4. Web E2E via Playwright:
   ```bash
   pnpm --filter web test:e2e
   ```
5. Mobile E2E (Detox/Expo):
   ```bash
   pnpm --filter mobile test:e2e
   ```
6. Load testing using k6 scripts in `packages/testing/k6`:
   ```bash
   k6 run packages/testing/k6/incidents.js
   ```

## CI/CD Overview

- GitHub Actions workflows in `.github/workflows/` handle lint, typecheck, unit tests, and builds per app.
- Merges to `main` trigger deployments:
  - Web → Vercel preview/production
  - API → Render/Fly deploy via container image
  - Mobile → Expo EAS build pipelines
- Smoke tests run post-deploy against staging endpoints.

## Observability & Operations

- Sentry DSNs configured through environment variables for mobile, web, and API.
- Prometheus exporters enabled in API; dashboards provided via Grafana definitions in `infrastructure/observability`.
- Cron/queue workers perform media malware scans and retention policy enforcement.

## Next Steps

- Follow `research.md` and `data-model.md` for detailed implementation guidance.
- Use `/speckit.tasks` once design artifacts are finalized to generate execution tasks.
