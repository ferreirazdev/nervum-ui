# Nervum UI

Frontend for **Nervum** — software environment maps. Interactive UI for viewing and exploring environments, entities, and relationships, with an interactive map inspired by the [Unified Engineering System Map](https://www.figma.com/design/CYsNAjffvPbRcgN1cCDhMk/Unified-Engineering-System-Map).

The UI is designed to work with the [nervum-go](https://github.com/nervum/nervum-go) API for organizations, environments, entities, and relationships.

## Tech stack

- **Runtime**: React 18, TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS 4
- **UI**: Radix UI, shadcn-style components, MUI icons, Lucide
- **Routing**: React Router 7
- **Forms**: React Hook Form
- **Map**: React Flow (node/edge graph for environment maps)

## Project structure

```text
src/
  app/                    # App shell, layout, shared UI
    components/           # Reusable components (CommandBar, Controls, AddNodeModal, ui/)
    layouts/              # AppLayout (header, nav, outlet)
  features/
    auth/                 # Login, Register
    environments/         # Environments list and cards
    map/                  # Interactive environment map (React Flow)
  styles/                 # Global CSS, theme
```

## Running the app

1. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Start the dev server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The app is served at the URL shown in the terminal (e.g. `http://localhost:5173`).

3. **Build for production**

   ```bash
   npm run build
   ```

   Output is in `dist/`.

## Main routes

- **`/`** — Redirects to `/environments`
- **`/environments`** — List of environments (prod, staging, dev); click a card to open its map
- **`/environments/:envId`** — Interactive map for that environment (nodes, edges, filters, add node)
- **`/login`** — Login page
- **`/register`** — Registration page

## Related

- **API**: [nervum-go](https://github.com/nervum/nervum-go) — Go API for organizations, users, environments, entities, and relationships (GORM + Postgres).
