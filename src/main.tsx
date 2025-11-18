import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';
import { initializeTheme } from '@/components/theme-provider';
import { migrateStorage } from '@/utils/storage-migration';
import { initializeSessionTimeout } from '@/utils/session-timeout';

// Initialize theme before React renders to prevent flash of wrong theme
initializeTheme();

// SECURITY: Migrate old unencrypted localStorage data to secure format
// This removes sensitive data (email, role) and encrypts remaining data
migrateStorage().catch(error => {
  console.error('Storage migration failed:', error);
});

// SECURITY: Initialize session timeout monitoring
// Automatically clears sensitive data after 30 minutes of inactivity
initializeSessionTimeout();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
