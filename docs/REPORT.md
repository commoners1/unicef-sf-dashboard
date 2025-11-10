# Salesforce Middleware Migration Report
## UNICEF Website Server - PCI DSS Compliance & Microservice Implementation

**Project:** Salesforce Connection Migration & Microservice Architecture  
**Date:** November 2025  
**Status:** Completed

---

## Overall Goal

- Fix salesforce connection issue due to stricted PCI DSS system on the UNICEF Website Server.

- Implement microservice method to reduce UNICEF Website Server load, ease the system itself

- Handle huge loads to and from salesforce endpoint.

---

## Issue

- UNICEF Server having a connection issue to the sesapim.azure-api.net. 

- Using secondary IP was not working, showing the error OPENSSL SYS ERROR.

- IP Blocked from Microsoft side, so we cannot connect to the salesforce API.

### Root Cause Analysis

The primary issues identified were:

1. **Network Connectivity Issues**: The UNICEF server was unable to establish a reliable connection to the Azure API Management endpoint (`sesapim.azure-api.net`).

2. **IP Blocking**: Microsoft/Azure had blocked the UNICEF server's IP address, preventing any connection attempts.

3. **PCI DSS Compliance Constraints**: The strict PCI DSS compliance requirements on the UNICEF server limited network configurations and made troubleshooting connection issues more complex.

4. **SSL/TLS Errors**: OPENSSL SYS ERROR indicated underlying SSL/TLS handshake failures, likely due to certificate validation or network routing issues.

5. **System Load**: The existing monolithic architecture placed additional load on the UNICEF server, making it difficult to handle high-volume Salesforce transactions efficiently.

---

## Solution

- Make new systems, role as the REST API and worker/cron job for connecting to salesforce API, in a new server from Biznet Server. 

- Make Dashboard for monitoring and analyzing the process and report as well as log for that system.

- Move cronjob for salesforce transaction, from current UNICEF server to the new server in Biznet Server

- Make documentation for user guide

### Implementation Details

#### 1. Microservice Architecture

Created a dedicated middleware service hosted on Biznet Server that acts as an intermediary between the UNICEF Website Server and Salesforce API:

- **REST API Layer**: Provides clean, standardized endpoints for Salesforce operations
- **Queue System**: Implements BullMQ for asynchronous job processing and handling high-volume transactions
- **Worker Processes**: Dedicated workers process Salesforce API calls with retry mechanisms and error handling
- **Cron Job Management**: Centralized cron job execution for scheduled Salesforce transactions

#### 2. Dashboard & Monitoring System

Developed a comprehensive monitoring dashboard with the following capabilities:

- **Real-time Monitoring**: Live monitoring of API calls, job queues, and system health
- **Analytics & Reporting**: Detailed analytics on transaction volumes, success rates, and performance metrics
- **Error Tracking**: Comprehensive error logging and tracking with resolution workflows
- **Audit Logging**: Complete audit trail of all API calls and system operations
- **User Management**: Role-based access control (USER, ADMIN, SUPER_ADMIN)

#### 3. Migration Strategy

- **Cron Job Migration**: Successfully migrated all Salesforce-related cron jobs from UNICEF server to the new Biznet server
- **API Integration**: UNICEF Website Server now communicates with the middleware API instead of directly with Salesforce
- **Environment Separation**: Implemented multi-environment support (development, staging, production, production2)

#### 4. Documentation

Comprehensive documentation created including:

- API Documentation
- User Guide
- Architecture Documentation
- Deployment Guides
- Security & Error Handling Best Practices
- Monitoring & Troubleshooting Guides

---

## Diagram or Flowchart

### System Architecture Flow

