# Nervum – Environment Maps UI (SaaS frontend)

![Nervum logo](./logo.png)

**Nervum** is a SaaS for visualizing and managing your software environments as a living map – services, databases, queues, and the relationships between them. This repository contains the **React frontend** (`nervum-ui`) that your users interact with in the browser.

It talks to the Go API in [`nervum-go`](https://github.com/nervum/nervum-go) and provides:

- **Interactive maps** of prod/staging/dev environments
- **Entity and relationship management** via a visual graph
- **Auth flows** for logging into your Nervum workspace

---

## Product overview (what users see)

From a user’s perspective, Nervum looks like:

- **Environment dashboard**: a list of environments (prod, staging, dev, etc.) for each organization.
- **Map view**: an interactive canvas where each node is an entity (service, DB, queue, 3rd‑party system) and edges are relationships between them, inspired by the [Unified Engineering System Map](https://www.figma.com/design/CYsNAjffvPbRcgN1cCDhMk/Unified-Engineering-System-Map).
- **Auth & multi-org**: log in, switch organizations (workspaces), and see only the environments you have access to.

As a SaaS:

- This repo is what you deploy as your **public web app** at e.g. `https://app.your-nervum-domain.com`.
- `nervum-go` is the **backend API** that this app talks to.

---

## Tech stack

- **Runtime**: React 18, TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS 4
- **UI**: Radix UI, shadcn-style components, MUI icons, Lucide
- **Routing**: React Router 7
- **Forms**: React Hook Form
- **Map**: React Flow (node/edge graph for environment maps)

---

## Project structure

```text
src/
  app/                    # App shell, layout, shared UI
    components/           # Reusable components (CommandBar, Controls, AddNodeModal, ui/)
    layouts/              # AppLayout (header, nav, outlet)
  features/
    auth/                 # Login, Register, auth flows
    environments/         # Environments list and cards
    map/                  # Interactive environment map (React Flow)
  styles/                 # Global CSS, theme
```

---

## Running the app locally (SaaS-style)

1. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Configure the API base URL**

   In a typical setup you will have an environment variable such as:

   ```bash
   # example, adjust name and value to match your setup
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```

   Check the codebase or `.env.example` (if present) for the exact variable name used.

3. **Start the dev server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The app is served at the URL shown in the terminal (e.g. `http://localhost:5173`).

4. **Build for production**

   ```bash
   npm run build
   ```

   Output is in `dist/` and can be deployed to any static hosting or CDN (Netlify, Vercel, S3+CloudFront, etc.), typically behind your SaaS domain.

---

## Main routes

- **`/`** — Redirects to `/environments`
- **`/environments`** — List of environments (prod, staging, dev); click a card to open its map
- **`/environments/:envId`** — Interactive map for that environment (nodes, edges, filters, add node)
- **`/login`** — Login page
- **`/register`** — Registration page

---

## Deploying as a SaaS frontend

You can deploy `nervum-ui` anywhere that serves static assets:

- **Fully managed**: Vercel, Netlify, Render static hosting
- **Cloud storage + CDN**: S3 + CloudFront, GCS + Cloud CDN, etc.

Set your environment variable (e.g. `VITE_API_BASE_URL`) to the **public URL** of your hosted `nervum-go` API so the app can talk to the backend.

For a typical SaaS setup:

- `https://app.your-nervum-domain.com` → serves this frontend.
- `https://api.your-nervum-domain.com` → proxies to `nervum-go`.

---

## Related

- **API backend**: [`nervum-go`](https://github.com/nervum/nervum-go) — Go API for organizations, users, environments, entities, and relationships (GORM + Postgres).
