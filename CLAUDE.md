# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev           # Start dev server (proxies /api → http://localhost:8080)
pnpm build         # Production build (Vite)

# Testing
pnpm test          # Watch mode
pnpm test:run      # Single run
pnpm test:coverage # Coverage report

# Run a single test file
pnpm vitest run src/lib/permissions.test.ts
```

## Environment

- `VITE_API_BASE_URL` — backend API URL. In dev, set via `.env`. In Docker, injected at container startup by replacing `__VITE_API_BASE_URL_PLACEHOLDER__` in the built JS.

## Architecture

**Tech:** React 18 + TypeScript + Vite 6, Tailwind CSS 4, Radix UI (shadcn-style), React Router 7, React Flow, Vitest.

### Entry & Routing

`src/main.tsx` → `src/app/App.tsx` wraps everything in `ThemeProvider`, `AuthProvider`, `ChatProvider`, and the router.

Layout is selected in `src/app/layouts/AppLayout.tsx`:
- **MapLayout** — full-screen canvas for `/environments/:envId`
- **DashboardLayout** — sidebar nav for all authenticated app pages
- No chrome — public pages (`/`, `/login`, `/register`, `/accept-invite`, `/onboarding`, `/member-onboarding`)

Three route guards: `ProtectedRoute` (auth), `RequireOnboardingCompleted` (redirects to onboarding), `RequireOrgAccess` (org-level role check).

### Feature Modules (`src/features/`)

Each feature owns its pages, components, hooks, and local utilities. Major features: `auth`, `dashboard`, `environments`, `map`, `organization`, `teams`, `users`, `profile`, `integrations`, `repositories`, `gcloud`, `chat`, `onboarding`, `invitations`.

### API Layer (`src/lib/`)

- `api.ts` — central API client; all backend calls go through `apiFetch<T>(path, init)` which handles auth headers and JSON. Covers auth, orgs, environments, entities, relationships, teams, users, invitations, dashboard stats, and GCloud resources.
- `api-base.ts` — `getApiBase()` resolves the backend URL from `VITE_API_BASE_URL`.
- `api/gcloud.ts` — GCloud-specific calls.
- `permissions.ts` — role-based access control helpers.

### UI Components (`src/app/components/ui/`)

52 shadcn/Radix-based components (Button, Dialog, Form, Sidebar, etc.). Prefer these over adding new UI libraries.

### Map Feature

The interactive environment map (`src/features/map/`) is built on React Flow 11. Nodes represent services/DBs/queues; edges represent relationships. `SystemNode.tsx` is the custom node component. `AddNodeModal`, `AddConnectionModal`, `AddCategoryModal` drive entity/relationship creation.

### Styling

Tailwind CSS 4 via `@tailwindcss/vite` plugin. CSS variables for theming in `src/styles/theme.css`. Dark mode via `next-themes` (default dark, key: `"nervum-theme"`).

### i18n

`i18next` + `react-i18next`. Locale JSON files live in `src/locales/`.
