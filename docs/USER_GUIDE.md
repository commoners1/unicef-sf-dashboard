% Admin User Guide

Last updated: 15 November 2025

## Audience
Operational users administering Salesforce Middleware via the SF Dashboard. Assumes valid credentials and assigned role (Admin, Operator, Viewer).

## Getting Started
1. Navigate to the dashboard URL for your environment.
2. Sign in with your email/password on `/login`.
3. Choose the appropriate environment from the header selector.
4. Review system status on the Overview page before taking action.

## Role-Based Access Matrix

| Feature | Admin | Operator | Viewer |
| --- | --- | --- | --- |
| Overview dashboard | ✔ | ✔ | ✔ |
| Live logs | ✔ | ✔ | ✔ |
| Queue management | ✔ | ✔ | View-only |
| Cron jobs | ✔ | ✔ | View-only |
| User management | ✔ | View-only | ✖ |
| API keys | ✔ | View-only | ✖ |
| Reports & exports | ✔ | ✔ | View-only |
| Settings | ✔ | ✖ | ✖ |

> UI automatically hides actions you cannot perform. Unauthorized route access redirects to `unauthorized`.

## Core Workflows

**Monitor system health (`/overview`)**
- Check status cards (latency, queue depth, error rates).
- Drill into metrics via tabs for detailed charts.

**Investigate logs (`/logs`)**
- Filter by level, service, keyword.
- Export filtered logs for escalation (CSV/JSON).

**Manage queues (`/queue`)**
- View job counts (waiting, active, failed).
- Retry failed jobs (Admin/Operator).
- Export queue snapshot for reporting.

**Handle cron jobs (`/cron-jobs`)**
- Check delivery status and next run time.
- Export undelivered jobs for analysis.

**Administer users (`/users`)**
- Create/disable users, adjust roles (Admin).
- Generate API keys, revoke compromised keys.

## Export Best Practices
- Apply filters before exporting to narrow results.
- Include metadata when sharing outside the team for audit traceability.
- Follow security guidelines for handling exported files (store securely, delete when no longer needed).

## Troubleshooting Tips
- If data seems stale, confirm you've selected the intended environment.
- Use the timestamp on cards/tables to confirm last refresh.
- Persistent errors? Grab console logs (DevTools) and contact engineering.

## Support & Escalation
- **Tier 1**: Internal operations team Slack channel.
- **Tier 2**: Middleware backend team (open ticket).
- **Security Concerns**: Notify security operations immediately; capture export logs if involved.

## Release Notes
- Major changes are tracked in `docs/CHANGELOG.md`. Review before onboarding users to new functionality.


