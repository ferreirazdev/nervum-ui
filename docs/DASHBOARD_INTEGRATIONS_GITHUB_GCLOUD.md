# Dashboard integrations: GitHub & GCloud

This document describes how to replace the **mocked** GitHub and GCloud sections on the Dashboard with real data. The UI already exists in `DashboardPage.tsx` (sections "Last logs GitHub" and "GCloud" with tabs); the following steps allow you to plug in live APIs.

---

## Overview

- **Current state:** The dashboard shows mock data for GitHub (commits, PRs, merges) and GCloud (builds, deploys, logs, services health).
- **Goal:** Connect to GitHub and Google Cloud APIs via your backend (nervum-go), and have the frontend (nervum-ui) call that backend instead of using mocks.
- **Security:** GitHub tokens and GCP credentials must **never** be exposed to the browser. All API calls must go through nervum-go.

---

## 1. GitHub integration

### APIs

- **REST API:** Use for commits, pull requests, and (via PRs) merge information.
  - Base URL: `https://api.github.com`
- **GraphQL API (optional):** Use if you need **GitHub Projects** (e.g. Project boards). Endpoint: `https://api.github.com/graphql`.

### Authentication

Choose one and store the secret on the backend only (e.g. env or secret manager):

- **Personal Access Token (PAT):** Simple for a single org/repo. Create at GitHub → Settings → Developer settings → Personal access tokens. Scopes: `repo` (for private repos), `read:org` if you need org-level data.
- **OAuth App:** If you need per-user GitHub login. Store client ID/secret on backend; use OAuth flow to get user tokens and optionally store them per user/org.
- **GitHub App:** Best for org-wide integration: install once, use app installation token. Permissions: Contents (read), Pull requests (read), Metadata (read). Store private key and app ID on backend; generate installation access token when needed.

### Endpoints to use

| Dashboard tab | Endpoint / approach |
|---------------|---------------------|
| **Commits**   | `GET /repos/{owner}/{repo}/commits` — query params: `per_page`, `page`. Map to: hash (`sha` substring), message (`commit.message`), author (`commit.author.name` or `author.login`), repo, `commit.author.date`. |
| **PRs**       | `GET /repos/{owner}/{repo}/pulls` — params: `state` (all/open/closed), `sort=updated`, `per_page`. Map to: number, title, state (open/closed), merged (boolean from `merged_at`), author (`user.login`), `created_at`. |
| **Merges**    | Use the same pulls endpoint with `state=closed` and filter items where `merged_at` is set. Map to: title, source branch (`head.ref`), target branch (`base.ref`), author, `merged_at`. |
| **Projects**  | If you add a Projects tab later: GraphQL `organization(login)->projectsV2(first)` or `repository(owner, name)->projectV2`. |

### Rate limits and best practices

- GitHub REST: 5,000 requests/hour (authenticated). Use conditional requests (`If-None-Match` / `If-Modified-Since`) to reduce usage.
- Cache responses on the backend (e.g. 1–5 minutes for commits/PRs) to avoid hitting rate limits with many dashboard loads.
- Optional: use **webhooks** (push, pull_request) to update your own cache or DB and serve from there for near real-time data.

---

## 2. GCloud integration

### Authentication

- Run nervum-go with a **service account** that has read-only access to the needed APIs. Options:
  - **Key file:** Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON key file (only on backend/server).
  - **ADC (Application Default Credentials):** On GCE/Cloud Run, the default service account is used automatically.
- **Never** expose the key file or credentials to the frontend.

### APIs and usage

| Dashboard tab       | GCloud product      | What to use |
|---------------------|---------------------|-------------|
| **Build**           | Cloud Build         | Cloud Build API: list builds (e.g. `projects.locations.builds.list` or `projects.builds.list`). Map: id, status (SUCCESS/FAILURE/WORKING), duration (from timestamps), trigger/source (e.g. trigger name or source), createTime. |
| **Deploy**          | Cloud Run / GKE / App Engine | Cloud Run: `projects.locations.services.revisions.list` and/or deployment history. Map: service name, revision/version, status (e.g. active/failed), region, timestamp. For GKE: use Kubernetes API or GKE API for deployments. |
| **Logs**            | Cloud Logging       | Logging API: `entries.list` with filter (e.g. by resource type, severity). Map: message (payload or textPayload), severity (INFO/WARNING/ERROR), resource labels (e.g. service name), timestamp. |
| **Services healthy**| Cloud Run + Monitoring | Cloud Run: list services and revisions; use readiness/health if available. Alternatively Cloud Monitoring (e.g. uptime checks or health metrics) to derive a healthy/degraded/unknown status per service. |

