% API Integration Guide

Last updated: 2025-11-08

## Purpose
This guide documents how the frontend communicates with the Salesforce Middleware APIs. Use it when adding new endpoints, debugging requests, or aligning with backend teams.

## Service Module Conventions
- All API modules live in `src/services`.
- Each module exports functions that return typed promises (TypeScript interfaces from `src/types`).
- Requests are environment-aware, using the active environment from `dashboard-store`.
- Authentication headers are injected by the shared request helper (Bearer JWT).
- Errors are normalized to friendly messages before surfacing to the UI.

## Standard Request Lifecycle
1. Page or hook calls a service method.
2. Service composes the URL (`${baseUrl}/${resource}`) and attaches query/body data.
3. `fetchWithAuth` (or equivalent helper) adds headers, handles timeouts, and refreshes tokens if required.
4. Response is parsed and validated against expected types.
5. Caller handles success (state updates) or failure (toasts, inline errors).

## Service Catalogue

| Module | Responsibility | Key Functions |
| --- | --- | --- |
| `auth-api.ts` | Login, logout, refresh, fetch profile | `login`, `refreshToken`, `getProfile`, `logout` |
| `user-api.ts` | User CRUD, role updates, API keys | `listUsers`, `getUser`, `updateUser`, `listRoles`, `generateApiKey` |
| `api-key-api.ts` | API key lifecycle management | `listApiKeys`, `createApiKey`, `revokeApiKey` |
| `audit-api.ts` | Audit log retrieval/export | `getAuditLogs`, `exportAuditLogs` |
| `logs-api.ts` | Live log stream retrieval | `getLiveLogs`, `exportLogs` |
| `queue-api.ts` | Queue metrics and actions | `getQueues`, `retryJob`, `exportQueueData` |
| `cron-jobs-api.ts` | Cron job status, exports | `getCronJobs`, `exportCronJobs` |
| `reports-api.ts` | Scheduled reports configuration | `listReports`, `createReport`, `exportReport` |
| `monitoring-api.ts` | System monitoring metrics | `getMetrics`, `getHealthChecks` |
| `endpoints-api.ts` | Endpoint catalog and status | `listEndpoints`, `updateEndpoint` |
| `errors-api.ts` | Error catalog, details | `listErrors`, `getErrorDetails`, `exportErrors` |
| `analytics-api.ts` | Usage analytics data | `getUsageSummary`, `exportUsage` |
| `export-api.ts` | Centralized export orchestration | `exportAllData`, helpers for CSV/JSON/XLSX |
| `settings-api.ts` | Global app settings | `getSettings`, `updateSetting` |

> Note: Cross-check function availability with backend—some stubs may still be under development.

## Payload Guidelines
- **Dates**: Send/receive ISO 8601 strings. Use utilities in `src/lib/utils.ts` for parsing/formatting.
- **Pagination**: Expect `{ page, pageSize, total }`. Service functions should expose pagination-friendly type definitions.
- **Filtering**: Service methods accept filter objects matching backend query params. Keep filter typings in `src/types`.
- **Exports**: Accept `format`, `filters`, `fields`, `includeMetadata`. Responses return a Blob; use helpers to trigger downloads.

## Error Handling
- Translate backend error codes to friendly messages using the mapping in `src/utils/security.ts` (and related helper utilities).
- Authentication failures (401) should trigger `auth-store.logout()` and redirect to `/login`.
- Rate limit responses (429) should surface guidance and optionally backoff retries.

## Adding a New Service
1. Create `src/services/<feature>-api.ts`.
2. Implement helper functions using the shared request wrapper.
3. Add corresponding TypeScript interfaces/types.
4. (Optional) Add React Query hooks in `src/hooks` or feature-specific directories.
5. Document the module and key functions in the table above.

## Testing Integrations
- Mock service responses in Storybook (if used) or add MSW handlers for unit tests.
- Use the testing strategy guide (`docs/TESTING_STRATEGY.md`) for end-to-end validation steps.

## Collaboration Tips
- Keep the function signatures aligned with backend OpenAPI specs.
- Update this guide whenever an endpoint is added, renamed, or deprecated.
- Include request/response samples in feature-specific docs for deeper context.


