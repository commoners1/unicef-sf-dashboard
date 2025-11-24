# Security Policy

**Last Updated:** November 24, 2025  
**Version:** 1.3.0

## Overview

The SF Dashboard is designed with security as a core principle. This document outlines the security measures, policies, and practices implemented to protect user data, system integrity, and prevent unauthorized access.

## 🔐 Authentication & Authorization

### Authentication Methods

- **JWT-based Authentication** - Secure token-based authentication
- **HttpOnly Cookies** - JWT tokens stored in httpOnly cookies (immune to XSS attacks)
- **Automatic Token Refresh** - Tokens refreshed before expiration
- **Session Management** - Secure session handling with timeout protection

### Authorization & Access Control

- **Role-Based Access Control (RBAC)** - Fine-grained permission system
- **User Roles:**
  - **SUPER_ADMIN** - Full system access including error tracking
  - **ADMIN** - Administrative access to users, permissions, and settings
  - **OPERATOR** - Operational access to queues, logs, and monitoring
  - **VIEWER** - Read-only access to monitoring and logs
- **Route Protection** - All protected routes require authentication
- **Permission-Based UI** - Interface adapts based on user permissions
- **API Endpoint Protection** - All API calls require proper authentication

### Authentication Flow

1. User authenticates via `/login` endpoint
2. Backend validates credentials and sets httpOnly cookie with JWT token
3. Browser automatically sends cookie with all requests
4. Backend validates cookie on each request
5. 401 responses automatically redirect to login
6. Logout clears all authentication data securely

## 🛡️ Data Protection

### Storage Security

- **AES-GCM Encryption** - All sensitive data encrypted using Web Crypto API (256-bit)
- **Data Minimization** - Only minimal non-sensitive data stored locally
- **Secure Storage** - Encrypted storage for user ID and name only
- **No Sensitive Data in Storage** - Email, roles, and tokens are NOT stored in localStorage
- **Automatic Migration** - Legacy unencrypted data automatically migrated on startup

### What's Protected

✅ **Encrypted & Stored:**
- User ID (minimal, for UI state)
- User name (for display only)

✅ **NOT Stored** (Fetched from API when needed):
- Email address
- User role (especially SUPER_ADMIN)
- JWT tokens (using httpOnly cookies)
- Password (never stored)
- Any other sensitive data

### Session Security

- **Session Timeout** - Automatic cleanup after 30 minutes of inactivity
- **Complete Logout** - All authentication data, cookies, and sessionStorage cleared on logout
- **Secure Cleanup** - Ensures no data leakage on shared devices

## 🔒 Security Features

### Frontend Security

- **Input Sanitization** - User inputs sanitized to prevent XSS attacks
- **CSRF Protection** - CSRF tokens for all state-changing operations
- **XSS Prevention** - HttpOnly cookies prevent token theft via XSS
- **Content Security** - Security headers configured for protection
- **Rate Limiting** - Client-side rate limiting to prevent abuse

### Security Headers

The application implements comprehensive security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### API Security

- **Authenticated Requests** - All API calls require authentication
- **Automatic Token Refresh** - Seamless token renewal
- **401 Handling** - Automatic logout on authentication failure
- **Request Interceptors** - Consistent security headers across all requests
- **Error Handling** - Secure error messages that don't expose sensitive information

## 📊 Security Improvements (v1.3.0)

### Critical Security Enhancements

1. **Removed Sensitive Data from localStorage**
   - Email addresses and user roles no longer stored
   - Eliminated XSS attack vector for sensitive data

2. **Implemented AES-GCM Encryption**
   - All stored data now encrypted with industry-standard encryption
   - 256-bit key encryption using Web Crypto API

3. **Data Minimization**
   - Reduced stored data by 80%
   - Only essential non-sensitive data retained

4. **Session Timeout Protection**
   - Automatic cleanup after 30 minutes of inactivity
   - Protects abandoned sessions

5. **Complete Cleanup on Logout**
   - All authentication data securely cleared
   - Cookies and sessionStorage cleaned up

6. **Automatic Storage Migration**
   - Seamless upgrade for existing users
   - Legacy unencrypted data automatically migrated

## 🔍 Security Monitoring

### Event Logging

- **Security Event Logging** - All security events logged
- **Failed Login Attempts** - Tracked and logged
- **Token Validation** - Continuous token validation
- **Session Monitoring** - Track user activity and idle time
- **Error Tracking** - Comprehensive error tracking (SUPER_ADMIN only)

