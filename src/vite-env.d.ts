/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string

  // Application Configuration
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production'

  // API Timeout (in milliseconds)
  readonly VITE_API_TIMEOUT: string

  // Feature Flags
  readonly VITE_ENABLE_WEBSOCKETS: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_DEBUG_LOGS: string

  // Authentication
  readonly VITE_AUTH_TOKEN_KEY: string
  readonly VITE_USER_PROFILE_KEY: string

  // Dashboard Configuration
  readonly VITE_DEFAULT_PAGE_SIZE: string
  readonly VITE_MAX_PAGE_SIZE: string
  readonly VITE_AUTO_REFRESH_INTERVAL: string

  // Logging Configuration
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error'
  readonly VITE_MAX_LOG_ENTRIES: string

  // Queue Configuration
  readonly VITE_QUEUE_REFRESH_INTERVAL: string
  readonly VITE_MAX_QUEUE_JOBS_DISPLAY: string

  // Export Configuration
  readonly VITE_MAX_EXPORT_ROWS: string
  readonly VITE_EXPORT_FORMATS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
