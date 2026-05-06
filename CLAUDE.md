# CLAUDE.md — UB-Mager Dashboard

> Context file for AI assistants working on this codebase.

## Project Overview

Admin dashboard for the **UB-Mager** ride-hailing platform. Provides real-time driver tracking, analytics, ride management, and platform configuration for administrators.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| State | Zustand (client state) + TanStack React Query (server state) |
| Maps | react-leaflet / Leaflet |
| Charts | Recharts |
| Icons | lucide-react |
| Utilities | clsx, tailwind-merge |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          → Root layout
│   ├── globals.css         → Global styles (Tailwind)
│   ├── not-found.tsx       → 404 page
│   ├── login/              → Login page
│   └── (dashboard)/        → Dashboard route group (authenticated)
│       ├── layout.tsx      → Dashboard layout (sidebar, header)
│       ├── page.tsx        → Dashboard overview
│       ├── analytics/      → Analytics pages (revenue, drivers, heatmap, demand)
│       ├── drivers/        → Driver management
│       ├── rides/          → Ride management
│       ├── live-tracking/  → Real-time driver map
│       └── settings/       → Platform settings
├── components/
│   ├── ui/                 → Reusable UI components
│   ├── charts/             → Chart components (Recharts wrappers)
│   └── map/                → Map components (Leaflet wrappers)
├── hooks/
│   ├── useAnalytics.ts     → Analytics data fetching hooks
│   ├── useWebSocket.ts     → WebSocket connection hook
│   ├── useKeyboardShortcuts.ts
│   └── usePageTitle.ts
├── stores/
│   ├── authStore.ts        → Authentication state (Zustand)
│   ├── analyticsStore.ts   → Analytics state
│   ├── liveTrackingStore.ts → Live tracking state
│   └── themeStore.ts       → Theme/dark mode state
└── lib/
    ├── api.ts              → API client (fetch wrapper)
    └── types.ts            → Shared TypeScript types
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Admin login |
| `/` | Dashboard overview (stats, recent activity) |
| `/live-tracking` | Real-time driver map (WebSocket) |
| `/analytics/revenue` | Revenue charts |
| `/analytics/drivers` | Driver performance |
| `/analytics/heatmap` | Demand heatmap |
| `/analytics/demand` | ML demand prediction |
| `/drivers` | Driver management (list, verify, toggle) |
| `/rides` | Ride management (list, cancel) |
| `/settings` | Platform settings |

## Commands

```bash
npm install           # Install dependencies
npm run dev           # Start dev server (port 3000)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
```

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:
- `NEXT_PUBLIC_API_URL` — Backend API URL (default: http://localhost:8081)
- `NEXT_PUBLIC_WS_URL` — WebSocket URL
- `NEXT_PUBLIC_ML_URL` — ML service URL (default: http://localhost:8000)

## Conventions

- **Path alias**: `@/*` maps to `./src/*`
- **App Router**: All pages use Next.js 14 App Router conventions
- **Route groups**: `(dashboard)` groups authenticated pages with shared layout
- **State management**: Zustand for client state, React Query for server/async state
- **API calls**: Use the `api.ts` client in `src/lib/` — wraps fetch with auth headers
- **Components**: Reusable components in `src/components/ui/`, page-specific inline
- **Styling**: Tailwind utility classes; use `clsx` + `tailwind-merge` for conditional classes
- **Maps**: Leaflet components are dynamically imported (no SSR) due to window dependency
- **WebSocket**: Custom hook connects to API's WebSocket for live driver locations

## Architecture Notes

- Dashboard is **client-heavy** — most pages are client components with React Query
- Auth uses JWT stored in Zustand (persisted to localStorage)
- WebSocket connection managed globally via `useWebSocket` hook
- Charts use Recharts with custom wrappers in `src/components/charts/`
- Map tiles from OpenStreetMap via Leaflet

## Git & Versioning

Current version: `0.1.0` (in development)

**Daily push:**
```bash
git add .
git commit -m "feat: description"
git push -u origin develop
```

**Commit prefixes:** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`

**Release a version:**
```bash
# 1. Update CHANGELOG.md
# 2. Update version in package.json
# 3. Commit + tag
git add .
git commit -m "chore: release v0.2.0"
git push
git tag v0.2.0
git push --tags
```

**Bump rules:** bug fix → PATCH (`0.1.1`), new feature → MINOR (`0.2.0`), production release → `1.0.0`

## Related Repos

- `ub-mager-api` — Main backend API (Go/Gin, port 8081)
- `ub-mager-ml` — ML demand prediction service (Python/FastAPI, port 8000)
- `ub-mager-docs` — Bruno API collection
