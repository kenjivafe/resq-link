# ResQ Link Monorepo

ResQ Link is a Turborepo-managed monorepo delivering the Incident Response Coordination
feature set across API, web dispatcher console, and mobile applications.

## Structure

```
apps/
  api/       # NestJS backend services
  web/       # Next.js dispatcher/admin UI
  mobile/    # Expo mobile client for reporters and responders

packages/
  config/    # Shared tooling configs (ESLint, Prettier, env loaders)
  types/     # Shared TypeScript contracts
  ui/        # Reusable UI primitives
  testing/   # Testing utilities and harnesses

infrastructure/
  terraform/ # IaC definitions for staging/production
  scripts/   # Automation helpers (bootstrap, migrations)
```

## Getting Started

1. Install pnpm 9.x via Corepack:
   ```bash
   corepack enable
   ```
2. Install workspace dependencies:
   ```bash
   pnpm install
   ```
3. Review environment templates in each app (`apps/*/.env.example`) and populate secrets.
4. Use Turborepo scripts for development:
   ```bash
   pnpm dev       # Start all dev targets
   pnpm lint      # Run lint checks
   pnpm test      # Execute tests
   pnpm build     # Build all packages
   ```

Refer to `docs/setup.md` for detailed onboarding, including local services and toolchain
setup.