### IAM and scopes

- Grant the service account **minimal read-only roles**, for example:
  - Cloud Build Viewer (for build history)
  - Cloud Run Viewer (for services and revisions)
  - Logs Viewer (for log entries)
  - Monitoring Viewer (if using Monitoring for health)
- Use custom roles if you want to restrict to specific resources (e.g. one project or folder).

---

## 3. Backend (nervum-go)

### Config

Add environment variables (or config struct) for:

- `GITHUB_TOKEN` — PAT or installation token (or mechanism to generate it for GitHub App).
- `GITHUB_OWNER` / `GITHUB_REPO` — default repo for commits/PRs (or derive from org settings).
- `GCP_PROJECT_ID` — Google Cloud project for Build/Deploy/Logs.
- `GCP_SA_KEY_PATH` (optional) — path to service account JSON if not using ADC.

### Handlers and response shapes

- Add HTTP handlers (e.g. under `/api/dashboard/github/...` and `/api/dashboard/gcloud/...`) that:
  - Call GitHub REST (and optionally GraphQL) with the token.
  - Call GCloud client libraries (Cloud Build, Run, Logging, etc.) with the project ID and credentials.
- Return JSON that **matches (or is easily mappable to)** the mock types in nervum-ui so the frontend can switch with minimal changes:

  - GitHub: arrays of `{ id, hash, message, author, repo, created_at }`, `{ id, number, title, state, author, created_at }`, `{ id, title, sourceBranch, targetBranch, author, created_at }`.
  - GCloud: arrays of `{ id, buildId, status, durationSeconds?, trigger, created_at }`, `{ id, serviceName, revision, status, region, created_at }`, `{ id, message, severity, service, created_at }`, `{ id, name, status, detail? }`.

- Keep responses small (e.g. last 10–20 items per tab) and consider caching (in-memory or short TTL) to protect GitHub rate limits and reduce GCP API calls.

---

## 4. Frontend (nervum-ui)

### API client

- In `@/lib/api` (or a dedicated module like `dashboardApi`), add functions that call the new nervum-go endpoints, e.g.:
  - `getDashboardGitHubCommits()`, `getDashboardGitHubPRs()`, `getDashboardGitHubMerges()`
  - `getDashboardGCloudBuilds()`, `getDashboardGCloudDeploys()`, `getDashboardGCloudLogs()`, `getDashboardGCloudServicesHealth()`
- Use the same response types as (or compatible with) the mock types in `mockDashboard.ts` so components can consume either source.

### Dashboard page

- In `DashboardPage.tsx` (or a small hook), introduce a “data source” mode:
  - When **real API is enabled** and the user/org has the feature: fetch from the new API functions and use that data in the existing GitHub and GCloud tabs.
  - On loading/error or when the feature is disabled: keep using `MOCK_GITHUB_*` and `MOCK_GCLOUD_*` as fallback.
- Optionally use a feature flag or env (e.g. `VITE_DASHBOARD_INTEGRATIONS_ENABLED`) to toggle between mock and real data during rollout.

---

## 5. Environment variables checklist

Use these on the **backend** only:

| Variable             | Description                    |
|----------------------|--------------------------------|
| `GITHUB_TOKEN`       | PAT or GitHub App installation token |
| `GITHUB_OWNER`       | GitHub org or user name        |
| `GITHUB_REPO`        | Repository name                |
| `GCP_PROJECT_ID`     | Google Cloud project ID        |
| `GCP_SA_KEY_PATH`    | (Optional) Path to service account JSON key |

**Security reminder:** Do not expose `GITHUB_TOKEN` or GCP key material to the browser. All requests to GitHub and GCloud must be made from nervum-go.

---

## 6. Optional next steps

- **GitHub Projects:** Add a “Projects” tab and use GraphQL `ProjectV2` to list projects and optionally issues/items.
- **Webhooks:** Subscribe to GitHub and/or GCloud events to update a local cache or DB and serve dashboard data from there for lower latency and fewer API calls.
- **Filtering by org/repo:** If you have multiple repos, allow the dashboard to switch repo (e.g. dropdown) and pass `owner/repo` to the backend so handlers can query the right repo.
