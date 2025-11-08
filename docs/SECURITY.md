# SF Dashboard Security Implementation

Last updated: 2025-11-08

## Overview
The SF Dashboard now includes comprehensive authentication and security measures to protect the admin interface and ensure proper access control.

## 🔐 Authentication System

### Login Implementation
- **Login Page**: Complete login interface with email/password authentication
- **JWT Token Management**: Secure token storage and validation
- **Session Management**: Automatic token refresh and session timeout
- **Logout Functionality**: Secure logout with token invalidation

### Authentication Flow
1. User enters credentials on `/login` page
2. Backend validates credentials and returns JWT token
3. Token stored in localStorage with automatic refresh
4. All API requests include Bearer token authentication
5. 401 responses automatically redirect to login

## 🛡️ Security Features

### 1. Route Protection
- **AuthGuard**: Protects all dashboard routes
- **Automatic Redirects**: Unauthenticated users redirected to login
- **Loading States**: Proper loading indicators during auth checks

### 2. Role-Based Access Control (RBAC)
- **Three User Roles**: Admin, Operator, Viewer
- **Permission System**: Granular permissions for different actions
- **Dynamic UI**: Sidebar and features filtered based on user role

#### Role Permissions:
- **Admin**: Full access to all features
- **Operator**: Can view and manage queues, users, audit logs
- **Viewer**: Read-only access to monitoring and logs

### 3. API Security
- **JWT Authentication**: All API calls include Bearer tokens
- **Automatic Token Refresh**: Tokens refreshed before expiry
- **401 Handling**: Automatic logout on authentication failure
- **Request Interceptors**: Consistent auth headers across all services

### 4. Frontend Security
- **Input Sanitization**: User inputs sanitized to prevent XSS
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Session Timeout**: Automatic logout after inactivity
- **Secure Storage**: Sensitive data properly managed

## 🔒 Security Headers
The application includes comprehensive security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## 🚨 Security Monitoring
- **Security Event Logging**: All security events logged
- **Failed Login Attempts**: Tracked and logged
- **Token Validation**: Continuous token validation
- **Session Monitoring**: Track user activity and idle time

## 📋 Security Checklist

### ✅ Implemented
- [x] User authentication with JWT tokens
- [x] Role-based access control
- [x] Route protection with AuthGuard
- [x] API request authentication
- [x] Automatic token refresh
- [x] Secure logout functionality
- [x] Input sanitization
- [x] CSRF protection
- [x] Session timeout
- [x] Security headers
- [x] Permission-based UI filtering
- [x] Security event logging

### 🔄 Additional Recommendations
- [ ] Two-factor authentication (2FA)
- [ ] Password complexity requirements
- [ ] Account lockout after failed attempts
- [ ] Audit logging for all admin actions
- [ ] IP whitelisting for admin access
- [ ] Regular security audits
- [ ] Penetration testing

## 🧠 Threat Model & Residual Risk

### Primary Assets
- Admin credentials and session tokens
- Exported data files (potentially containing PII)
- System configuration and API keys

### Threat Actors
- External attackers attempting credential stuffing or API abuse
- Malicious insiders with elevated privileges
- Compromised third-party integrations (e.g., browser extensions)

### Attack Surfaces
- Login endpoint (brute force, phishing)
- Export functionality (data exfiltration)
- Environment configuration (tampering with base URLs)
- Local storage (token theft on shared devices)

### Residual Risks
- Tokens stored in `localStorage` remain vulnerable if browser compromised
- No MFA: stolen credentials grant full access
- Limited rate limiting visibility on frontend
- Export files rely on user handling hygiene once downloaded

### Mitigations in Progress
- 2FA, password policies, and account lockouts (see roadmap below)
- Enhanced telemetry on export/download events
- User education for secure file handling

## 🗺️ Roadmap & Ownership

| Item | Target | Owner | Status |
| --- | --- | --- | --- |
| Two-factor authentication | Q1 2026 | Security Engineering | Planned |
| Password policy enforcement | Q4 2025 | Identity Team | Designing |
| Account lockout & alerts | Q4 2025 | Backend Team | In progress |
| Comprehensive audit logging | Q1 2026 | Platform Team | Planned |
| IP allow-listing | Q2 2026 | Network Security | Backlog |
| Annual security audit | Annually | Compliance | Scheduled |
| Penetration testing | Semi-annual | Third-party Vendor | Scheduled |

## 🚀 Usage

### Login
1. Navigate to `/login`
2. Enter admin credentials
3. Dashboard automatically loads after successful authentication

### Role Management
- Users are assigned roles by the backend
- UI automatically adapts based on user permissions
- Unauthorized access attempts redirect to error page

### Logout
- Click user menu in header
- Select "Log out"
- All sessions cleared and redirect to login

## 🔧 Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:3000
```

### Security Settings
All security settings are configurable in `src/utils/security.ts`:
- Token refresh threshold
- Session timeout duration
- Rate limiting settings
- Security headers

## 📚 API Integration

The dashboard integrates with the backend authentication endpoints:
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

All endpoints require proper JWT authentication and return appropriate error codes for security violations.

## 🛠️ Development

### Adding New Protected Routes
1. Wrap component with `AuthGuard`
2. Add role requirements if needed
3. Update permission system if required

### Adding New Permissions
1. Define permission in `src/hooks/use-permissions.ts`
2. Add to role permissions
3. Use in components with `usePermissions` hook

### Security Testing
- Test with different user roles
- Verify unauthorized access is blocked
- Test token expiration handling
- Verify logout functionality

---

**Note**: This security implementation provides a solid foundation for admin dashboard security. Regular security audits and updates are recommended to maintain security standards.
