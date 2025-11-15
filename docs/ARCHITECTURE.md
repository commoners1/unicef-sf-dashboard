% SF Dashboard Architecture

Last updated: 15 November 2025

## System Overview
The SF Dashboard is a React + Vite single-page application that provides operational visibility and controls for the Salesforce Middleware platform. The UI communicates exclusively with the middleware REST APIs (and optional WebSocket endpoints) to surface system metrics, manage users, and trigger exports. No server-side rendering is used; hosting can be fully static.

```
User Browser
   │
   ▼
SF Dashboard (React SPA)
   │   REST / WebSocket
   ▼
Salesforce Middleware API Gateway
   │
   ▼
Downstream Services (Salesforce, queues, logging, jobs)
```

## Key Application Layers
- **Routing & Shell (`src/App.tsx`, `src/main.tsx`)**  
  Sets up React Router routes and mounts the authenticated shell (`MainLayout`) around protected pages.

- **Auth Guarding (`src/components/auth/`)**  
  `AuthGuard` and `RequireRole` wrap routes to enforce login and RBAC checks using `auth-store`. Guards control redirects and fallbacks (spinner, unauthorized page).

- **Pages (`src/pages/`)**  
  Feature-oriented containers that load data through service modules, apply view-specific state, and compose reusable UI components.

- **Services (`src/services/`)**  
  Typed API clients built on a shared `fetch` wrapper. They encapsulate endpoints, map payloads to TypeScript models, and implement error translation.

- **Stores (`src/stores/`)**  
  Zustand stores (`auth-store`, `dashboard-store`) maintain client-side session data and cross-page state (metrics cache, environment).

- **Hooks (`src/hooks/`)**  
  `usePageTitle`, `usePermissions`, and future hooks centralize cross-cutting logic. Hooks consume stores/services and isolate reusable behaviors.

- **UI Components (`src/components/`)**  
  Based on shadcn/ui primitives, organized by domain (`dashboard`, `tables`, `layout`). These components take typed props and avoid direct API calls to maintain separation.

## Data Flow
1. User navigates to a protected route.  
2. `AuthGuard` verifies auth state via `auth-store`; if absent, redirect to `/login`.  
3. Page component loads using React Query / service call, passing the active environment from `dashboard-store`.  
4. Responses are normalized into view models and rendered via UI components.  
5. User actions (filters, exports) call service functions; optimistic updates go through Zustand stores, while background mutations use React Query where appropriate.

## Environment Awareness
`src/config/environments.ts` defines available environments with API/WS URLs. The `EnvironmentSelector` component and `dashboard-store` coordinate the active selection, influencing outbound service calls.

## Extensibility Guidelines
- Keep API interaction inside service modules; never call `fetch` directly from pages.  
- Add new feature routes under `src/pages` and register via router configuration in `App.tsx`.  
- Introduce cross-feature state in dedicated Zustand stores to avoid prop drilling.  
- For complex feature sets, create domain-specific subfolders (e.g., `src/features/exports/`) housing pages, hooks, and components.

## External Integrations
- **Authentication**: JWT Bearer tokens managed via backend endpoints (`auth-api`). Tokens are stored securely, refreshed proactively, and injected via request interceptors.  
- **Real-time Updates**: WebSocket endpoints (configurable) support real-time logs/metrics. Socket scaffolding is present; enable by wiring to handlers within feature pages.  
- **Export Engine**: `export-api` coordinates CSV/JSON/XLSX generation; responses trigger browser downloads handled by utility helpers.

## Future Enhancements
- Introduce a shared `api-client` layer to consolidate retries, telemetry, and error reporting.  
- Add type-safe React Query hooks per feature to standardize caching.  
- Configure feature flags (e.g., LaunchDarkly) for incremental roll-outs.