```mermaid
graph TB
    subgraph "UNICEF Website Server"
        A[UNICEF CMS] --> B[Payment Processing]
        B -->|Request| C[API Call to Middleware]
        C -->|Response| B
        B --> A
    end
    
    subgraph "Biznet Server - Middleware Service"
        C -->|Request| D[REST API Layer]
        D --> E[Authentication & Authorization]
        E --> F[Rate Limiting]
        F --> G[Queue System - BullMQ]
        G --> H[Worker Processes]
        H --> I[Salesforce Service]
        I -->|Request| J[Azure API Management]
        J -->|Request| K[Salesforce API]
        K -->|Response| J
        J -->|Response| I
        I -->|Response| H
        H -->|Update Status| G
        G -->|Store Result| M[PostgreSQL Database]
        D -->|Query Result| M
        D -->|Response| C
        
        G --> L[Redis Cache]
        D --> M
        M --> N[Audit Logs]
        M --> O[Job Tracking]
        M --> P[Error Logs]
    end
    
    subgraph "Monitoring Dashboard"
        Q[Dashboard UI] --> R[Real-time Metrics]
        Q --> S[Error Tracking]
        Q --> T[Audit Reports]
        Q --> U[Performance Analytics]
        M --> Q
        L --> Q
    end
    
    subgraph "Cron Jobs"
        V[Scheduled Jobs] --> G
        V --> W[Token Refresh]
        V --> X[Data Sync]
    end
    
    style A fill:#e1f5ff
    style K fill:#ffebee
    style Q fill:#f3e5f5
    style G fill:#fff3e0
```

### Request-Response Flow Diagram

```mermaid
sequenceDiagram
    participant UC as UNICEF CMS
    participant MW as Middleware API
    participant Q as Queue System
    participant W as Worker
    participant SF as Salesforce API
    participant DB as Database
    participant Dash as Dashboard
    
    Note over UC,SF: Request Flow
    UC->>MW: 1. API Request (with API Key)
    MW->>MW: 2. Validate API Key
    MW->>MW: 3. Check Rate Limits
    MW->>DB: 4. Log Request (Audit)
    MW->>Q: 5. Add Job to Queue
    MW->>DB: 6. Store Job (JobAudit)
    MW-->>UC: 7. Immediate Response (Job ID/Status)
    
    Note over Q,SF: Processing Flow
    Q->>W: 8. Process Job
    W->>DB: 9. Update Job Status (processing)
    W->>SF: 10. Call Salesforce API
    SF-->>W: 11. Salesforce Response
    
    Note over W,UC: Response Flow
    W->>DB: 12. Update Job Status (completed)
    W->>DB: 13. Store Response Data
    W->>DB: 14. Update Audit Log (response)
    W->>Dash: 15. Update Metrics
    W->>Q: 16. Mark Job Complete
    
    Note over UC,MW: Result Retrieval
    UC->>MW: 17. Poll/Query Job Status (optional)
    MW->>DB: 18. Query Job Result
    DB-->>MW: 19. Return Job Result
    MW-->>UC: 20. Return Response Data
    
    Note over Dash: Real-time Monitoring
    Dash->>DB: Query Metrics
    DB-->>Dash: Analytics Data
```

---

## ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    User ||--o{ ApiKey : "has"
    User ||--o{ AuditLog : "creates"
    User ||--o{ Report : "generates"
    User ||--o{ ErrorLog : "triggers"
    
    ApiKey ||--o{ AuditLog : "used_in"
    
    User {
        string id PK
        string email UK
        string name
        string company
        string password
        enum role
        boolean isActive
        int failedLoginAttempts
        datetime lastFailedLogin
        datetime createdAt
        datetime updatedAt
    }
    
    ApiKey {
        string id PK
        string key
        string keyHash UK
        string name
        string description
        boolean isActive
        string[] permissions
        string environment
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    AuditLog {
        string id PK
        string userId FK
        string apiKeyId FK
        string action
        string endpoint
        string method
        string type
        json requestData
        json responseData
        int statusCode
        string ipAddress
        string userAgent
        int duration
        boolean isDelivered
        datetime createdAt
    }
    
    JobAudit {
        string id PK
        string idempotencyKey UK
        json payload
        string status
        int attempts
        string sfStatus
        json sfResponse
        string errorMessage
        datetime createdAt
        datetime updatedAt
    }
    
    Report {
        string id PK
        string name
        string type
        string description
        string filePath
        string format
        string status
        int size
        string schedule
        datetime lastGenerated
        datetime createdAt
        datetime updatedAt
        string userId FK
    }
    
    SystemSetting {
        string id PK
        string category
        string key
        string value
        string valueType
        datetime updatedAt
        datetime createdAt
    }
    
    ErrorLog {
        string id PK
        string message
        string type
        string source
        string stackTrace
        string userId FK
        string userAgent
        string ipAddress
        string url
        string method
        int statusCode
        datetime timestamp
        boolean resolved
        datetime resolvedAt
        string resolvedBy
        string[] tags
        string environment
        json metadata
        int occurrences
        datetime firstSeen
        datetime lastSeen
        datetime createdAt
        datetime updatedAt
    }
```

### Database Schema Overview

**Core Entities:**

1. **User**: Manages user accounts with role-based access control (USER, ADMIN, SUPER_ADMIN)
2. **ApiKey**: Environment-specific API keys (development, staging, production) with SHA-256 hash validation
3. **AuditLog**: Comprehensive audit trail for all API calls with delivery tracking
4. **JobAudit**: Job queue tracking with status, attempts, and Salesforce responses
5. **Report**: Report generation and management system
6. **SystemSetting**: Runtime configuration settings including maintenance mode
7. **ErrorLog**: Error tracking with resolution workflow and occurrence tracking

**Key Relationships:**

- One User can have multiple API Keys (one per environment)
- One User can create multiple Audit Logs
- One API Key can be used in multiple Audit Logs
- One User can generate multiple Reports
- One User can trigger multiple Error Logs

---

## Tech Stack

### Backend (Middleware Service)

#### Core Framework & Runtime
- **Framework**: NestJS v11.0.1
- **Language**: TypeScript v5.9.3
- **Runtime**: Node.js 18+ (EA-NodeJS22 for cPanel/WHM)

#### Database & ORM
- **Database**: PostgreSQL v15 (production) / v16 (development)
- **ORM**: Prisma v6.18.0 (client) / v6.19.0 (CLI)

#### Queue & Cache
- **Queue System**: BullMQ v5.61.0
- **Cache**: Redis v7
- **Redis Client**: ioredis v5.8.2

#### HTTP Client & API
- **HTTP Client**: Axios v1.12.2
- **NestJS Axios**: @nestjs/axios v4.0.1

#### Security
- **Security Headers**: Helmet v8.1.0
- **Rate Limiting**: express-rate-limit v8.1.0
- **Password Hashing**: bcrypt v6.0.0
- **Authentication**: Passport v0.7.0, passport-jwt v4.0.1
- **JWT**: @nestjs/jwt v11.0.1

#### Monitoring & Observability
- **Metrics**: prom-client v15.1.3
- **Tracing**: @opentelemetry/api v1.9.0, @opentelemetry/sdk-node v0.207.0
- **Health Checks**: @nestjs/terminus v11.0.0

#### Validation & Utilities
- **Validation**: Zod v4.1.12, class-validator v0.14.2
- **Transformation**: class-transformer v0.5.1
- **Resilience**: cockatiel v3.2.1 (Circuit Breaker)

#### Logging
- **Logger**: pino v10.1.0
- **Pretty Logger**: pino-pretty v13.1.2

#### Scheduling
- **Cron Jobs**: @nestjs/schedule v6.0.1

#### Testing
- **Testing Framework**: Jest v30.2.0
- **NestJS Testing**: @nestjs/testing v11.1.7
- **HTTP Testing**: supertest v7.1.4
- **Alternative Testing**: vitest v3.2.4

### Frontend (Dashboard)

#### Core Framework
- **Framework**: React v19.2.0
- **Language**: TypeScript v5.9.3
- **Build Tool**: Vite v7.1.7

#### UI Components & Styling
- **UI Library**: Radix UI (Dialog, Dropdown, Select, Tabs, Toast, Tooltip, etc.)
- **Styling**: Tailwind CSS v3.4.18
- **Icons**: Lucide React v0.548.0

#### State Management & Data Fetching
- **State Management**: Zustand v5.0.8
- **Data Fetching**: TanStack Query (React Query) v5.90.5
- **Forms**: React Hook Form v7.65.0, @hookform/resolvers v5.2.2

#### Data Visualization
- **Charts**: ECharts v5.6.0, echarts-for-react v3.0.2
- **Alternative Charts**: Recharts v3.3.0

#### Tables & Data Display
- **Table Component**: @tanstack/react-table v8.21.3

#### Real-time Communication
- **WebSocket**: socket.io-client v4.8.1

#### HTTP Client
- **HTTP Client**: Axios v1.13.0

#### Routing
- **Router**: React Router DOM v7.9.4

#### Utilities
- **Date Handling**: date-fns v4.1.0
- **Validation**: Zod v4.1.12
- **Utilities**: clsx v2.1.1, tailwind-merge v3.3.1
- **Notifications**: Sonner v2.0.7

### Infrastructure & Deployment

#### Containerization
- **Docker**: Multi-container orchestration
- **Docker Compose**: Environment-specific configurations

#### Process Management
- **PM2**: Process manager for Node.js applications (production)

#### Web Server & Load Balancing
- **Nginx**: Reverse proxy and load balancer

#### Hosting Platform
- **cPanel/WHM**: Hosting platform support for production deployment

#### Monitoring Backend
- **Prometheus**: Metrics collection
- **Jaeger**: Distributed tracing (development)
- **OpenTelemetry**: Distributed tracing standards

#### Database Administration
- **Adminer**: Database administration tool (development)

### Architecture Patterns

- **Modular Architecture**: Clean separation of concerns
- **Dependency Injection**: NestJS built-in DI container
- **Repository Pattern**: Data access abstraction
- **Queue Pattern**: Asynchronous job processing
- **Guard Pattern**: Authentication and authorization
- **Circuit Breaker Pattern**: Resilience against failures

### Performance & Scalability

- **High Volume Processing**: Handles 450k+ jobs/day
- **Redis Cluster**: 3-node Redis cluster for high availability
- **PostgreSQL Optimization**: Indexed queries and optimized schema
- **Batch Processing**: Efficient batch operations for bulk transactions
- **Connection Pooling**: Optimized database connections
- **Rate Limiting**: Protection against API abuse

---

## Challenge

### Technical Challenges

1. **Network Connectivity & IP Blocking**
   - **Challenge**: UNICEF server IP was blocked by Microsoft/Azure, preventing direct connection to Salesforce API
   - **Solution**: Deployed middleware on Biznet Server with different IP range, bypassing the block
   - **Impact**: Required complete architecture redesign and server migration

2. **PCI DSS Compliance**
   - **Challenge**: Strict PCI DSS compliance requirements on UNICEF server limited network configurations and troubleshooting capabilities
   - **Solution**: Separated Salesforce integration to dedicated middleware service, reducing PCI DSS scope on main server
   - **Impact**: Improved compliance posture while maintaining functionality

3. **High Volume Transaction Handling**
   - **Challenge**: Need to handle 450k+ jobs/day with reliable processing and minimal latency
   - **Solution**: Implemented BullMQ queue system with Redis, worker processes, and batch processing
   - **Impact**: Achieved scalable, reliable high-volume processing

4. **SSL/TLS Certificate Issues**
   - **Challenge**: OPENSSL SYS ERROR indicated SSL/TLS handshake failures
   - **Solution**: Proper certificate management in middleware service, with configurable SSL validation
   - **Impact**: Resolved connection issues and improved security

5. **Multi-Environment Management**
   - **Challenge**: Managing multiple environments (development, staging, production, production2) with different configurations
   - **Solution**: Environment-specific configurations, API keys, and deployment scripts
   - **Impact**: Streamlined deployment and testing processes

6. **Error Handling & Resilience**
   - **Challenge**: Ensuring reliable processing despite network issues, API failures, and transient errors
   - **Solution**: Implemented retry mechanisms, circuit breakers, comprehensive error logging, and job status tracking
   - **Impact**: Improved system reliability and easier troubleshooting

7. **Real-time Monitoring & Observability**
   - **Challenge**: Need for comprehensive monitoring, logging, and analytics without impacting performance
   - **Solution**: Built dashboard with real-time metrics, audit logging, error tracking, and performance monitoring
   - **Impact**: Improved visibility and faster issue resolution

8. **Migration from Monolithic to Microservice**
   - **Challenge**: Migrating cron jobs and API calls from UNICEF server to new middleware without downtime
   - **Solution**: Phased migration approach with comprehensive testing and rollback plans
   - **Impact**: Successful migration with minimal disruption

9. **Security & Authentication**
   - **Challenge**: Implementing secure API key management and authentication across multiple environments
   - **Solution**: Environment-specific API keys with SHA-256 hash validation, JWT authentication, and role-based access control
   - **Impact**: Enhanced security and access control

10. **Documentation & Knowledge Transfer**
    - **Challenge**: Creating comprehensive documentation for users, developers, and operations team
    - **Solution**: Developed extensive documentation including API docs, user guides, architecture docs, and deployment guides
    - **Impact**: Improved maintainability and knowledge transfer

### Operational Challenges

1. **Server Migration**: Coordinating migration from UNICEF server to Biznet server
2. **Cron Job Migration**: Ensuring all scheduled jobs are properly migrated and tested
3. **API Integration**: Updating UNICEF CMS to use new middleware API endpoints
4. **Monitoring Setup**: Establishing monitoring and alerting for new infrastructure
5. **Performance Optimization**: Tuning system for high-volume processing
6. **Disaster Recovery**: Implementing backup and recovery procedures

---

## Next Plan

- Monitoring the salesforce every week

- Fix immediately if there is an error

- Optimize the system if needed for improving the system

- Daily check of new server, and check the salesforce response on UNICEF CMS.

### Detailed Next Steps

#### 1. Ongoing Monitoring & Maintenance

**Weekly Tasks:**
- Review Salesforce API connection health and response times
- Analyze error logs and identify patterns
- Check queue processing metrics and job success rates
- Review performance metrics and identify bottlenecks
- Verify audit logs for compliance and security

**Daily Tasks:**
- Check new server health and resource utilization
- Monitor Salesforce API response status on UNICEF CMS
- Review error logs for critical issues
- Verify cron job execution and status
- Check database performance and connection pools

#### 2. Error Resolution & Support

**Immediate Response:**
- Implement automated alerting for critical errors
- Establish on-call rotation for 24/7 support
- Create runbooks for common error scenarios
- Set up automated error notification system
- Implement automatic retry mechanisms for transient failures

**Error Resolution Process:**
- Categorize errors by severity (critical, high, medium, low)
- Prioritize resolution based on impact and urgency
- Document resolution steps and lessons learned
- Update error handling procedures based on findings

#### 3. System Optimization

**Performance Optimization:**
- Monitor and optimize database queries and indexes
- Review and optimize queue processing rates
- Implement caching strategies where applicable
- Optimize API response times
- Review and optimize resource utilization (CPU, memory, network)

**Scalability Improvements:**
- Plan for horizontal scaling if volume increases
- Optimize Redis cluster configuration
- Review and optimize PostgreSQL configuration
- Implement load balancing strategies
- Plan for multi-region deployment if needed

#### 4. Feature Enhancements

**Dashboard Improvements:**
- Add more detailed analytics and reporting
- Implement custom alerting rules
- Add export capabilities for reports
- Enhance real-time monitoring features
- Add predictive analytics for capacity planning

**API Enhancements:**
- Add new Salesforce API endpoints as needed
- Implement batch processing optimizations
- Add webhook support for real-time notifications
- Enhance error handling and retry mechanisms
- Add API versioning support

#### 5. Security & Compliance

**Security Hardening:**
- Regular security audits and vulnerability assessments
- Implement security best practices
- Review and update API key management
- Enhance authentication and authorization
- Implement data encryption at rest and in transit

**Compliance:**
- Ensure PCI DSS compliance is maintained
- Regular compliance audits
- Update documentation for compliance requirements
- Implement audit logging enhancements
- Review and update data retention policies

#### 6. Documentation & Training

**Documentation Updates:**
- Keep documentation up to date with system changes
- Add troubleshooting guides for common issues
- Update API documentation with new endpoints
- Create video tutorials for dashboard usage
- Maintain architecture documentation

**Training:**
- Provide training for operations team
- Create knowledge base articles
- Conduct regular knowledge sharing sessions
- Document lessons learned and best practices

#### 7. Disaster Recovery & Backup

**Backup Strategy:**
- Implement automated database backups
- Regular backup testing and verification
- Document backup and recovery procedures
- Implement disaster recovery plan
- Test disaster recovery procedures regularly

#### 8. Future Improvements

**Technology Upgrades:**
- Plan for framework and dependency updates
- Evaluate new technologies for performance improvements
- Consider migrating to newer infrastructure platforms
- Evaluate cloud-native solutions

**Architecture Evolution:**
- Plan for microservice further decomposition if needed
- Evaluate event-driven architecture patterns
- Consider implementing API gateway
- Plan for multi-cloud deployment if needed

---

## Conclusion

The Salesforce middleware migration project successfully addressed the connection issues between the UNICEF Website Server and Salesforce API by implementing a microservice architecture on Biznet Server. The solution provides:

- **Reliability**: Robust error handling, retry mechanisms, and monitoring
- **Scalability**: Handles 450k+ jobs/day with room for growth
- **Security**: Environment-specific API keys, authentication, and audit logging
- **Observability**: Comprehensive monitoring dashboard and logging
- **Maintainability**: Well-documented, modular architecture

The migration has successfully reduced the load on the UNICEF server, improved system reliability, and provided a foundation for future enhancements and scaling.

---

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Author:** Development Team  
**Status:** Completed

