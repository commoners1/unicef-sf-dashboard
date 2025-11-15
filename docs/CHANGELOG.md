% Changelog & Release Notes

Last updated: 15 November 2025

Maintain this document to summarize user-facing changes per release. Follow keep-a-changelog style and semantic versioning.

## Unreleased
- Initial documentation overhaul:
  - Added architecture, API integration, environment runbook, user guide, monitoring, testing strategy.
  - Expanded security roadmap and threat model.

## 1.2.0 (2025-11-15)
- Added support for new Salesforce cron job endpoints:
  - Display pledge cron job data in endpoints page
  - Display one-off cron job data in endpoints page
  - Integration with backend API endpoints for retrieving undelivered cron job items

## 1.1.0 (2025-01-XX)
- Enhanced security features:
  - Comprehensive input validation and sanitization
  - CSRF protection for all state-changing operations
  - Client-side rate limiting
  - Security event logging
  - Enhanced error handling
- Improved code quality:
  - Reusable hooks (useAsyncData, useAutoRefresh, usePagination)
  - Utility functions for error handling and file downloads
  - Cleaner router implementation
  - Better code organization

## 1.0.0 (YYYY-MM-DD)
- Initial public release of SF Dashboard.
- Core features: overview, users, queues, logs, exports, environment switching.

---

### Release Process
1. Update version in `package.json` and relevant env files.
2. Document changes under a new version heading with date.
3. Tag release in git (`git tag vX.Y.Z`).
4. Publish release notes and notify stakeholders.

