% Testing Strategy

Last updated: 15 November 2025

## Test Pyramid
```
End-to-end (Playwright/Cypress)
    ▲
Integration (React Testing Library + MSW)
    ▲
Unit (Jest/Vitest)
```

Focus on fast unit coverage for utilities and components, integration tests for flows, and targeted end-to-end scenarios covering auth and exports.

## Unit Testing
- Framework: Vitest/Jest (configure in `package.json`).
- Targets:
  - Zustand stores (state transitions, selectors).
  - Utility functions (`src/lib/utils.ts`, `src/utils/security.ts`).
  - Pure UI components (conditional rendering, formatting).
- Guidelines:
  - Mock network calls; avoid hitting real APIs.
  - Keep tests colocated within `__tests__` or `*.test.tsx`.

## Integration Testing
- Framework: React Testing Library + MSW.
- Scenarios:
  - AuthGuard redirect logic (auth vs unauthenticated).
  - Page-level data loading with mocked API responses.
  - Table filtering and export button enable/disable.
- Ensure tests cover multiple roles to validate RBAC behavior.

## End-to-End Testing
- Tooling: Playwright or Cypress (decide and standardize).
- Critical paths:
  - Login and logout.
  - Overview metrics rendering.
  - Export flow on Audit Logs (with download assertion).
  - Queue retry action and confirmation.
- Run nightly against staging; gate releases with smoke subset.

## Performance & Accessibility
- Use Lighthouse/axe during CI to track accessibility regressions.
- Record bundle size via `vite --analyze` or similar tooling.

## Test Data Management
- Seed predictable fixtures in staging for deterministic tests.
- Use role-specific accounts (Admin, Operator, Viewer).
- Clear exports or generated data after tests conclude.

## CI Integration
- Add scripts: `npm run test`, `npm run test:e2e`.
- Collect coverage reports; enforce thresholds for core modules.
- Publish e2e videos/screenshots for failed runs.

## Manual Regression Checklist
- Verify login/logout for each role.
- Confirm environment switcher updates metrics.
- Trigger and download sample export.
- Navigate primary pages (`/overview`, `/users`, `/queue`, `/logs`) without console errors.

## Future Enhancements
- Adopt component story tests with Storybook interaction testing.
- Add contract tests against backend OpenAPI definitions.
- Integrate mutation testing (Stryker) for critical security logic.


