# Environment Switching Guide

## Overview

The SF Dashboard now supports **runtime environment switching**, allowing you to run the app locally while connecting to different API environments (local, staging, or production) without rebuilding.

## How It Works

The application uses a dynamic API client that reads the current environment from the Zustand store. When you switch environments using the Environment Selector in the UI, all API calls automatically use the new environment's URL.

## Setup

### 1. Environment Configuration

Environments are configured in `src/config/environments.ts`. The default environments are:

- **Development**: `http://localhost:3000`
- **Staging**: `https://staging-api.sf-middleware.com`
- **Production**: `https://api.sf-middleware.com`

### 2. Environment Files

Create environment files for different build modes:

- **`.env.local`** - For local development (gitignored)
- **`.env.production`** - For production builds
- **`.env.staging`** - For staging builds

Example `.env.local`:
```bash
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_APP_TITLE=SF Middleware Dashboard
VITE_APP_VERSION=1.3.1
```

> **Note**: The `VITE_API_URL` in `.env` files is only used as a fallback. The runtime environment selector takes precedence.

## Usage

### Running Locally with Local API

1. Start your local API server on `http://localhost:3000`
2. Run the dashboard:
   ```bash
   npm run dev
   ```
3. The app will default to the Development environment (localhost)

### Running Locally but Connecting to Production

1. Run the dashboard:
   ```bash
   npm run dev
   ```
2. Use the **Environment Selector** in the header to switch to "Production Environment"
3. All API calls will now go to the production API
4. You'll need valid production credentials to authenticate

### Building for Production

1. Update `.env.production` with your production URLs:
   ```bash
   VITE_API_URL=https://api.sf-middleware.com
   VITE_WS_URL=wss://api.sf-middleware.com
   ```

2. Build:
   ```bash
   npm run build
   ```
   This automatically uses `--mode production` and loads `.env.production`

3. Deploy the `dist/` folder

## Environment Selector

The Environment Selector is located in the header of the application. It shows:
- Current environment name
- Production/Staging badge
- Dropdown to switch between available environments

The selected environment is persisted in localStorage, so it will be remembered across page refreshes.

## Technical Details

### API Client

All services use the shared API client from `src/lib/api-client.ts`:

```typescript
import { getApiClient } from '@/lib/api-client';

const apiClient = getApiClient();
```

The client:
- Dynamically reads the current environment from the Zustand store
- Updates the baseURL on each request (in case environment changed)
- Includes authentication tokens automatically
- Handles 401 errors by redirecting to login

### Adding New Environments

1. Add the environment to `src/config/environments.ts`:
   ```typescript
   {
     id: 'custom',
     name: 'Custom Environment',
     apiUrl: 'https://custom-api.example.com',
     wsUrl: 'wss://custom-api.example.com',
     isProduction: false,
     // ... other config
   }
   ```

2. It will automatically appear in the Environment Selector

### WebSocket Connections

For WebSocket connections, use the helper function:

```typescript
import { getCurrentWsUrl } from '@/lib/api-client';

const wsUrl = getCurrentWsUrl();
const socket = new WebSocket(wsUrl);
```

## Best Practices

1. **Development**: Use the Development environment for local development
2. **Testing**: Use Staging environment to test against staging data
3. **Production**: Always build with `npm run build` for production deployments
4. **Security**: Never commit `.env.local` or `.env.production` with sensitive data
5. **CORS**: Ensure your API servers have CORS configured to allow requests from your dashboard domain

## Troubleshooting

### API calls still going to wrong URL
- Check that you're using `getApiClient()` from `@/lib/api-client`
- Verify the environment selector shows the correct environment
- Clear localStorage and refresh if the environment seems stuck

### CORS errors when switching environments
- The API server must allow requests from your dashboard origin
- Check browser console for specific CORS error messages
- Verify the API URL in the environment selector is correct

### Authentication issues
- Each environment may require separate authentication
- Tokens are stored per browser, not per environment
- You may need to log in again when switching environments

