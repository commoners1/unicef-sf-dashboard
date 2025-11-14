import type { EnvironmentConfig } from '@/types';

export const environments: EnvironmentConfig[] = [
  {
    id: 'staging',
    name: 'Staging Environment',
    apiUrl: 'https://staging-api.sf-middleware.com',
    wsUrl: 'wss://staging-api.sf-middleware.com',
    isProduction: false,
    features: {
      realTimeLogs: true,
      advancedAnalytics: true,
      queueManagement: true,
    },
    limits: {
      maxApiCalls: 10000,
      maxUsers: 50,
      retentionDays: 30,
    },
  },
  {
    id: 'production',
    name: 'Production Environment',
    apiUrl: 'https://transferses.unicef.id',
    wsUrl: 'wss://transferses.unicef.id',
    isProduction: true,
    features: {
      realTimeLogs: true,
      advancedAnalytics: true,
      queueManagement: true,
    },
    limits: {
      maxApiCalls: 1000000,
      maxUsers: 1000,
      retentionDays: 365,
    },
  },
  {
    id: 'development',
    name: 'Development Environment',
    apiUrl: 'http://localhost:3000',
    wsUrl: 'ws://localhost:3000',
    isProduction: false,
    features: {
      realTimeLogs: true,
      advancedAnalytics: false,
      queueManagement: true,
    },
    limits: {
      maxApiCalls: 1000,
      maxUsers: 10,
      retentionDays: 7,
    },
  },
];

export const defaultEnvironment = environments[1];
