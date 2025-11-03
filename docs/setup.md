# Workspace Setup Guide

This guide walks new contributors through preparing a local environment for the ResQ Link
monorepo.

## 1. Tooling

- **Node.js**: Install Node 20 LTS (use `asdf`, `nvm`, or official installer).
- **pnpm**: Enable Corepack and activate pnpm 9.x.
  ```bash
  corepack enable
  corepack prepare pnpm@9.0.0 --activate
  ```
- **Expo CLI**: Install globally for mobile workflows.
  ```bash
  npm install -g expo-cli
  ```
- **Docker Desktop**: Required to run local PostgreSQL, Redis, and object storage services.
- **AWS CLI or Cloudflare R2 CLI**: Configure credentials if you will manage media storage.

## 2. Repository Checkout

```bash
git clone <repo-url>
cd RESQ-LINK
pnpm install
```

## 3. Environment Variables

1. Copy templates into working `.env` files:
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/mobile/.env.example apps/mobile/.env
   ```
2. Populate secrets (database URLs, Redis connection strings, Expo tokens, etc.).

## 4. Local Services

Use Docker Compose (defined in `infrastructure/docker-compose.yml`) to run dependencies:
```bash
docker compose up -d postgres redis minio
```

## 5. Database Tooling

Generate Prisma client and apply migrations once schemas are defined:
```bash
pnpm db:generate
pnpm db:migrate
```

## 6. Development Commands

- `pnpm dev` – Start all available dev servers (API, web, mobile)
- `pnpm lint` – Run shared ESLint configuration
- `pnpm test` – Execute test pipeline across packages
- `pnpm build` – Build all apps and packages

## 7. Git Hooks & Quality Gates

Husky pre-commit hooks run `lint-staged` to enforce formatting and linting. If a check fails,
fix the reported issues before committing.

## 8. Additional Resources

- `specs/001-incident-response/quickstart.md` – End-to-end flow for running applications and
  tests.
- `infrastructure/` – Terraform modules and automation scripts.
- `specs/001-incident-response/research.md` – Architectural decisions reference.
