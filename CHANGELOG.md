# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-06

### Added

- **Dashboard**: Overview page with stat cards, sparklines, revenue chart, recent rides
- **Live Tracking**: Real-time driver map with WebSocket location updates
- **Drivers**: Driver management (list, verify, toggle online, detail popup with recent rides)
- **Rides**: Ride management (list, detail with map, cancel, bulk cancel stuck)
- **Rides**: OSRM road-following route display on ride detail map
- **Rides**: Chat log viewer for dispute resolution
- **Tasks**: Task management page (list with category/status filters)
- **Users**: User management (list, search, suspend/unsuspend)
- **Reports**: Report management (list, filter by status, resolve with admin notes)
- **Analytics**: Revenue charts, ride stats, peak hours, daily breakdown, CSV export
- **Analytics**: Driver leaderboard
- **Settings**: Account info, theme toggle, API health check, reset preferences
- **Auth**: Login page with remember phone, toast notifications
- **Auth**: Session timeout with warning banner
- **UI**: Toast notification system (success/error/info, bottom-right)
- **UI**: Command palette (⌘K) with global search
- **UI**: Breadcrumb navigation with sticky header
- **UI**: API offline banner (red warning when API unreachable)
- **UI**: Dark theme (default)
- **UI**: Skeleton loading states
- **UI**: Error boundary + QueryError component
- **UI**: Confirm dialogs for destructive actions
- **UI**: Reusable Pagination component
- **UI**: TimeAgo component for relative timestamps
- **UI**: CopyButton with clipboard fallback
- **Data**: React Query for all server state (with unwrap utility)
- **Data**: Mutation hooks (useVerifyDriver, useAdminCancelRide, useBulkCancelStuckRides, useToggleDriverOnline, useBulkVerifyDrivers)
- **Data**: Consistent staleTime configuration per hook
- **Performance**: Vitest test suite (12 tests)
- **Infrastructure**: GitHub Actions CI (tsc + vitest + lint)
- **Infrastructure**: ESLint with next/core-web-vitals

### Technical Details

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS (dark theme)
- TanStack React Query v5
- Zustand (auth, sidebar, theme stores)
- Recharts (charts)
- react-leaflet (maps)
- lucide-react (icons)
- Vitest + @testing-library/react

[Unreleased]: https://github.com/wardayadev/ub-mager-dashboard/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/wardayadev/ub-mager-dashboard/releases/tag/v0.1.0
