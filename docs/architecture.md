# Frontend architecture

This document summarizes the Nervum UI layout, entry points, routing, feature modules, and API layer. For setup and deployment, see the root [README.md](../README.md).

## Entry points

- **HTML**: `index.html` mounts `#root` and loads `/src/main.tsx`.
- **JS**: `src/main.tsx` creates the React root, renders `<App />`, and imports global styles.
- **App root**: `src/app/App.tsx` wraps the app in `ThemeProvider` (next-themes, dark default, key `nervum-theme`), `AuthProvider`, and `ChatProvider`, and provides the router via `createBrowserRouter`. All routes share a single layout whose element is `<AppLayout />`.

## Routing

Routes are defined in `App.tsx`. Route guards:

- **ProtectedRoute** — redirects to `/login` if the user is not authenticated.
- **RequireOnboardingCompleted** — redirects to `/onboarding` or `/member-onboarding` when the user has not completed onboarding.
- **RequireOrgAccess** — redirects to `/dashboard` for users without organization-level access (e.g. members who cannot view organization settings).

Layout choice is made in `src/app/layouts/AppLayout.tsx` by path:

- **MapLayout** — used for `/environments/:envId` (single environment map view).
- **DashboardLayout** — used for dashboard-style routes: `/dashboard`, `/organization`, `/profile`, `/teams`, `/users`, `/integrations`, `/repositories`, `/gcloud/*`, `/environments` (list).
- **No chrome** — only `<Outlet />` for `/`, `/login`, `/register`, `/accept-invite`, `/onboarding`, `/member-onboarding`.

`GlobalChat` and `Toaster` are rendered whenever the layout is not “no chrome”.

## Feature modules

Features live under `src/features/`. Each typically has an `index.ts` and may have `pages/`, `components/`, or other subdirs.

| Feature        | Path                    | Purpose |
|----------------|-------------------------|---------|
| auth           | `src/features/auth/`    | Login, Register, AuthProvider, useAuth |
| landing        | `src/features/landing/` | Landing page |
| onboarding     | `src/features/onboarding/` | OnboardingPage, MemberOnboardingPage |
| dashboard      | `src/features/dashboard/` | Dashboard page |
| environments   | `src/features/environments/` | Environments list and cards |
| map            | `src/features/map/`     | Interactive environment map (React Flow) |
| organization   | `src/features/organization/` | Organization page |
| teams          | `src/features/teams/`   | Teams page |
| users          | `src/features/users/`   | Users page |
| profile        | `src/features/profile/` | Profile page |
| integrations   | `src/features/integrations/` | Integrations (GitHub / GCloud connect) |
| repositories   | `src/features/repositories/` | Repositories page |
| gcloud         | `src/features/gcloud/`  | GCP UI: services, cloud-sql, compute |
| invitations    | `src/features/invitations/` | Accept invite page |
| chat           | `src/features/chat/`    | GlobalChat, ChatPanel, ChatProvider |

## API layer

- **`src/lib/api.ts`** — Central API client: `apiFetch<T>(path, init)` calling `/api/v1${path}` with credentials and JSON. Types and functions for auth, organizations, environments, entities, relationships, teams, invitations, integrations, stored repos, and dashboard (GitHub/GCloud). Re-exports `src/lib/api/gcloud.ts`.
- **`src/lib/api/gcloud.ts`** — GCloud-only types and calls: stored services (Cloud Run, Cloud SQL, Compute), Cloud Run v2 proxy, Cloud SQL Admin proxy, Compute proxy; uses `apiFetch` from `../api`.
- **`src/lib/integrations.ts`** — `getApiBase()` (reads `VITE_API_BASE_URL`), `getIntegrationConnectUrl()` for GitHub/GCloud OAuth connect URLs.

## App shell

- **Layouts**: `AppLayout`, `DashboardLayout`, `MapLayout` in `src/app/layouts/`.
- **Shared UI**: Sidebar (AppSidebar, ui/sidebar), CommandBar, Controls, modals (AddNodeModal, AddConnectionModal, AddCategoryModal), AddNodeForm, SystemNode, and primitives under `src/app/components/ui/` (button, card, dialog, form, input, tabs, chart, etc.).
- **Config**: `src/app/config/` (e.g. roadmap).
- **Styles**: `src/styles/` (index.css, theme, tailwind). Shared helpers: `src/lib/permissions.ts`, `src/lib/onboarding.ts`.

For adding a new feature or route, see the root README and the nervum-go [OpenAPI spec](https://github.com/nervum/nervum-go/blob/main/openapi/openapi.yaml) for the backend API.
