% Monitoring & Troubleshooting

Last updated: 2025-11-08

## Key Signals

| Signal | Source | Threshold | Action |
| --- | --- | --- | --- |
| Dashboard availability | Uptime monitor / status page | < 99.9% monthly | Investigate CDN/hosting; escalate to SRE. |
| API error rate | Middleware APM | > 2% for 5 min | Check recent deployments, review logs, alert backend. |
| Queue backlog | Queue metrics | > 500 waiting for 15 min | Investigate worker health; consider scaling or pausing incoming jobs. |
| Export failures | Export service logs | > 5 failures/hour | Validate credentials, storage quotas, and rate limits. |
| Auth failures | Security logs | Spike above baseline | Possible credential stuffing; trigger security playbook. |

## Routine Monitoring
- Review Overview dashboard at least twice per shift.
- Track queue trends and alert thresholds via scheduled reports.
- Verify WebSocket connections for live features after deploys.
- Rotate API keys and monitor for unused credentials quarterly.

## Troubleshooting Playbooks

### Users Cannot Log In
1. Confirm middleware auth service is reachable (`/api/auth/login`).
2. Check auth service status dashboards for incidents.
3. Review rate limiting logs; reset lockouts if applicable.
4. Escalate to security if multiple suspicious attempts detected.

### Metrics Not Updating
1. Confirm environment selection (header > Environment Selector).
2. Check browser console for network errors; capture screenshots.
3. Call `monitoring-api.getMetrics` via dev tools to verify backend response.
4. If backend returns stale data, notify middleware team.

### Export Job Stuck
1. Verify export request parameters (format, filters).
2. Review export service log stream for errors.
3. Check storage destination quotas (S3, blob storage).
4. Retry with smaller dataset; if persistent, open incident ticket.

### Queue Backlog
1. Inspect `/queue` page for per-queue status.
2. Validate worker health metrics (CPU, memory).
3. Retry failed jobs if safe; otherwise pause intake.
4. Engage backend to scale workers or investigate root cause.

## Incident Response
- Create incident channel (e.g., `#incident-sf-dashboard`).
- Log timeline, affected features, and remediation steps.
- Update `docs/CHANGELOG.md` with post-incident summary if user-facing.
- Schedule postmortem within 48 hours for high-severity incidents.

## Tooling
- **Logging**: Centralized log aggregation (e.g., Datadog, ELK). Use structured fields for filtering.
- **Alerting**: Pager duty/On-call rotation. Alerts should include direct links to relevant dashboard views.
- **Dashboards**: Maintain Grafana/Datadog dashboards for queue health, API latency, authentication.

## Maintenance Windows
- Announce maintenance 24 hours ahead via support channels.
- Temporarily disable exports (feature flag) if operation may cause inconsistencies.
- After maintenance, run smoke tests and confirm monitoring baselines return to normal.


