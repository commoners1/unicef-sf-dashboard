% Changelog & Release Notes

Last updated: 5 December 2025

Maintain this document to summarize user-facing changes per release. Follow keep-a-changelog style and semantic versioning.

## Unreleased
- Initial documentation overhaul:
  - Added architecture, API integration, environment runbook, user guide, monitoring, testing strategy.
  - Expanded security roadmap and threat model.

## 1.3.1 (2025-12-05)

### 🔒 Security Fixes (CRITICAL)

#### React2Shell Vulnerability Patch (CVE-2025-55182)
- **Upgraded React and React DOM**: Updated from version 19.2.0 to 19.2.1
- **Vulnerability**: Fixed maximum-severity remote code execution vulnerability (React2Shell)
- **CVSS Score**: 10.0 (Critical)
- **Impact**: Patches critical vulnerability affecting React Server Function endpoints that could allow unauthenticated remote code execution
- **Affected Packages**: 
  - `react`: 19.2.0 → 19.2.1
  - `react-dom`: 19.2.0 → 19.2.1
- **Reference**: [React2Shell Vulnerability Disclosure](https://www.infosecurity-magazine.com/news/reactjs-hit-by-react2shell/)

#### Technical Changes
- Updated React dependency from `^19.2.0` to `^19.2.1`
- Updated React DOM dependency from `^19.2.0` to `^19.2.1`
- No breaking changes or API modifications required

#### Security Impact
- **Before**: Vulnerable to CVE-2025-55182 (React2Shell) - Remote code execution risk
- **After**: Protected against React2Shell vulnerability
- **Risk Reduction**: Eliminated critical remote code execution attack vector

#### Action Required
- ✅ **Completed**: Dependencies upgraded to secure versions
- All deployments should use React 19.2.1 or later

## 1.3.0 (2025-11-18)

### 🔒 Security Enhancements (CRITICAL)

#### localStorage Security Improvements
- **Removed sensitive data from localStorage**: Email addresses and user roles (especially SUPER_ADMIN) are no longer stored in localStorage
- **Implemented AES-GCM encryption**: All stored data is now encrypted using Web Crypto API with AES-GCM (256-bit) encryption
- **Data minimization**: Only stores minimal non-sensitive data (user ID and name) needed for UI display
- **Complete cleanup on logout**: All authentication data, cookies, and sessionStorage are securely cleared on logout
- **Automatic storage migration**: Legacy unencrypted data is automatically migrated to encrypted format on app startup
- **Session timeout protection**: Automatic cleanup of sensitive data after 30 minutes of inactivity

#### Technical Changes
- Upgraded `SecureStorage` class to use Web Crypto API for proper encryption
- Updated auth store to exclude sensitive fields from persistence
- Added `clearAllStorage()` method for complete cleanup
- Created storage migration utility for seamless upgrade
- Added session timeout monitoring with automatic cleanup

#### Security Impact
- **Before**: Email, role (SUPER_ADMIN), and user data stored in plain text
- **After**: Only minimal encrypted data stored, sensitive information fetched from API
- **Risk Reduction**: Significantly reduced attack surface for XSS and data theft

### 🐛 Bug Fixes
- Fixed error tracking dashboard showing incorrect counts (8 total errors but only 1 row displayed)
- Fixed error tracking to show all individual error entries instead of grouped entries
- Improved mobile responsiveness for error details modal

### 🔐 Access Control
- Restricted Error Tracking menu and routes to SUPER_ADMIN users only
- Added role-based route protection for error tracking endpoints

### 📱 Mobile Improvements
- Enhanced error details modal for better mobile display
- Improved field layout and scrolling on mobile devices
- Fixed information visibility issues on mobile screens

### 🔄 Breaking Changes
- `AuthApiService.getStoredUser()` is now async (returns Promise)
- `AuthApiService.isAuthenticated()` is now async (returns Promise)
- `AuthApiService.storeUser()` is now async (returns Promise)
- Auth store persistence now excludes email and role fields

### 📝 Migration Notes
- Existing localStorage data will be automatically migrated on next app load
- Users may need to re-authenticate if session expired
- Legacy unencrypted data is automatically cleaned up

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

