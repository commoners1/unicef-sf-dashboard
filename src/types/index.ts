// Environment Configuration
export interface EnvironmentConfig {
  id: string;
  name: string;
  apiUrl: string;
  wsUrl: string;
  isProduction: boolean;
  features: {
    realTimeLogs: boolean;
    advancedAnalytics: boolean;
    queueManagement: boolean;
  };
  limits: {
    maxApiCalls: number;
    maxUsers: number;
    retentionDays: number;
  };
}

// System Health
export interface SystemHealth {
  api: HealthStatus;
  database: HealthStatus;
  redis: HealthStatus;
  queue: HealthStatus;
}

export interface HealthStatus {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastChecked: string;
  responseTime?: number;
}

// Metrics
export interface MetricsData {
  timestamp: string;
  apiCalls: number;
  responseTime: number;
  errorRate: number;
  queueDepth: number;
}

// Queue Management
export interface QueueStatus {
  salesforce: QueueInfo;
  email: QueueInfo;
  notifications: QueueInfo;
}

export interface QueueInfo {
  name: string;
  size: number;
  processing: number;
  completed: number;
  failed: number;
  isPaused: boolean;
  processingRate: number;
}

export interface Job {
  id: string;
  queueName: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  data: any;
  createdAt: string;
  processedAt?: string;
  error?: string;
  retryCount: number;
  duration?: number;
}

// User Management
export interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  apiKeyCount?: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  userId: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
}

// Logs
export interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  source: string;
  metadata?: Record<string, any>;
}

// Analytics
export interface PerformanceMetrics {
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: number;
  errorRate: number;
  uptime: number;
}

export interface BusinessMetrics {
  totalApiCalls: number;
  uniqueUsers: number;
  revenue: number;
  growthRate: number;
}

// Dashboard Store
export interface DashboardStore {
  // Environment
  currentEnvironment: EnvironmentConfig;
  environments: EnvironmentConfig[];
  switchEnvironment: (envId: string) => void;

  // System Health
  systemHealth: SystemHealth | null;
  updateSystemHealth: (health: SystemHealth) => void;

  // Metrics
  metrics: MetricsData | null;
  updateMetrics: (metrics: MetricsData) => void;

  // Queue Status
  queueStatus: QueueStatus | null;
  updateQueueStatus: (status: QueueStatus) => void;

  // User Management
  users: User[];
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;

  // API Keys
  apiKeys: ApiKey[];
  selectedApiKey: ApiKey | null;
  setSelectedApiKey: (key: ApiKey | null) => void;

  // Logs
  logs: LogEntry[];
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;

  // UI State
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// WebSocket Events
export interface DashboardEvents {
  'system:health:update': SystemHealth;
  'metrics:update': MetricsData;
  'queue:job:completed': {
    queueName: string;
    jobId: string;
    duration: number;
    result: any;
  };
  'queue:job:failed': {
    queueName: string;
    jobId: string;
    error: string;
    retryCount: number;
  };
  'log:new': LogEntry;
  'user:login': {
    userId: string;
    email: string;
    ipAddress: string;
    timestamp: string;
  };
  'user:logout': {
    userId: string;
    timestamp: string;
  };
}
