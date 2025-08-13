# RESQ-LINK

A minimal emergency command center built with Laravel + Inertia + React + TailwindCSS. Includes a clean welcome page, authentication (login/register), and a sample dashboard with KPI cards, a city map, and a recent incidents table.

## Features

- Minimal, branded welcome page with conditional CTAs
- Authentication (login, register) using Laravel Breeze-style flow
- Sample Dashboard using shared `AppLayout`
  - KPI cards
  - Map widget (Leaflet via `react-leaflet`)
  - Recent incidents table (demo data)
- Dark mode support

## Tech Stack

- Laravel (API + server-side rendering with Inertia)
- Inertia.js (React adapter)
- React + TypeScript
- TailwindCSS
- Leaflet (map) via `react-leaflet`

## Requirements

- PHP 8.2+
- Composer
- Node.js 18+ and npm (or pnpm/yarn)
- A database (MySQL/MariaDB/PostgreSQL/SQLite)

## 1) Installation

```bash
# Clone repository
git clone <your-repo-url> resq-link
cd resq-link

# PHP deps
composer install

# Node deps (choose one)
npm install
# pnpm install
# yarn install

# Copy env
cp .env.example .env
# On Windows PowerShell:
# Copy-Item .env.example .env

# Generate app key
php artisan key:generate
```

### Configure .env

Edit `.env` to match your local setup:

```
APP_NAME="RESQ-LINK"
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=resq_link
DB_USERNAME=root
DB_PASSWORD=

VITE_APP_NAME=${APP_NAME}
```

Create the database if it doesn't exist, then run migrations:

```bash
php artisan migrate
```

If you have seeders, run:

```bash
php artisan db:seed
```

## 2) Running the app (local dev)

Recommended to run Laravel and Vite in separate terminals.

```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev
# pnpm dev
# yarn dev
```

Visit: http://127.0.0.1:8000

## 3) Usage guide

- Welcome page (`/`) shows logo and CTAs
  - Guests: Login, Register, View Incidents (link stub)
  - Authenticated: Open Console (Dashboard), Incidents, Live Feed (links stubs)
- Auth pages (`/login`, `/register`) are branded with the RESQ-LINK logo
- Dashboard (`/dashboard`):
  - KPI cards (demo numbers)
  - Map centered on Tuguegarao City
  - Recent incidents (demo rows)

Note: Some links may point to placeholder routes until backend endpoints and pages are wired up.

## 4) Presentation script (suggested)

1. Welcome page: show branding, light/dark toggle if available, explain CTAs
2. Register a new user (or login)
3. Dashboard tour:
   - KPIs: explain sample metrics
   - Map: zoom/pan; describe potential live incident overlays
   - Recent incidents table: explain statuses and future linking to detail pages
4. Outline roadmap: connecting real data, live updates, notifications

## 5) Building for production

```bash
# Build assets
npm run build
# pnpm build
# yarn build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
```

Serve with your preferred web server (Nginx/Apache) pointing to `public/`.

## 6) Project structure (key paths)

- `resources/js/app.tsx` — Inertia bootstrap
- `resources/js/pages/welcome.tsx` — Branded welcome page
- `resources/js/pages/dashboard.tsx` — Sample dashboard
- `resources/js/pages/auth/login.tsx` — Login page
- `resources/js/pages/auth/register.tsx` — Register page
- `resources/js/layouts/app-layout.tsx` — App layout wrapper
- `resources/js/layouts/auth-layout.tsx` — Auth layout (includes logo)
- `resources/js/components/app-logo.tsx` — Brand logo component
- `resources/js/components/map/MapView.tsx` — Leaflet map wrapper
- `resources/js/components/ui/*` — Reusable UI primitives

## 7) Troubleshooting

- White screen or Inertia resolve error:
  - Ensure files live under `resources/js/pages` and names match route names
- Styles not applied:
  - Run Vite dev server; ensure Tailwind is set up in `postcss.config.js` and `tailwind.config.js`
- Leaflet icons missing:
  - `MapView` already patches icon URLs for Vite; clear cache and reload
- 419/CSRF issues:
  - Check that cookies/domain match `APP_URL`

## 8) Roadmap (high level)

- Wire KPIs and incidents to backend data
- Realtime event subscriptions for live updates
- Incident details, assignments, and notifications
- Reports UI and data aggregation
- Mobile app scaffolding via Capacitor

## 9) Contributing

1. Fork + create a feature branch
2. Follow existing patterns for pages/layouts/components
3. Add tests where applicable
4. Open a PR with a clear description and screenshots

## License

Proprietary – internal project (update if needed).
