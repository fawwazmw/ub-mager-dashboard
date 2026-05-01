# UB-Mager Dashboard

> Admin dashboard for the UB-Mager ride-hailing platform.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + Recharts + Leaflet
- **State:** Zustand + TanStack React Query
- **Maps:** react-leaflet

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Pages

- `/` — Dashboard overview
- `/live-tracking` — Real-time driver map
- `/analytics/revenue` — Revenue charts
- `/analytics/drivers` — Driver performance
- `/analytics/heatmap` — Demand heatmap
- `/analytics/demand` — ML demand prediction
- `/drivers` — Driver management
- `/rides` — Ride management
- `/settings` — Platform settings
