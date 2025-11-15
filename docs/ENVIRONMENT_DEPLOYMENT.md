% Environment & Deployment Runbook

Last updated: 15 November 2025

## Environment Model

| Environment | Description | Base URL | Notes |
| --- | --- | --- | --- |
| Development | Local developer machines | `http://localhost:3000` | Uses `.env.local`; no auth restrictions. |
| Staging | Pre-production validation | `https://staging.api.example.com` | Mirrors production data shape; limited to staging accounts. |
| Production | Live tenant | `https://api.example.com` | Requires elevated permissions and change control. |

> Configure additional environments in `src/config/environments.ts`. Each entry needs `name`, `apiUrl`, `wsUrl`, and optional `displayName`.

## Environment Variables
Create `.env.local` for local dev. Example:

```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_TITLE=SF Middleware Dashboard
VITE_APP_VERSION=1.1.0
VITE_SENTRY_DSN=
```

- Do not commit `.env.local`.
- Use `.env.staging` / `.env.production` for build pipelines.
- Document new variables in this file and README.

## Deployment Paths

### Static Hosting
1. `npm install`
2. `npm run build`
3. Upload `dist/` to hosting (S3, Netlify, Azure Static Web Apps, etc.).
4. Ensure rewrites route all paths to `index.html` (for client-side routing).

### Docker Image
```
docker build -t sf-dashboard .
docker run -p 3001:3001 sf-dashboard
```
- Use multi-stage Dockerfile (build + nginx) to keep image small.
- Inject environment variables at runtime via `env.js` or server config.

### CI/CD Checklist
- Lint & type check (`npm run lint`, `npm run typecheck` if configured).
- Build test (`npm run build`).
- Bundle analysis (optional).
- Deploy to staging; run smoke suite.
- Promote to production after approval.

## Operational Runbook

**Smoke Tests (post-deploy):**
- Visit `/overview`; confirm metrics load without console errors.
- Login/logout flow works.
- Environment selector switches between at least two environments.
- Execute sample export from `/audit`.

**Rollback Strategy:**
- Static hosting: revert to previous build artifact; ensure caches invalidated.
- Docker: redeploy previous tagged image.
- Document cause and remediation steps in incident log.

**Monitoring Signals:**
- Frontend availability (uptime monitor).
- API latency/error rate (APM dashboards).
- Export job success metrics.
- WebSocket connection failure rates (if enabled).

## Change Management
- Schedule production releases during maintenance windows.
- Announce user-visible changes in `docs/CHANGELOG.md`.
- Update documentation alongside code changes; require PR checklist confirmation.


