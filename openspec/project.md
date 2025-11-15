# Project Context

## Purpose

ResQ Link delivers an incident response coordination platform that unifies public reporting,
dispatcher operations, and responder follow-up across API, web, and mobile channels. It
aims to minimise friction during emergencies by collecting incidents quickly, routing them
to dispatchers, and keeping all stakeholders in sync with real-time updates.

## Tech Stack

- Turborepo-managed pnpm monorepo with shared tooling packs.
- TypeScript-first codebase targeting Node.js 18+ runtime.
- Backend: NestJS services with Prisma ORM, WebSocket gateways, and PostgreSQL storage.
- Web: Next.js 16 + React 19 UI with TailwindCSS styling and Socket.IO clients.
- Mobile: Expo-managed React Native app for reporters and responders.
- Quality tooling: ESLint (Typescript + React profiles), Prettier, Husky, and lint-staged.

## Project Conventions

### Code Style

- Prettier enforces `printWidth: 100`, double quotes, trailing commas, and 2-space
  indentation across the monorepo.
- ESLint uses typescript-eslint, React, and React Hooks rules with project-aware parsing.
- Husky pre-commit hook runs lint-staged: ESLint fixes for TS/JS sources and Prettier for
  JSON/Markdown/styles to keep commits tidy.
- Prefer descriptive PascalCase for components, camelCase for functions/variables, and
  UPPER_SNAKE case for environment variables.

### Architecture Patterns

- Turborepo workspace structure separates domain apps (`apps/api`, `apps/web`, `apps/mobile`)
  and shared packages (`packages/config`, `packages/types`, etc.) for modular builds.
- API uses NestJS modules with validation pipes, DTO classes, and Prisma repositories and
  exposes REST and Socket.IO gateways for real-time dispatch events.
- Web console consumes API and Socket.IO channels for dispatcher workflows and provides
  Next.js app routing backed by Tailwind utility styling.
- Mobile client uses Expo Router + React Navigation to provide field responder tooling with
  offline-aware queues reconciling via backend events.
- Infrastructure folder houses Docker Compose, Terraform, and automation scripts aligned
  with environment parity conventions.

### Testing Strategy

- `pnpm test` fan-outs via Turbo to run package-level unit tests (Jest for API, React Native,
  and shared utilities).
- Web app end-to-end coverage uses Playwright (`pnpm test:web`, `test:web:headed`, `test:web:ui`).
- Mobile flows rely on Jest Expo harness with React Native Testing Library.
- API integration tests leverage Jest + Supertest against local PostgreSQL, while load
  testing scripts live under `packages/testing/k6`.
- Contributors should ensure lint (`pnpm lint`) and format checks pass before pushing.

### Git Workflow

- Trunk-based development: create short-lived feature branches, then open reviewed PRs into
  `main`.
- Merges to `main` trigger CI/CD pipelines for lint, typecheck, build, and environment
  deployments, so only merge when green.
- Keep commits scoped and descriptive; prefer imperative first-person present tense
  messages (e.g., `feat: add dispatcher triage filters`).

## Domain Context

- Primary personas: public reporters submit incidents, dispatchers triage/assign, and
  responders acknowledge, update, and close cases.
- Key flows: public incident submission without authentication, dispatcher triage with live
  maps/filters, responder acknowledgement and media uploads, plus audit logging for status
  transitions.
- System emphasises real-time data propagation (<=2s latency targets) and reliable
  notifications with SMS fallback when push delivery fails.
- Privacy controls ensure minimal PII retention for anonymous submissions, with purge rules
  after configured retention windows.

## Important Constraints

- Real-time channels must support at least 200 concurrent clients with sub-2s broadcast
  latency.
- Read operations must achieve ≤300ms p95 and writes ≤700ms p95 under expected load.
- Push notifications require retry logic and SMS fallback for unacknowledged responders.
- Anonymous incident records must be purged or anonymised after agreed retention periods to
  maintain privacy compliance.
- Architecture must remain horizontally scalable via stateless app services with shared
  external data stores.

## External Dependencies

- PostgreSQL 16 (local via Docker) for persistent storage.
- Redis 7 for caching, rate limiting, and socket session coordination.
- MinIO object storage for incident media assets; maps to S3-compatible providers in cloud.
- Push notification gateway (Expo/FCM/APNS) with SMS fallback provider for responder alerts.
- Expo services for building and distributing the mobile app.