### Audit Trail

- **Audit Logs** - Complete audit trail of all user actions
- **Export Capabilities** - Audit logs can be exported for analysis
- **Advanced Filtering** - Search and filter capabilities for audit logs

## 🚨 Security Best Practices

### For Users

- ✅ Always log out when finished, especially on shared devices
- ✅ Use strong, unique passwords
- ✅ Report suspicious activity immediately
- ✅ Keep your browser updated
- ✅ Don't share your credentials

### For Developers

- ✅ Always use `SecureStorage` instead of `localStorage` for sensitive data
- ✅ Never store email, role, or tokens in localStorage
- ✅ Always encrypt sensitive data before storage
- ✅ Use `AuthGuard` for protected routes
- ✅ Check permissions before displaying sensitive features
- ✅ Validate and sanitize all user inputs
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated

## 📋 Security Checklist

### ✅ Implemented

- [x] JWT-based authentication with httpOnly cookies
- [x] Role-based access control (RBAC)
- [x] Route protection with AuthGuard
- [x] AES-GCM encryption for stored data
- [x] Data minimization (no sensitive data stored)
- [x] Session timeout protection
- [x] Complete logout cleanup
- [x] Automatic storage migration
- [x] CSRF protection
- [x] Input sanitization
- [x] Security headers
- [x] API request authentication
- [x] Security event logging
- [x] Audit logging

### 🔄 Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Password complexity requirements
- [ ] Account lockout after failed attempts
- [ ] IP whitelisting for admin access
- [ ] Enhanced Content Security Policy (CSP)
- [ ] Regular security audits
- [ ] Penetration testing

## 🐛 Reporting Security Vulnerabilities

We take security vulnerabilities seriously. If you discover a security vulnerability in the SF Dashboard:

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. **DO** report security issues privately to the security team
3. **DO** include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Resolution:** Based on severity and complexity

### Responsible Disclosure

We appreciate responsible disclosure of security vulnerabilities. We will:

- Acknowledge receipt of your report
- Work with you to understand and resolve the issue
- Credit you in security advisories (if desired)
- Keep you informed of the resolution progress

## 📚 Additional Security Documentation

For detailed security information, refer to:

- **[Security Implementation Guide](./docs/security/SECURITY.md)** - Detailed security implementation
- **[Security Update Summary](./docs/security/SECURITY_UPDATE_SUMMARY.md)** - Recent security improvements
- **[Security Assessment](./docs/security/SECURITY_ASSESSMENT.md)** - Security assessment details
- **[Local Storage Security Risks](./docs/security/LOCAL_STORAGE_SECURITY_RISKS.md)** - Storage security analysis
- **[Security Improvements](./docs/security/SECURITY_IMPROVEMENTS_IMPLEMENTED.md)** - Implementation details

## 🔄 Security Updates

Security updates are documented in:

- **[CHANGELOG.md](./CHANGELOG.md)** - Release notes and security updates
- **[Security Update Summary](./docs/security/SECURITY_UPDATE_SUMMARY.md)** - Detailed security change logs

## 🎯 Threat Model

### Primary Assets

- Admin credentials and session tokens
- User data and profiles
- Exported data files
- System configuration and API keys

### Attack Surfaces

- Login endpoint (brute force, phishing)
- Export functionality (data exfiltration)
- Environment configuration
- Browser storage (mitigated with encryption)

### Mitigations

- ✅ HttpOnly cookies prevent XSS token theft
- ✅ AES-GCM encryption protects stored data
- ✅ Data minimization reduces attack surface
- ✅ Session timeout protects abandoned sessions
- ✅ Role-based access control limits privilege escalation
- ✅ CSRF protection prevents unauthorized actions

## ⚠️ Known Limitations

### Client-Side Encryption

- Encryption protects against casual inspection
- Still vulnerable to XSS if attacker can execute JavaScript
- HttpOnly cookies provide better protection for tokens

### Key Derivation

- Uses domain + user agent for key derivation
- Same browser/domain = same key (for consistency)
- Key is not stored (derived on-the-fly)

## 📞 Security Support

For security-related questions or concerns:

1. Review the security documentation in `docs/security/`
2. Check the [CHANGELOG.md](./CHANGELOG.md) for recent security updates
3. Contact the security team for clarification

## 📝 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

**Security is an ongoing process. This document is regularly updated as new security measures are implemented and threats evolve.**

**Last Security Audit:** November 18, 2025  
**Next Scheduled Review:** Q1 2026

