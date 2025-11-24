# Unused Packages (Removed but kept for reference)

This document tracks packages that were removed from the project but may be needed in the future.

## Removed Packages

### Table & Data Management
- **@tanstack/react-table** (^8.21.3) - Advanced table component library
  - Reason: Not currently used in the codebase
  - Use case: If you need advanced table features like column resizing, virtualization, or complex sorting

### Charting Libraries
- **echarts** (^5.6.0) - Powerful charting library
- **echarts-for-react** (^3.0.2) - React wrapper for ECharts
  - Reason: Not currently used in the codebase
  - Use case: If you need more advanced charting features than what's currently available

- **recharts** (^3.3.0) - ✅ **NOW IN USE** - Composable charting library built on React components
  - Status: Currently used for Hourly Request Volume chart in Usage Analytics page
  - Simple, React-friendly charting solution

### Real-time Communication
- **socket.io-client** (^4.8.1) - WebSocket client library
  - Reason: Not currently used (only comments about WebSocket exist)
  - Use case: If you need real-time features like live updates, notifications, or chat

### UI Components
- **vaul** (^1.1.2) - Drawer component library
  - Reason: Not currently used
  - Use case: If you need drawer/sheet components for mobile navigation or side panels

- **cmdk** (^1.1.1) - Command menu component
  - Reason: Not currently used
  - Use case: If you need a command palette (Cmd+K) feature

- **@radix-ui/react-toast** (^1.2.15) - Toast notification component
  - Reason: Using `sonner` instead for toast notifications
  - Use case: If you want to switch from sonner to Radix UI toasts

- **@radix-ui/react-tooltip** (^1.2.8) - Tooltip component
  - Reason: Not currently used
  - Use case: If you need tooltip components in the future

### Form Management
- **react-hook-form** (^7.65.0) - Performant forms library
- **@hookform/resolvers** (^5.2.2) - Validation resolvers for react-hook-form
- **zod** (^4.1.12) - TypeScript-first schema validation
  - Reason: Not currently used in the codebase
  - Use case: If you need form validation, complex forms, or schema validation

## Reinstallation

If you need to reinstall any of these packages in the future:

```bash
# Table
npm install @tanstack/react-table

# Charts
npm install echarts echarts-for-react
# OR
npm install recharts

# Real-time
npm install socket.io-client

# UI Components
npm install vaul
npm install cmdk
npm install @radix-ui/react-toast
npm install @radix-ui/react-tooltip

# Forms
npm install react-hook-form @hookform/resolvers zod
```

## Notes

- All packages were removed on: December 2024
- The project currently uses:
  - **sonner** for toast notifications (instead of @radix-ui/react-toast)
  - **date-fns** for date formatting
  - **react-day-picker** for calendar components
  - **@tanstack/react-query** for data fetching
  - **zustand** for state management

