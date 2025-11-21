# RBAC on Database - Complete Database Schema & Data

**Last Updated:** December 2024  
**Purpose:** Complete database schema design for Role-Based Access Control (RBAC) system with permissions master, menu mapping, and role permissions matrix.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema Design](#database-schema-design)
3. [Permissions Master Table](#permissions-master-table)
4. [Menu Mapping Table](#menu-mapping-table)
5. [Role Permissions Matrix Table](#role-permissions-matrix-table)
6. [Sample Queries](#sample-queries)
7. [Implementation Notes](#implementation-notes)

---

## Overview

This document defines the complete database structure for implementing a granular RBAC system where:

- **21 menu items** are mapped to **52 permission keys** (1-3 permissions per menu)
- Each permission has a **resource** and **action** (read, manage, delete, export, configure)
- **5 roles** (SUPER_ADMIN, ADMIN, USER, operator, viewer) are mapped to specific permissions
- Menu visibility is controlled by permissions

### Permission Structure Pattern:
- **VIEW_*** = Read/View access
- **MANAGE_*** = Create, Update, Edit access  
- **DELETE_*** / **ADMIN_*** = Delete, Configure, Export, Advanced actions

---

## Database Schema Design

### Prisma Schema

```prisma
// Permissions Master - Defines all available permissions in the system
model Permission {
  id              String   @id @default(cuid())
  permissionKey   String   @unique // e.g., "VIEW_API_KEYS"
  name            String   // e.g., "View API Keys"
  description     String?  // Optional description
  resource        String   // e.g., "api_keys", "users", "audit_logs"
  action          String   // e.g., "read", "manage", "delete", "export", "configure"
  category        String   // e.g., "API Management", "User Management"
  menuGroup       String?  // e.g., "API Management", "Overview"
  menuItemKey     String?  // e.g., "api-keys", "users"
  permissionLevel String   // "view", "manage", "admin" (for hierarchy)
  isSystem        Boolean  @default(true) // Built-in permissions cannot be deleted
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  rolePermissions RolePermission[]
  
  @@index([resource])
  @@index([action])
  @@index([category])
  @@index([menuItemKey])
  @@index([permissionLevel])
}

// Menu Items - Maps menu items to routes and permissions
model MenuItem {
  id                  String   @id @default(cuid())
  menuKey             String   @unique // e.g., "api-keys", "users"
  menuLabel           String   // e.g., "API Keys", "Users"
  menuGroup           String   // e.g., "API Management", "Overview"
  routePath           String   // e.g., "/api-keys", "/users"
  requiredPermissionKey String? // FK to Permission.permissionKey (for menu visibility)
  isAlwaysVisible     Boolean  @default(false) // Show even without permission
  iconName            String?  // e.g., "Key", "Users"
  displayOrder        Int      // Order within menu group
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([menuGroup])
  @@index([requiredPermissionKey])
  @@index([displayOrder])
}

// Role Permissions Matrix - Maps roles to permissions
model RolePermission {
  id            String   @id @default(cuid())
  roleName      String   // e.g., "SUPER_ADMIN", "ADMIN", "USER", "operator", "viewer"
  permissionKey String   // FK to Permission.permissionKey
  hasPermission Boolean  @default(true)
  grantedAt     DateTime @default(now())
  grantedBy     String?  // user_id who granted (for audit)
  notes         String?  // Optional notes
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Optional: If you want to use relation instead of permissionKey string
  // permission   Permission @relation(fields: [permissionKey], references: [permissionKey], onDelete: Cascade)
  
  @@unique([roleName, permissionKey])
  @@index([roleName])
  @@index([permissionKey])
}

// Optional: Role Master Table (if you want to store role metadata)
model Role {
  id          String   @id @default(cuid())
  roleName    String   @unique // e.g., "SUPER_ADMIN"
  displayName String   // e.g., "Super Admin"
  description String?  // Role description
  isSystem    Boolean  @default(true) // System roles cannot be deleted
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([isSystem])
}
```

### SQL Schema (Alternative)

```sql
-- Permissions Master Table
CREATE TABLE permissions (
    id VARCHAR(255) PRIMARY KEY,
    permission_key VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    menu_group VARCHAR(100),
    menu_item_key VARCHAR(100),
    permission_level VARCHAR(20) NOT NULL CHECK (permission_level IN ('view', 'manage', 'admin')),
    is_system BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_resource (resource),
    INDEX idx_action (action),
    INDEX idx_category (category),
    INDEX idx_menu_item_key (menu_item_key),
    INDEX idx_permission_level (permission_level)
);

-- Menu Items Table
CREATE TABLE menu_items (
    id VARCHAR(255) PRIMARY KEY,
    menu_key VARCHAR(100) UNIQUE NOT NULL,
    menu_label VARCHAR(255) NOT NULL,
    menu_group VARCHAR(100) NOT NULL,
    route_path VARCHAR(255) NOT NULL,
    required_permission_key VARCHAR(255),
    is_always_visible BOOLEAN DEFAULT false,
    icon_name VARCHAR(100),
    display_order INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_menu_group (menu_group),
    INDEX idx_required_permission_key (required_permission_key),
    INDEX idx_display_order (display_order),
    FOREIGN KEY (required_permission_key) REFERENCES permissions(permission_key) ON DELETE SET NULL
);

-- Role Permissions Matrix Table
CREATE TABLE role_permissions (
    id VARCHAR(255) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    permission_key VARCHAR(255) NOT NULL,
    has_permission BOOLEAN DEFAULT true,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role_permission (role_name, permission_key),
    INDEX idx_role_name (role_name),
    INDEX idx_permission_key (permission_key),
    FOREIGN KEY (permission_key) REFERENCES permissions(permission_key) ON DELETE CASCADE
);

-- Optional: Role Master Table
CREATE TABLE roles (
    id VARCHAR(255) PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_system (is_system)
);
```

---

## Permissions Master Table

### Complete Data (52 Permissions)

| permission_key | name | resource | action | category | menu_group | menu_item_key | permission_level |
|---|---|---|---|---|---|---|---|
| VIEW_OVERVIEW | View Overview | overview | read | Overview | Overview | overview | view |
| VIEW_DASHBOARD | View Dashboard | dashboard | read | Overview | Overview | dashboard | view |
| EXPORT_DASHBOARD | Export Dashboard | dashboard | export | Overview | Overview | dashboard | manage |
| VIEW_METRICS | View Metrics | metrics | read | Overview | Overview | metrics | view |
| EXPORT_METRICS | Export Metrics | metrics | export | Overview | Overview | metrics | manage |
| VIEW_API_KEYS | View API Keys | api_keys | read | API Management | API Management | api-keys | view |
| MANAGE_API_KEYS | Manage API Keys | api_keys | manage | API Management | API Management | api-keys | manage |
| DELETE_API_KEYS | Delete API Keys | api_keys | delete | API Management | API Management | api-keys | admin |
| VIEW_ENDPOINTS | View Endpoints | endpoints | read | API Management | API Management | endpoints | view |
| MANAGE_ENDPOINTS | Manage Endpoints | endpoints | manage | API Management | API Management | endpoints | manage |
| CONFIGURE_ENDPOINTS | Configure Endpoints | endpoints | configure | API Management | API Management | endpoints | admin |
| VIEW_USAGE_ANALYTICS | View Usage Analytics | usage_analytics | read | API Management | API Management | usage | view |
| EXPORT_USAGE_ANALYTICS | Export Usage Analytics | usage_analytics | export | API Management | API Management | usage | manage |
| VIEW_QUEUE | View Queue | queue | read | Queue Management | Queue Management | queue | view |
| MANAGE_QUEUE | Manage Queue | queue | manage | Queue Management | Queue Management | queue | manage |
| FORCE_FLUSH_QUEUE | Force Flush Queue | queue | force_flush | Queue Management | Queue Management | queue | admin |
| VIEW_JOBS | View Jobs | jobs | read | Queue Management | Queue Management | jobs | view |
| MANAGE_JOBS | Manage Jobs | jobs | manage | Queue Management | Queue Management | jobs | manage |
| DELETE_JOBS | Delete Jobs | jobs | delete | Queue Management | Queue Management | jobs | admin |
| VIEW_MONITORING | View Monitoring | monitoring | read | Queue Management | Queue Management | monitoring | view |
| EXPORT_MONITORING | Export Monitoring | monitoring | export | Queue Management | Queue Management | monitoring | manage |
| VIEW_USERS | View Users | users | read | User Management | User Management | users | view |
| MANAGE_USERS | Manage Users | users | manage | User Management | User Management | users | manage |
| DELETE_USERS | Delete Users | users | delete | User Management | User Management | users | admin |
| VIEW_PERMISSIONS | View Permissions | permissions | read | User Management | User Management | permissions | view |
| MANAGE_PERMISSIONS | Manage Permissions | permissions | manage | User Management | User Management | permissions | manage |
| CONFIGURE_PERMISSIONS | Configure Permissions | permissions | configure | User Management | User Management | permissions | admin |
| VIEW_LOGS | View Logs | logs | read | Logs & Audit | Logs & Audit | logs | view |
| EXPORT_LOGS | Export Logs | logs | export | Logs & Audit | Logs & Audit | logs | manage |
| VIEW_AUDIT_LOGS | View Audit Logs | audit_logs | read | Logs & Audit | Logs & Audit | audit-logs | view |
| EXPORT_AUDIT_LOGS | Export Audit Logs | audit_logs | export | Logs & Audit | Logs & Audit | audit-logs | manage |
| DELETE_AUDIT_LOGS | Delete Audit Logs | audit_logs | delete | Logs & Audit | Logs & Audit | audit-logs | admin |
| VIEW_SALESFORCE_LOGS | View Salesforce Logs | salesforce_logs | read | Logs & Audit | Logs & Audit | salesforce-logs | view |
| EXPORT_SALESFORCE_LOGS | Export Salesforce Logs | salesforce_logs | export | Logs & Audit | Logs & Audit | salesforce-logs | manage |
| VIEW_CRON_JOBS | View Cron Jobs | cron_jobs | read | Logs & Audit | Logs & Audit | cron-jobs | view |
| MANAGE_CRON_JOBS | Manage Cron Jobs | cron_jobs | manage | Logs & Audit | Logs & Audit | cron-jobs | manage |
| DELETE_CRON_JOBS | Delete Cron Jobs | cron_jobs | delete | Logs & Audit | Logs & Audit | cron-jobs | admin |
| VIEW_ERRORS | View Errors | errors | read | Logs & Audit | Logs & Audit | errors | view |
| MANAGE_ERRORS | Manage Errors | errors | manage | Logs & Audit | Logs & Audit | errors | manage |
| DELETE_ERRORS | Delete Errors | errors | delete | Logs & Audit | Logs & Audit | errors | admin |
| VIEW_PERFORMANCE | View Performance | performance | read | Analytics | Analytics | performance | view |
| EXPORT_PERFORMANCE | Export Performance | performance | export | Analytics | Analytics | performance | manage |
| VIEW_REPORTS | View Reports | reports | read | Reports | Reports | reports | view |
| GENERATE_REPORTS | Generate Reports | reports | generate | Reports | Reports | reports | manage |
| EXPORT_REPORTS | Export Reports | reports | export | Reports | Reports | reports | manage |
| VIEW_SALESFORCE_RESPONSE | View Salesforce Response | salesforce_response | read | Reports | Reports | salesforce-response | view |
| EXPORT_SALESFORCE_RESPONSE | Export Salesforce Response | salesforce_response | export | Reports | Reports | salesforce-response | manage |
| VIEW_SETTINGS | View Settings | settings | read | System | System | settings | view |
| MANAGE_SETTINGS | Manage Settings | settings | manage | System | System | settings | manage |
| CONFIGURE_SETTINGS | Configure Settings | settings | configure | System | System | settings | admin |
| VIEW_NOTIFICATIONS | View Notifications | notifications | read | System | System | notifications | view |
| MANAGE_NOTIFICATIONS | Manage Notifications | notifications | manage | System | System | notifications | manage |
| DELETE_NOTIFICATIONS | Delete Notifications | notifications | delete | System | System | notifications | admin |

### Permission Distribution Summary

- **Total Permissions:** 52
- **By Menu Group:**
  - Overview: 5 permissions
  - API Management: 8 permissions
  - Queue Management: 8 permissions
  - User Management: 6 permissions
  - Logs & Audit: 12 permissions
  - Analytics: 2 permissions
  - Reports: 5 permissions
  - System: 6 permissions

- **By Permission Level:**
  - View: 21 permissions
  - Manage: 20 permissions
  - Admin: 11 permissions

---

## Menu Mapping Table

### Complete Data (21 Menu Items)

| menu_key | menu_label | menu_group | route_path | required_permission_key | is_always_visible | icon_name | display_order |
|---|---|---|---|---|---|---|---|
| overview | Overview | Overview | /overview | null | true | LayoutDashboard | 1 |
| dashboard | Dashboard | Overview | /dashboard | null | true | Activity | 2 |
| metrics | Key Metrics | Overview | /metrics | null | true | TrendingUp | 3 |
| api-keys | API Keys | API Management | /api-keys | VIEW_API_KEYS | false | Key | 4 |
| endpoints | Endpoints | API Management | /endpoints | VIEW_ENDPOINTS | false | Monitor | 5 |
| usage | Usage Analytics | API Management | /usage | VIEW_USAGE_ANALYTICS | false | BarChart3 | 6 |
| queue | Queue Management | Queue Management | /queue | VIEW_QUEUE | false | Workflow | 7 |
| jobs | Job Details | Queue Management | /jobs | VIEW_JOBS | false | FileText | 8 |
| monitoring | Real-time Monitor | Queue Management | /monitoring | VIEW_MONITORING | false | Monitor | 9 |
| users | Users | User Management | /users | VIEW_USERS | false | Users | 10 |
| permissions | Permissions | User Management | /permissions | VIEW_PERMISSIONS | false | Shield | 11 |
| logs | Live Logs | Logs & Audit | /logs | VIEW_LOGS | false | Monitor | 12 |
| audit-logs | Audit Trail | Logs & Audit | /audit-logs | VIEW_AUDIT_LOGS | false | FileText | 13 |
| salesforce-logs | Salesforce Logs | Logs & Audit | /salesforce-logs | VIEW_SALESFORCE_LOGS | false | Cloud | 14 |
| cron-jobs | Cron Jobs | Logs & Audit | /cron-jobs | VIEW_CRON_JOBS | false | Clock | 15 |
| errors | Error Tracking | Logs & Audit | /errors | VIEW_ERRORS | false | AlertTriangle | 16 |
| performance | Performance | Analytics | /performance | VIEW_PERFORMANCE | false | TrendingUp | 17 |
| reports | Reports | Reports | /reports | VIEW_REPORTS | false | FileText | 18 |
| salesforce-response | Salesforce Response | Reports | /salesforce-response | null | true | Cloud | 19 |
| settings | Settings | System | /settings | VIEW_SETTINGS | false | Settings | 20 |
| notifications | Notifications | System | /notifications | VIEW_NOTIFICATIONS | false | Bell | 21 |

### Menu Distribution Summary

- **Total Menus:** 21
- **Always Visible:** 3 menus (overview, dashboard, metrics, salesforce-response)
- **Permission-Protected:** 18 menus
- **By Menu Group:**
  - Overview: 3 menus
  - API Management: 3 menus
  - Queue Management: 3 menus
  - User Management: 2 menus
  - Logs & Audit: 5 menus
  - Analytics: 1 menu
  - Reports: 2 menus
  - System: 2 menus

---

## Role Permissions Matrix Table

### Role Definitions

| role_name | display_name | description | is_system |
|---|---|---|---|
| SUPER_ADMIN | Super Administrator | Full access to all permissions and system settings | true |
| ADMIN | Administrator | Comprehensive access with management capabilities | true |
| USER | User | Basic access to overview, queue, and reports | true |
| operator | Operator | Access to logs, queue management, and viewing users/API keys | true |
| viewer | Viewer | Read-only access to logs, queue, users, and API keys | true |

### Complete Role-Permission Matrix

#### SUPER_ADMIN - All Permissions (52 permissions)

All 52 permissions listed above.

#### ADMIN - All Permissions (52 permissions)

All 52 permissions listed above (same as SUPER_ADMIN).

#### USER - Limited Access (2 permissions)

| role_name | permission_key |
|---|---|
| USER | VIEW_QUEUE |
| USER | VIEW_SALESFORCE_RESPONSE |

#### operator - Operational Access (7 permissions)

| role_name | permission_key |
|---|---|
| operator | VIEW_AUDIT_LOGS |
| operator | EXPORT_AUDIT_LOGS |
| operator | VIEW_QUEUE |
| operator | MANAGE_QUEUE |
| operator | VIEW_USERS |
| operator | VIEW_API_KEYS |
| operator | VIEW_PERFORMANCE |

#### viewer - Read-Only Access (5 permissions)

| role_name | permission_key |
|---|---|
| viewer | VIEW_AUDIT_LOGS |
| viewer | VIEW_QUEUE |
| viewer | VIEW_USERS |
| viewer | VIEW_API_KEYS |
| viewer | VIEW_PERFORMANCE |

### Role Permission Summary

| Role | Total Permissions | Permission Level Distribution |
|---|---|---|
| SUPER_ADMIN | 52 | View: 21, Manage: 20, Admin: 11 |
| ADMIN | 52 | View: 21, Manage: 20, Admin: 11 |
| USER | 2 | View: 2 |
| operator | 7 | View: 5, Manage: 2 |
| viewer | 5 | View: 5 |

---

## Sample Queries

### Get All Permissions for a Role

```sql
SELECT 
    p.permission_key,
    p.name,
    p.resource,
    p.action,
    p.category,
    rp.has_permission,
    rp.granted_at
FROM role_permissions rp
JOIN permissions p ON rp.permission_key = p.permission_key
WHERE rp.role_name = 'ADMIN'
    AND rp.has_permission = true
    AND p.is_active = true
ORDER BY p.category, p.permission_level;
```

### Get All Menu Items Visible to a Role

```sql
SELECT 
    m.menu_key,
    m.menu_label,
    m.menu_group,
    m.route_path,
    m.icon_name,
    m.display_order
FROM menu_items m
LEFT JOIN permissions p ON m.required_permission_key = p.permission_key
LEFT JOIN role_permissions rp ON p.permission_key = rp.permission_key 
    AND rp.role_name = 'ADMIN'
WHERE m.is_active = true
    AND (
        m.is_always_visible = true
        OR (m.required_permission_key IS NULL)
        OR (rp.has_permission = true AND rp.role_name = 'ADMIN')
    )
ORDER BY m.menu_group, m.display_order;
```

### Get Permission Matrix for All Roles

```sql
SELECT 
    r.role_name,
    r.display_name,
    COUNT(DISTINCT rp.permission_key) as total_permissions,
    COUNT(DISTINCT CASE WHEN p.permission_level = 'view' THEN rp.permission_key END) as view_permissions,
    COUNT(DISTINCT CASE WHEN p.permission_level = 'manage' THEN rp.permission_key END) as manage_permissions,
    COUNT(DISTINCT CASE WHEN p.permission_level = 'admin' THEN rp.permission_key END) as admin_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.role_name = rp.role_name AND rp.has_permission = true
LEFT JOIN permissions p ON rp.permission_key = p.permission_key AND p.is_active = true
WHERE r.is_active = true
GROUP BY r.role_name, r.display_name
ORDER BY r.role_name;
```

### Check if User Has Specific Permission

```sql
SELECT 
    CASE 
        WHEN rp.has_permission = true THEN true
        ELSE false
    END as has_permission
FROM role_permissions rp
JOIN permissions p ON rp.permission_key = p.permission_key
WHERE rp.role_name = 'ADMIN'
    AND p.permission_key = 'VIEW_API_KEYS'
    AND p.is_active = true
    AND rp.has_permission = true;
```

### Get All Permissions by Menu Item

```sql
SELECT 
    m.menu_key,
    m.menu_label,
    m.menu_group,
    p.permission_key,
    p.name,
    p.permission_level
FROM menu_items m
LEFT JOIN permissions p ON m.menu_item_key = p.menu_item_key
WHERE m.is_active = true
    AND (p.is_active = true OR p.id IS NULL)
ORDER BY m.menu_group, m.display_order, p.permission_level;
```

### Get Role Permissions with Menu Mapping

```sql
SELECT 
    r.role_name,
    m.menu_group,
    m.menu_label,
    p.permission_key,
    p.name as permission_name,
    p.permission_level,
    rp.has_permission
FROM roles r
CROSS JOIN menu_items m
LEFT JOIN permissions p ON m.required_permission_key = p.permission_key
LEFT JOIN role_permissions rp ON r.role_name = rp.role_name 
    AND p.permission_key = rp.permission_key
WHERE r.is_active = true
    AND m.is_active = true
    AND (m.is_always_visible = true OR p.permission_key IS NOT NULL)
ORDER BY r.role_name, m.menu_group, m.display_order;
```

---

## Implementation Notes

### 1. Migration Strategy

1. **Create Tables:** Run Prisma migration or SQL schema
2. **Seed Permissions:** Insert all 52 permissions from the master table
3. **Seed Menu Items:** Insert all 21 menu items
4. **Seed Role Permissions:** Insert role-permission mappings
5. **Update Application Code:** Update `use-permissions.ts` to query database instead of hardcoded constants

### 2. Backward Compatibility

- Keep existing `PERMISSIONS` and `ROLE_PERMISSIONS` constants as fallback
- Gradually migrate to database-driven permissions
- Use feature flag to switch between hardcoded and database permissions

### 3. Performance Considerations

- **Caching:** Cache role permissions in Redis/memory (TTL: 5-15 minutes)
- **Indexing:** Ensure all foreign keys and frequently queried columns are indexed
- **Query Optimization:** Use JOINs efficiently, avoid N+1 queries

### 4. Security Considerations

- **Audit Trail:** `granted_by` and `granted_at` fields track who granted permissions
- **System Permissions:** `is_system = true` prevents deletion of critical permissions
- **Soft Deletes:** Use `is_active` flag instead of hard deletes
- **Validation:** Validate permission keys before assignment

### 5. API Endpoints Needed

```
GET    /api/permissions                    - List all permissions
GET    /api/permissions/:id                 - Get permission details
GET    /api/menu-items                     - List all menu items (filtered by role)
GET    /api/roles                          - List all roles
GET    /api/roles/:role/permissions         - Get permissions for a role
POST   /api/roles/:role/permissions         - Assign permissions to role
DELETE /api/roles/:role/permissions/:perm   - Remove permission from role
GET    /api/users/:userId/permissions       - Get effective permissions for user
```

### 6. Frontend Integration

- Update `use-permissions.ts` hook to fetch from API
- Cache permissions in React context/state
- Update sidebar to query menu items from API
- Implement permission checking at component level

### 7. Database Seeding Script

Create a seed script to populate initial data:

```typescript
// prisma/seed.ts or scripts/seed-rbac.ts
async function seedRBAC() {
  // 1. Seed Permissions (52 records)
  // 2. Seed Menu Items (21 records)
  // 3. Seed Roles (5 records)
  // 4. Seed Role Permissions (118 records total)
}
```

### 8. Testing Strategy

- **Unit Tests:** Test permission checking logic
- **Integration Tests:** Test API endpoints
- **E2E Tests:** Test role-based UI visibility
- **Performance Tests:** Test query performance with large datasets

---

## Summary

This RBAC database design provides:

✅ **52 granular permissions** mapped to 21 menu items  
✅ **5 roles** with different permission levels  
✅ **Flexible permission hierarchy** (view → manage → admin)  
✅ **Menu visibility control** based on permissions  
✅ **Audit trail** for permission grants  
✅ **Scalable structure** for future permissions/roles  
✅ **Performance optimized** with proper indexing  

**Next Steps:**
1. Review and approve this schema
2. Create Prisma migration
3. Create seed script
4. Implement API endpoints
5. Update frontend to use database-driven permissions
6. Test thoroughly before production deployment

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Author:** System Design  
**Status:** Draft - Pending Review

