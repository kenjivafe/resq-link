---
description: "Task list for Incident Response Coordination feature"
---

# Tasks: Incident Response Coordination

**Input**: Specification at `specs/001-incident-response/spec.md`, implementation plan at `specs/001-incident-response/plan.md`, supporting design docs in `specs/001-incident-response/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Add tests only where explicitly listed below.

**Organization**: Tasks are grouped by phase to preserve story independence and constitutional gates.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Configure Turborepo pipeline in `turbo.json` and declare packages in `pnpm-workspace.yaml`
- [x] T002 Populate root `package.json` with pnpm scripts for lint, test, build, and workspace tooling
- [x] T003 Create shared linting and formatting configs in `packages/config/eslint/index.cjs` and `packages/config/prettier/index.cjs`
- [x] T004 [P] Install Husky and lint-staged pre-commit hook in `.husky/pre-commit` wiring scripts in `package.json`
- [x] T005 Document workspace overview and onboarding in `README.md` and `docs/setup.md`
- [x] T006 Provision base infrastructure folder with IaC scaffold in `infrastructure/terraform/` and helper scripts in `infrastructure/scripts/`

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T007 Define local services (PostgreSQL, Redis, object storage) in `infrastructure/docker-compose.yml` and reference env vars in `.env.example`
- [x] T008 Configure Prisma datasource and generator stubs in `apps/api/prisma/schema.prisma` and run initial migration baseline
- [x] T009 Scaffold NestJS application entry (AppModule, config, health route) in `apps/api/src/app.module.ts` and `apps/api/src/main.ts`
- [x] T010 Bootstrap Next.js App Router shell with global layout and auth provider in `apps/web/app/layout.tsx`
- [x] T011 Initialize Expo application entry with navigation stack in `apps/mobile/App.tsx` and `apps/mobile/app.json`
- [x] T012 Establish shared environment loader utilities in `packages/config/env/index.ts` and per-app `.env.example`

## Phase 3: User Story 1 - Rapid Public Incident Submission (Priority: P1)

- [x] T013 [US1] Add `Incident` and `RateLimitRecord` models plus migrations in `apps/api/prisma/schema.prisma`
- [x] T014 [US1] Implement public incident POST endpoint in `apps/api/src/modules/incidents/public/public-incidents.controller.ts` and service logic
- [x] T015 [US1] Integrate per-device/IP rate limiting guard in `apps/api/src/common/guards/public-rate-limit.guard.ts` backed by Redis
- [x] T016 [US1] Publish `incident.created` WebSocket events from `apps/api/src/websockets/incident.gateway.ts`
- [x] T017 [US1] Build live incident list and real-time hook in `apps/web/app/incidents/page.tsx` consuming WebSocket feed
- [x] T018 [US1] Create anonymous reporting flow with location, media capture, and submission in `apps/mobile/app/report.tsx`
- [x] T019 [P] [US1] Add integration tests for public submissions and event emission in `apps/api/test/public-incidents.spec.ts`
- [x] T020 [P] [US1] Add Playwright scenario verifying dashboard updates in `apps/web/tests/incident-live.spec.ts`
- [x] T021 [P] [US1] Add Expo E2E test covering anonymous report flow in `apps/mobile/tests/report-flow.e2e.ts`

## Phase 4: User Story 2 - Dispatcher Triage & Assignment (Priority: P2)

- [x] T022 [US2] Extend Prisma schema with `Assignment` and `NotificationLog` models in `apps/api/prisma/schema.prisma`
- [x] T023 [US2] Implement authenticated incident list with filters in `apps/api/src/modules/incidents/incidents.controller.ts` and service
- [x] T024 [US2] Build dispatcher filter UI and incident detail panel in `apps/web/app/incidents/page.tsx`
- [x] T025 [US2] Implement responder assignment endpoint in `apps/api/src/modules/assignments/assignments.controller.ts` and service layer
- [x] T026 [US2] Trigger push notifications and log deliveries in `apps/api/src/modules/notifications/notifications.service.ts`
- [x] T027 [US2] Assignment management UI for dispatchers in `apps/web/app/incidents/page.tsx`
- [ ] T028 [P] [US2] Add contract tests covering assignment flow in `apps/api/test/assignments.spec.ts`
- [ ] T029 [P] [US2] Add Playwright scenario for dispatcher assignment workflow in `apps/web/tests/assignment-flow.spec.ts`

## Phase 5: User Story 3 - Responder Follow-Up & Incident Closure (Priority: P3)

- [ ] T030 [US3] Add `IncidentMedia` and audit models to `apps/api/prisma/schema.prisma` with migrations
- [ ] T031 [US3] Implement signed upload URL and malware scan queue in `apps/api/src/modules/uploads/uploads.controller.ts` and worker
- [ ] T032 [US3] Implement status transition API with role enforcement in `apps/api/src/modules/incidents/incident-status.controller.ts`
- [ ] T033 [US3] Build responder mobile assignment inbox and status updates in `apps/mobile/app/(responders)/assignments/index.tsx`
- [ ] T034 [US3] Render incident detail with media gallery and audit timeline in `apps/web/app/incidents/[id]/page.tsx`
- [ ] T035 [US3] Persist audit events for status and assignment changes in `apps/api/src/modules/audit/audit.service.ts`
- [ ] T036 [P] [US3] Add integration tests for status transitions and audit logging in `apps/api/test/incident-status.spec.ts`
- [ ] T037 [P] [US3] Add mobile E2E test validating responder acknowledgement and media upload in `apps/mobile/tests/responder-flow.e2e.ts`

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T038 Instrument OpenTelemetry exporters and Grafana dashboards in `infrastructure/observability/`
- [ ] T039 Configure scheduled retention jobs for anonymous incidents in `apps/api/src/modules/maintenance/retention.cron.ts`
- [ ] T040 Add CI/CD workflows for lint, test, build, and deploy in `.github/workflows/ci.yml` and `.github/workflows/deploy.yml`
- [ ] T041 Execute k6 load tests and record results in `packages/testing/k6/README.md`
- [ ] T042 Update operations runbooks and responder playbook in `docs/operations/`

## Dependencies & Execution Order

- **Phase dependencies**: Setup → Foundational → US1 → US2 → US3 → Polish. Each phase must be complete before moving to the next to satisfy constitutional gates.
- **Story dependencies**: US2 relies on US1 (incident feed baseline). US3 relies on US2 (assignment lifecycle). No reverse dependencies.
- **Data dependencies**: Prisma migrations from earlier phases must be applied before story-specific endpoints.

## Parallel Execution Examples

- **US1**: `T019`, `T020`, and `T021` can run in parallel once `T018` completes (tests across API/web/mobile).
- **US2**: `T028` and `T029` can execute in parallel after `T027` finalizes dispatcher UI.
- **US3**: `T036` and `T037` can proceed concurrently after `T035` wires audit logging.

## Implementation Strategy

1. Complete Phases 1–2 to establish monorepo, environment, and core platform services.
2. Deliver MVP by finishing US1 (Phase 3); validate anonymous reporting end-to-end.
3. Layer dispatcher triage (US2) while monitoring constitutional gates for reliability and accountability.
4. Implement responder follow-up (US3), ensuring media handling and audit trails meet privacy and trust requirements.
5. Finish polish tasks covering observability, automation, load testing, and runbooks before production deployment.
