# SF Dashboard - Salesforce Middleware Admin Dashboard

A comprehensive admin dashboard for the Salesforce Middleware API, built with React, TypeScript, and modern web technologies.

## 🚀 Features

### ✅ Implemented
- **Dashboard Overview** - System health monitoring with real-time metrics and KPIs
- **User Management** - Complete user and API key management interface with role-based access control
- **Queue Management** - Monitor and control background job processing
- **Jobs Management** - Detailed job tracking and job details view
- **Cron Jobs** - Monitor and manage scheduled Salesforce cron jobs (pledge and one-off)
- **Endpoint Management** - Comprehensive API endpoint documentation and monitoring
- **Audit Logs** - Complete audit trail with filtering and search capabilities
- **Salesforce Logs** - Monitor Salesforce integration logs and responses
- **Live Logs** - Real-time log streaming with filtering and search
- **Error Tracking** - Error tracking dashboard (SUPER_ADMIN only) with detailed error views
- **Usage Analytics** - API usage statistics, hourly trends, and top endpoints
- **Performance Monitoring** - System performance metrics and queue health monitoring
- **Reports** - Generate and export system reports
- **Permissions Management** - Role-based access control (RBAC) management
- **Environment Switching** - Seamlessly switch between staging and production
- **Export Features** - Export data in CSV and JSON formats
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Dark/Light Theme** - Toggle between themes
- **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- **Secure Storage** - AES-GCM encryption for sensitive data storage

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with hooks and concurrent features
- **TypeScript 5.9** - Type-safe development
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons

### State Management
- **Zustand 5** - Lightweight state management
- **React Query (TanStack Query) 5** - Server state management and caching

### Charts & Visualization
- **Recharts 3** - Composable charting library

### Utilities
- **Axios 1.13** - HTTP client for API requests
- **date-fns 4** - Date utility library
- **ExcelJS 4** - Excel file generation for exports
- **Sonner** - Toast notifications

### Security
- **Web Crypto API** - AES-GCM encryption for secure data storage
- **HttpOnly Cookies** - Secure session management

## 📁 Project Structure

```
src/
├── app/                 # App configuration and providers
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── layout/         # Layout components (header, sidebar, footer)
│   ├── shared/         # Shared components (tables, filters, etc.)
│   └── tables/         # Table components
├── features/           # Feature-based modules
│   ├── auth/           # Authentication feature
│   ├── dashboard/      # Dashboard feature
│   └── users/          # User management feature
├── pages/              # Page components
│   ├── overview.tsx    # Dashboard overview
│   ├── dashboard.tsx   # Main dashboard
│   ├── users.tsx       # User management
│   ├── queue-simple.tsx # Queue management
│   ├── jobs.tsx        # Jobs management
│   ├── cron-jobs.tsx   # Cron jobs management
│   ├── endpoints.tsx   # Endpoint documentation
│   ├── audit-logs.tsx  # Audit logs
│   ├── errors.tsx      # Error tracking
│   └── ...             # Other pages
├── hooks/              # Custom React hooks
│   └── queries/        # React Query hooks
├── services/           # API services
│   └── api/            # API client services
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
├── config/             # Configuration files
├── constants/          # Application constants
├── lib/                # Utility functions and libraries
├── router/             # Routing configuration
└── utils/              # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+ or pnpm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sf-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3001
   ```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎨 UI Components

The dashboard uses shadcn/ui components with custom styling:

- **Cards** - For displaying metrics and content
- **Tables** - For data display with sorting and filtering
- **Buttons** - Various button styles and states
- **Badges** - Status indicators and labels
- **Dropdowns** - Context menus and selectors
- **Progress** - Progress bars and loading indicators
- **Scroll Areas** - Custom scrollable containers

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```bash
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=SF Middleware Dashboard
VITE_APP_VERSION=1.3.0
```

### Environment Switching

The dashboard supports multiple environments:

- **Development** - Local development server
- **Staging** - Staging environment
- **Production** - Production environment

Switch environments using the environment selector in the header.

## 📊 Dashboard Pages

### Overview & Dashboard
- System health status cards
- Key metrics and KPIs
- Real-time charts and graphs
- Queue status overview
- Performance metrics

### User Management
- User list with search and filtering
- User details and profile management
- Role-based access control (RBAC)
- API key management
- User statistics and activity

