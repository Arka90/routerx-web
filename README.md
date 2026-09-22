# RouteRX — web

The dashboard for [RouteRX](https://github.com/Arka90/routerx-api): uptime monitoring that names the layer that failed (DNS, TCP, TLS, HTTP or a body assertion), confirms it from more than one region, routes alerts to Slack, Discord, email or a signed webhook, and publishes public status pages.

Live: <https://routerx.heyarka.cloud/> · API and workers: [routerx-api](https://github.com/Arka90/routerx-api)

## Stack

- React 19 + Vite 7, TypeScript
- TanStack Router (file-based routes in `src/routes`) and TanStack Query
- Tailwind CSS v4 with a token-based design system (`src/styles/tokens.css`)
- radix-ui primitives, lucide icons, recharts, sonner

## Running it

```bash
cp .env.example .env      # point VITE_API_BASE_URL at your API
npm install
npm run dev
```

`npm run build` type-checks and produces `dist/`. `npm run lint` runs ESLint.

## Design system

Every colour the UI uses is a semantic token defined once per theme in `src/styles/tokens.css` and exposed to Tailwind in `src/index.css`. Components use `bg-card`, `text-muted-foreground`, `text-up`, `bg-down-soft` and so on — never a raw palette class or `dark:` variant — so light and dark stay in step and a palette change is a one-file edit.

Shared primitives live in `src/components/ui`: button, input, select, textarea, checkbox, switch, field, badge, card, dialog, confirm dialog, dropdown menu, tabs, segmented control, stat card, status dot/badge, empty state, skeleton, page header, theme toggle, tooltip, logo.

The landing page (`src/features/landing`) lists every shipped feature and renders product "snapshots" with the same components the app uses, so they never drift from the real UI.

## Feature flags

| Flag | Default | Effect |
| --- | --- | --- |
| `VITE_ENABLE_BILLING` | `false` | Shows the Plan & usage page and upgrade buttons. Billing code is present but switched off. |

## Layout

```
src/
  api/            axios clients and per-domain services
  components/     ui primitives and the app shell (sidebar, mobile drawer)
  features/       page-level components grouped by domain
  hooks/          TanStack Query hooks
  lib/            formatting, status presentation, feature flags
  routes/         file-based routes (generated tree in routeTree.gen.ts)
  stores/         zustand auth store
  styles/         design tokens
  types/          API types
```
