# Project Structure & Architecture Documentation

> **Baseline Template for Enterprise React/TypeScript Applications**  
> This document serves as a comprehensive reference for the project structure, security implementations, and architectural patterns used in this codebase.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Security Architecture](#security-architecture)
4. [State Management](#state-management)
5. [API Architecture](#api-architecture)
6. [Routing & Navigation](#routing--navigation)
7. [Configuration Files](#configuration-files)
8. [Build & Development](#build--development)
9. [Best Practices](#best-practices)

---

## Project Overview

### Technology Stack

- **Frontend Framework**: React 19.2.1 with TypeScript 5.9.3
- **Build Tool**: Vite 7.1.7
- **Styling**: Tailwind CSS 3.4.18
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: 
  - Zustand 5.0.8 (client state)
  - React Query 5.90.5 (server state)
- **Routing**: React Router DOM 7.9.4
- **HTTP Client**: Axios 1.13.0
- **Form Validation**: Custom validators with TypeScript
- **Icons**: Lucide React 0.548.0
- **Charts**: Recharts 3.4.1
- **Notifications**: Sonner 2.0.7

### Key Features

- ✅ Role-Based Access Control (RBAC)
- ✅ Multi-environment support (dev/staging/production)
- ✅ HttpOnly cookie-based authentication
- ✅ CSRF protection
- ✅ Session timeout management
- ✅ Secure storage with encryption
- ✅ Lazy-loaded routes
- ✅ Responsive design
- ✅ Dark/Light theme support
- ✅ Real-time data fetching with React Query
- ✅ Comprehensive error handling

---

## Directory Structure

```
sf-dashboard/
├── public/                      # Static assets
│   ├── logo/                   # Logo files and favicons
│   └── dashboard/              # Dashboard-specific assets
│
├── src/                        # Source code
│   ├── app/                    # Application core
│   │   ├── App.tsx             # Root component
│   │   ├── providers.tsx      # Global providers (React Query, Router, Theme)
│   │   └── router.tsx          # Route configuration with lazy loading
│   │
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...             # Other UI primitives
│   │   ├── layout/             # Layout components
│   │   │   ├── main-layout.tsx # Main application layout
│   │   │   ├── header.tsx      # Top navigation bar
│   │   │   ├── sidebar.tsx     # Side navigation menu
│   │   │   └── footer.tsx      # Footer component
│   │   ├── filters/            # Filter components
│   │   │   ├── date-range-picker.tsx
│   │   │   └── audit-log-filters.tsx
│   │   ├── tables/             # Table components
│   │   │   └── audit-logs-table.tsx
│   │   ├── shared/             # Shared utility components
│   │   │   ├── error-display.tsx
│   │   │   ├── page-wrapper.tsx
│   │   │   ├── responsive-table.tsx
│   │   │   └── environment-selector.tsx
│   │   └── theme-provider.tsx  # Theme context provider
│   │
│   ├── features/               # Feature-based modules
│   │   ├── auth/               # Authentication feature
│   │   │   ├── components/     # Auth-specific components
│   │   │   │   ├── auth-guard.tsx      # Route protection
│   │   │   │   ├── require-role.tsx    # Role-based guard
│   │   │   │   └── role-guard.tsx      # Role checking component
│   │   │   ├── stores/        # Auth state management
│   │   │   │   └── auth-store.ts       # Zustand store for auth
│   │   │   ├── types/         # Auth type definitions
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts       # Public exports
│   │   ├── dashboard/          # Dashboard feature
│   │   │   ├── components/
│   │   │   ├── stores/
│   │   │   └── index.ts
│   │   └── users/              # User management feature
│   │       ├── components/
│   │       ├── pages/
│   │       └── index.ts
│   │
│   ├── pages/                  # Page components (route-level)
│   │   ├── login.tsx           # Login page
│   │   ├── overview.tsx        # Dashboard overview
│   │   ├── dashboard.tsx       # Main dashboard
│   │   ├── users.tsx           # User management
│   │   ├── audit-logs.tsx      # Audit logs viewer
│   │   ├── salesforce-response.tsx
│   │   └── ...                 # Other pages
│   │
│   ├── services/               # API service layer
│   │   └── api/                # API clients organized by domain
│   │       ├── api-client.ts   # Axios instance with interceptors
│   │       ├── auth/           # Authentication API
│   │       │   └── auth-api.ts
│   │       ├── users/          # User management API
│   │       │   └── user-api.ts
│   │       ├── audit/          # Audit logs API
│   │       ├── monitoring/     # Monitoring API
│   │       ├── queue/          # Queue management API
│   │       └── ...             # Other domain APIs
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── queries/            # React Query hooks
│   │   │   ├── use-user-queries.ts
│   │   │   ├── use-audit-queries.ts
│   │   │   ├── use-queue-queries.ts
│   │   │   └── ...
│   │   ├── use-pagination.ts   # Pagination logic
│   │   ├── use-permissions.ts  # Permission checking
│   │   ├── use-page-title.ts   # Dynamic page titles
│   │   ├── use-auto-refresh.ts # Auto-refresh data
│   │   ├── use-responsive.ts   # Responsive breakpoints
│   │   └── ...
│   │
│   ├── lib/                    # Core libraries and utilities
│   │   ├── api-client.ts       # API client factory (re-export)
│   │   ├── query-client.ts    # React Query configuration
│   │   ├── error-handler.ts   # Error handling utilities
│   │   ├── security-enhancements.ts  # Security utilities
│   │   └── utils.ts           # General utilities
│   │
│   ├── utils/                  # Utility functions
│   │   ├── security.ts         # Security utilities
│   │   ├── token-storage.ts   # Token storage (in-memory)
│   │   ├── session-timeout.ts  # Session management
│   │   ├── storage-migration.ts # Storage migration utilities
│   │   ├── filters.ts         # Data filtering utilities
│   │   ├── http-method.ts     # HTTP method utilities
│   │   ├── status-code.tsx    # Status code components
│   │   └── ...
│   │
│   ├── config/                 # Configuration files
│   │   ├── environments.ts    # Environment configurations
│   │   └── routes.config.ts   # Route configuration helpers
│   │
│   ├── constants/              # Application constants
│   │   ├── permissions.ts     # RBAC permissions
│   │   ├── routes.ts          # Route path constants
│   │   └── index.ts           # Re-exports
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── audit.ts           # Audit log types
│   │   └── index.ts           # Re-exports
│   │
│   ├── styles/                 # Global styles
│   │   └── index.css          # Tailwind imports and CSS variables
│   │
│   └── main.tsx                # Application entry point
│
├── docs/                       # Documentation
│   ├── SECURITY.md
│   ├── ARCHITECTURE.md
│   └── ...
│
├── dist/                        # Build output (generated)
├── node_modules/               # Dependencies (generated)
│
├── .gitignore                  # Git ignore rules
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── package-lock.json           # Lock file
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── README.md                   # Project README
```

---

## Security Architecture

### Authentication & Authorization

#### HttpOnly Cookies
- **Implementation**: Authentication tokens stored in httpOnly cookies (set by backend)
- **Security Benefits**: 
  - Not accessible via JavaScript (XSS protection)
  - Automatically sent with requests
  - Protected by browser security policies
- **Location**: `src/services/api/api-client.ts` - Axios configured with `withCredentials: true`

#### CSRF Protection
- **Implementation**: CSRF tokens read from cookies and response headers
- **Token Management**: `src/lib/security-enhancements.ts` - `CSRFProtection` class
- **Features**:
  - Automatic token extraction from cookies (`csrf-token`)
  - Token caching in sessionStorage
  - Automatic inclusion in state-changing requests (POST, PUT, PATCH, DELETE)
  - Retry logic for missing tokens

#### Session Timeout
- **Implementation**: `src/utils/session-timeout.ts`
- **Features**:
  - 30-minute inactivity timeout
  - Activity monitoring (mouse, keyboard, scroll, touch)
  - Automatic session cleanup
  - Backend session invalidation on timeout
- **Security**: Clears both local storage and backend httpOnly cookies

#### Role-Based Access Control (RBAC)
- **Implementation**: `src/constants/permissions.ts`
- **Roles**:
  - `USER`: Basic read-only access
  - `ADMIN`: Full access except super-admin features
  - `SUPER_ADMIN`: Complete system access
- **Route Protection**: `src/features/auth/components/require-role.tsx`
- **Permission Checking**: `src/hooks/use-permissions.ts`

### Data Security

#### Secure Storage
- **Implementation**: `src/lib/security-enhancements.ts` - `SecureStorage` class
- **Encryption**: AES-GCM encryption using Web Crypto API
- **Features**:
  - Automatic encryption/decryption
  - Deterministic key derivation (domain + user agent)
  - Secure data overwrite on removal
- **Usage**: Sensitive data stored with encryption

#### Token Storage
- **Implementation**: `src/utils/token-storage.ts`
- **Method**: In-memory storage (not localStorage)
- **Security Benefits**:
  - Not accessible via `localStorage.getItem()`
  - Not visible in DevTools
  - Automatically cleared on page refresh
- **Note**: HttpOnly cookies are preferred for production

#### Input Validation & Sanitization
- **Implementation**: `src/lib/security-enhancements.ts` - `InputValidator` class
- **Features**:
  - Email validation
  - Password strength validation
  - HTML sanitization (XSS prevention)
  - URL validation (open redirect prevention)
  - Character whitelisting

### Security Utilities

#### Security Logger
- **Location**: `src/lib/security-enhancements.ts` - `SecurityLogger` class
- **Features**:
  - Security event logging
  - Suspicious activity detection
  - Authentication event tracking
  - Severity levels (low, medium, high)

#### Rate Limiting (Client-side)
- **Implementation**: `src/lib/security-enhancements.ts` - `RateLimiter` class
- **Note**: Server-side rate limiting is required for production
- **Configuration**: 100 requests per 15 minutes (configurable)

#### Request Signing
- **Implementation**: `src/lib/security-enhancements.ts` - `RequestSigner` class
- **Purpose**: Sign critical operations for integrity verification

### Security Headers
- **Configuration**: `src/utils/security.ts` - `SECURITY_CONFIG`
- **Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## State Management

### Client State (Zustand)

#### Auth Store
- **Location**: `src/features/auth/stores/auth-store.ts`
- **Purpose**: Authentication state (user profile, login status)
- **Pattern**: Feature-based store organization

#### Dashboard Store
- **Location**: `src/features/dashboard/stores/dashboard-store.ts`
- **Purpose**: Dashboard-specific state (current environment, UI preferences)

### Server State (React Query)

#### Query Client Configuration
- **Location**: `src/lib/query-client.ts`
- **Default Options**:
  - `staleTime`: 5 minutes
  - `gcTime`: 10 minutes (cache time)
  - `refetchOnWindowFocus`: false
  - `refetchOnReconnect`: true
  - `retry`: 3 attempts with exponential backoff

#### Query Hooks
- **Location**: `src/hooks/queries/`
- **Organization**: Domain-based hooks (users, audit, queue, etc.)
- **Pattern**: Custom hooks wrapping React Query hooks

#### Query Keys
- **Location**: `src/lib/query-keys.ts`
- **Purpose**: Centralized query key management for cache invalidation

### State Management Patterns

1. **Feature-based Organization**: Stores organized by feature domain
2. **Separation of Concerns**: Client state (Zustand) vs Server state (React Query)
3. **Type Safety**: Full TypeScript support for all stores
4. **Selective Subscriptions**: Zustand allows component-level subscriptions

---

## API Architecture

### API Client Structure

#### Base Client
- **Location**: `src/services/api/api-client.ts`
- **Features**:
  - Dynamic environment switching
  - Request/response interceptors
  - Automatic CSRF token handling
  - Token refresh on 401
  - Error handling and retry logic
  - Rate limiting checks

#### Domain Services
- **Location**: `src/services/api/{domain}/`
- **Organization**: Each domain has its own API service file
- **Pattern**: Service classes with static methods
- **Examples**:
  - `auth/auth-api.ts` - Authentication endpoints
  - `users/user-api.ts` - User management endpoints
  - `audit/audit-api.ts` - Audit log endpoints

### API Client Features

#### Request Interceptor
- Updates baseURL dynamically based on current environment
- Adds CSRF tokens to state-changing requests
- Includes credentials for httpOnly cookies
- Client-side rate limiting checks

#### Response Interceptor
- Extracts CSRF tokens from response headers
- Handles 401 (authentication) errors with token refresh
- Handles 403 (authorization) errors with CSRF retry
- Logs security events
- Redirects to login on session expiration

#### Error Handling
- **Location**: `src/lib/error-handler.ts`
- **Features**:
  - User-friendly error messages
  - Authentication/authorization error detection
  - Network error handling
  - API error message extraction

---

## Routing & Navigation

### Route Configuration
- **Location**: `src/app/router.tsx`
- **Pattern**: Lazy-loaded routes with code splitting
- **Features**:
  - Route-based code splitting
  - Suspense boundaries for loading states
  - Role-based route protection
  - Public/protected route separation

### Route Types

#### Public Routes
- Login page
- Unauthorized page
- No authentication required

#### Protected Routes
- Require authentication
- Accessible to all authenticated users
- Examples: Overview, Dashboard, Metrics

#### Admin Routes
- Require ADMIN or SUPER_ADMIN role
- Examples: Users, Permissions, Settings

#### Super Admin Routes
- Require SUPER_ADMIN role only
- Examples: Errors, Error Details

### Route Guards

#### AuthGuard
- **Location**: `src/features/auth/components/auth-guard.tsx`
- **Purpose**: Protects routes requiring authentication
- **Behavior**: Redirects to login if not authenticated

#### RequireRole
- **Location**: `src/features/auth/components/require-role.tsx`
- **Purpose**: Enforces role-based access
- **Behavior**: Redirects to unauthorized page if role insufficient

### Route Configuration Helpers
- **Location**: `src/config/routes.config.ts`
- **Features**:
  - Centralized route path management
  - Public route checking
  - Login URL generation

---

## Configuration Files

### TypeScript Configuration
- **File**: `tsconfig.json`
- **Key Features**:
  - Strict mode enabled
  - Path aliases configured (`@/*`, `@/components/*`, etc.)
  - ES2022 target
  - React JSX support
  - No unused locals/parameters

### Vite Configuration
- **File**: `vite.config.ts`
- **Key Features**:
  - React plugin
  - Path aliases matching TypeScript
  - Environment-based base path
  - Development proxy for API
  - Code splitting configuration
  - Source maps enabled

### Tailwind Configuration
- **File**: `tailwind.config.js`
- **Key Features**:
  - Dark mode support (class-based)
  - Custom color system (HSL variables)
  - Extended theme with custom colors
  - Container configuration

### Environment Configuration
- **Location**: `src/config/environments.ts`
- **Environments**:
  - Development: `http://localhost:3000`
  - Staging: `https://staging-api.sf-middleware.com`
  - Production: `https://transferses.unicef.id`
- **Features**: Environment-specific API URLs, WebSocket URLs, feature flags, limits

---

## Build & Development

### Scripts

```json
{
  "dev": "vite",                    // Development server
  "build": "tsc && vite build --mode production",
  "build:dev": "tsc && vite build --mode development",
  "build:staging": "tsc && vite build --mode staging",
  "preview": "vite preview",        // Preview production build
  "lint": "eslint . --ext ts,tsx",
  "type-check": "tsc --noEmit"      // Type checking without build
}
```

### Build Configuration

#### Code Splitting
- Vendor chunks: React, React DOM
- Radix UI components
- Charts library
- Utility libraries

#### Environment Variables
- `VITE_API_URL`: API base URL
- `VITE_WS_URL`: WebSocket URL
- `VITE_ROUTER_BASENAME`: Router base path (default: `/dashboard`)

### Development Server
- **Port**: 3001
- **Proxy**: `/api` → `http://localhost:3000`
- **WebSocket Proxy**: `/ws` → `ws://localhost:3000`

---

## Best Practices

### Code Organization

1. **Feature-Based Structure**: Group related code by feature domain
2. **Separation of Concerns**: Clear separation between UI, business logic, and data
3. **Reusability**: Shared components in `components/shared/`
4. **Type Safety**: Full TypeScript coverage
5. **Path Aliases**: Use `@/` aliases for cleaner imports

### Security Best Practices

1. **HttpOnly Cookies**: Use for authentication tokens
2. **CSRF Protection**: Always include CSRF tokens in state-changing requests
3. **Input Validation**: Validate and sanitize all user inputs
4. **Session Management**: Implement session timeout
5. **Secure Storage**: Encrypt sensitive data in localStorage
6. **Error Handling**: Don't expose sensitive information in error messages
7. **Rate Limiting**: Implement both client and server-side rate limiting

### State Management Best Practices

1. **Server State**: Use React Query for all server data
2. **Client State**: Use Zustand for UI state and preferences
3. **Query Keys**: Centralize query keys for cache management
4. **Optimistic Updates**: Use React Query mutations for optimistic UI updates
5. **Cache Invalidation**: Properly invalidate queries after mutations

### Component Best Practices

1. **Component Composition**: Prefer composition over inheritance
2. **Lazy Loading**: Lazy load route components
3. **Error Boundaries**: Implement error boundaries for error handling
4. **Loading States**: Always show loading states during data fetching
5. **Accessibility**: Follow WCAG guidelines for accessibility

### API Best Practices

1. **Service Layer**: Organize API calls by domain
2. **Error Handling**: Centralized error handling in interceptors
3. **Retry Logic**: Implement retry logic for transient failures
4. **Request Cancellation**: Cancel requests when components unmount
5. **Type Safety**: Type all API responses

### Performance Best Practices

1. **Code Splitting**: Lazy load routes and heavy components
2. **Memoization**: Use React.memo, useMemo, useCallback appropriately
3. **Virtual Scrolling**: Use for large lists
4. **Image Optimization**: Optimize images and use lazy loading
5. **Bundle Analysis**: Regularly analyze bundle size

### Testing Considerations

1. **Unit Tests**: Test utilities and pure functions
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test critical user flows
4. **Type Checking**: Use TypeScript for compile-time checks

---

## Key Architectural Decisions

### 1. Feature-Based Organization
- **Decision**: Organize code by feature domain rather than by file type
- **Rationale**: Better scalability, easier to find related code, supports team collaboration

### 2. HttpOnly Cookies for Authentication
- **Decision**: Use httpOnly cookies instead of localStorage for tokens
- **Rationale**: Better security against XSS attacks, tokens not accessible via JavaScript

### 3. React Query for Server State
- **Decision**: Use React Query instead of Redux for server state
- **Rationale**: Built-in caching, background updates, optimistic updates, less boilerplate

### 4. Zustand for Client State
- **Decision**: Use Zustand instead of Context API or Redux
- **Rationale**: Simpler API, better performance, less boilerplate, TypeScript-friendly

### 5. Lazy-Loaded Routes
- **Decision**: Lazy load all route components
- **Rationale**: Smaller initial bundle, faster initial load, better code splitting

### 6. Centralized API Client
- **Decision**: Single Axios instance with interceptors
- **Rationale**: Consistent error handling, automatic token refresh, CSRF protection

### 7. TypeScript Strict Mode
- **Decision**: Enable strict TypeScript checking
- **Rationale**: Catch errors at compile time, better IDE support, self-documenting code

### 8. Environment-Based Configuration
- **Decision**: Runtime environment switching
- **Rationale**: Test against different environments without rebuild, better developer experience

---

## Migration & Upgrade Paths

### Storage Migration
- **Location**: `src/utils/storage-migration.ts`
- **Purpose**: Migrate from old storage format to new secure format
- **Features**: Automatic migration on app initialization

### Backward Compatibility
- API client maintains backward compatibility
- Storage migration handles legacy data
- Route configuration supports old paths

---

## Security Checklist

When using this template for new projects, ensure:

- [ ] Update environment configurations
- [ ] Configure CSRF token cookie name if different
- [ ] Set appropriate session timeout values
- [ ] Configure rate limiting thresholds
- [ ] Update security headers as needed
- [ ] Review and update permission constants
- [ ] Configure CORS properly on backend
- [ ] Set up proper error logging/monitoring
- [ ] Review and update input validation rules
- [ ] Configure secure storage encryption keys (if custom)

---

## Conclusion

This project structure provides:

✅ **Security**: Comprehensive security measures at multiple layers  
✅ **Scalability**: Feature-based organization supports growth  
✅ **Maintainability**: Clear separation of concerns and patterns  
✅ **Type Safety**: Full TypeScript coverage  
✅ **Performance**: Code splitting, lazy loading, optimized builds  
✅ **Developer Experience**: Path aliases, hot reload, dev tools  
✅ **Best Practices**: Industry-standard patterns and conventions  

Use this structure as a baseline for new projects, adapting it to specific requirements while maintaining the core architectural principles.

---

**Last Updated**: 2024  
**Version**: 1.1.0  
**Maintainer**: Development Team

