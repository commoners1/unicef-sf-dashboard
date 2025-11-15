import { useEffect } from 'react';
import { useDashboardStore } from '@/features/dashboard';

/**
 * Theme Provider Component
 * Applies the dark/light theme class to the document element
 * based on the theme state in the dashboard store
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useDashboardStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first to avoid conflicts
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Also set a data attribute for potential CSS selectors
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}

/**
 * Initialize theme on app load (runs before React hydration)
 * This prevents flash of wrong theme on initial page load
 */
export function initializeTheme() {
  // Get theme from store (will read from localStorage if persisted)
  const theme = useDashboardStore.getState().theme;
  const root = document.documentElement;
  
  // Remove both classes first
  root.classList.remove('light', 'dark');
  
  // Add the current theme class
  root.classList.add(theme);
  root.setAttribute('data-theme', theme);
}