### Queue & Jobs Management
- Queue status monitoring
- Job processing controls
- Failed job retry
- Queue performance metrics
- Detailed job views
- Job history tracking

### Cron Jobs
- Monitor pledge cron jobs
- Track one-off cron job execution
- View undelivered cron job items
- Salesforce cron job integration

### Endpoints
- Comprehensive API endpoint documentation
- Endpoint categorization and filtering
- Authentication requirements display
- Method and path information

### Logs & Monitoring
- **Audit Logs** - Complete audit trail with advanced filtering
- **Salesforce Logs** - Monitor Salesforce integration activity
- **Live Logs** - Real-time log streaming
- **Monitoring** - System health and performance monitoring
- Log level filtering and search functionality
- Export capabilities (CSV, JSON)

### Error Tracking (SUPER_ADMIN only)
- Error dashboard with detailed error information
- Error details view with full context
- Error filtering and search
- Mobile-optimized error displays

### Analytics & Reports
- **Usage Analytics** - API usage statistics, hourly trends
- **Performance** - System performance metrics
- **Reports** - Generate and export system reports
- Top endpoints and user activity tracking

### Administration
- **Permissions** - Role-based access control management
- **API Keys** - API key management interface
- **Settings** - System configuration
- **Notifications** - Notification management

## 🎯 Key Features

### Real-time Updates
- WebSocket integration ready
- Live metrics updates
- Real-time log streaming
- Queue status monitoring

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Collapsible sidebar
- Adaptive layouts

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- High contrast support

## 🔒 Security

### Authentication & Authorization
- **JWT-based authentication** - Secure token-based authentication
- **Role-based access control (RBAC)** - Fine-grained permission system
- **HttpOnly Cookies** - Secure session management
- **API key management** - Secure API key generation and rotation

### Data Security
- **AES-GCM encryption** - All sensitive data encrypted using Web Crypto API (256-bit)
- **Secure storage** - Minimal data storage with automatic encryption
- **Data minimization** - Only non-sensitive data stored locally
- **Session timeout** - Automatic cleanup after 30 minutes of inactivity
- **Complete logout** - Secure cleanup of all authentication data

### Security Features
- Comprehensive input validation and sanitization
- CSRF protection for state-changing operations
- Client-side rate limiting
- Security event logging
- Enhanced error handling
- Secure environment switching

### Security Improvements (v1.3.0)
- Removed sensitive data (email, roles) from localStorage
- Implemented automatic storage migration for encrypted data
- Added session timeout protection
- Enhanced mobile security for error tracking

## 🚀 Deployment

### Docker (Recommended)

```bash
# Build Docker image
docker build -t sf-dashboard .

# Run container
docker run -p 3001:3001 sf-dashboard
```

### Static Hosting

```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting provider
```

## 📈 Performance

- **Bundle Size** - Optimized with code splitting
- **Loading Time** - < 3 seconds initial load
- **Runtime Performance** - 60fps animations
- **Memory Usage** - Efficient state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

**Author:** Freyza Kusuma

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory, organized by category:

- **[Documentation Index](./docs/README.md)** - Start here for navigation
- **User Guides** - `docs/user/` - Admin guides and feature documentation
- **Development** - `docs/development/` - Architecture, structure, testing guides
- **Deployment** - `docs/deployment/` - Environment setup and deployment guides
- **API** - `docs/api/` - API integration documentation
- **Security** - `docs/security/` - Security assessments and best practices

For detailed changelog and release notes, see [CHANGELOG.md](./CHANGELOG.md).

## 📝 Version Information

Current version: **1.3.0** (as of November 2025)

See [CHANGELOG.md](./CHANGELOG.md) for detailed release notes and changes.

## 🔄 Recent Updates (v1.3.0)

### Security Enhancements
- ✅ AES-GCM encryption for all stored data
- ✅ Removed sensitive data from localStorage
- ✅ Session timeout protection
- ✅ Automatic storage migration

### Features
- ✅ Error tracking dashboard (SUPER_ADMIN only)
- ✅ Cron jobs management
- ✅ Enhanced mobile responsiveness
- ✅ Improved export capabilities

---

**Built with ❤️ for the Salesforce Middleware project**
