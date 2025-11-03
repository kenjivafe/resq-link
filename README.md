# RESQ-Link

![resq-link](https://github.com/user-attachments/assets/c84f2363-276b-4d14-abcf-548cac332b26)

ResQ Link is a Turborepo-managed monorepo delivering the Incident Response Coordination
feature set across API, web dispatcher console, and mobile applications.

## Prerequisites

- Node.js 18+ and pnpm 9.x
- Docker and Docker Compose (for database)
- Expo Go app (for mobile testing on physical devices)
- iOS Simulator or Android Emulator (for mobile testing on simulators)

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
  docker/    # Docker configurations
  terraform/ # IaC definitions for staging/production
  scripts/   # Automation helpers (bootstrap, migrations)
```

## Getting Started

### 1. Install Dependencies

```bash
# Enable corepack and install pnpm
corepack enable
corepack prepare pnpm@latest --activate

# Install project dependencies
pnpm install
```

### 2. Set Up Environment Variables

1. Copy example environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/mobile/.env.example apps/mobile/.env
   ```

2. Update the environment variables in each `.env` file with your configuration.

### 3. Start the Database

```bash
# Start PostgreSQL database using Docker
cd infrastructure
docker-compose up -d postgres
```

### 4. Run Database Migrations

```bash
# From the root directory
pnpm db:migrate
```

### 5. Start Development Servers

#### Option 1: Run all services (recommended for initial setup)

```bash
# In separate terminal windows

# Terminal 1: Start the API
cd apps/api
pnpm dev

# Terminal 2: Start the web app
cd apps/web
pnpm dev

# Terminal 3: Start the mobile app
cd apps/mobile
pnpm start
```

#### Option 2: Run services individually as needed

```bash
# Start specific services
pnpm --filter @resq-link/api dev    # API server (port 4000)
pnpm --filter @resq-link/web dev    # Web app (port 3000)
pnpm --filter @resq-link/mobile dev # Mobile app (Expo)
```

### 6. Access the Applications

- **Web App**: http://localhost:3000
- **API Server**: http://localhost:4000
- **Mobile App**:
  - Scan the QR code in the terminal with Expo Go app (iOS/Android)
  - Or press `i` for iOS Simulator / `a` for Android Emulator

## Testing

### Run All Tests

```bash
pnpm test
```

### Run Specific Tests

```bash
# API tests
pnpm --filter @resq-link/api test

# Web app tests
pnpm --filter @resq-link/web test

# Mobile app tests
pnpm --filter @resq-link/mobile test

# Run web app E2E tests
pnpm test:web
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `docker ps`
- Check database logs: `docker-compose logs -f postgres`
- Verify connection string in `apps/api/.env`

### Mobile App Issues

- Clear Metro bundler cache: `cd apps/mobile && pnpm start --clear`
- Reset iOS Simulator/Android Emulator if UI is not updating
- Check Expo logs in the terminal for errors

### Common Commands

```bash
# Install new dependency in a specific workspace
pnpm --filter @resq-link/web add package-name

# Add dev dependency to the root
pnpm add -Dw package-name

# Clean build artifacts
pnpm clean

# Reset the database (warning: destructive)
cd infrastructure/docker
docker-compose down -v
docker-compose up -d postgres
```
