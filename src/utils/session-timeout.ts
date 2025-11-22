/**
 * Session Timeout Utility
 * 
 * Automatically clears sensitive localStorage data after inactivity
 * Prevents data exposure on shared devices or abandoned sessions
 */

import { AuthApiService } from '@/services/api/auth/auth-api';
import { getLoginUrl, isPublicRoute } from '@/config/routes.config';

const SESSION_TIMEOUT_KEY = 'session_last_activity';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity

/**
 * Updates the last activity timestamp
 */
export function updateSessionActivity(): void {
  try {
    const timestamp = Date.now();
    // Store timestamp (not sensitive, so no encryption needed)
    localStorage.setItem(SESSION_TIMEOUT_KEY, timestamp.toString());
  } catch (error) {
    console.warn('Failed to update session activity:', error);
  }
}

/**
 * Checks if session has timed out
 */
export function isSessionExpired(): boolean {
  try {
    const lastActivity = localStorage.getItem(SESSION_TIMEOUT_KEY);
    if (!lastActivity) {
      return false; // No session started yet
    }
    
    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;
    
    return timeSinceActivity > SESSION_TIMEOUT_MS;
  } catch {
    return false;
  }
}

/**
 * Clears session data on timeout
 * Also clears backend session (httpOnly cookie) to force re-login
 */
export async function clearSessionOnTimeout(): Promise<void> {
  try {
    // SECURITY: Clear backend session first (clears httpOnly cookie)
    // This ensures user must login again even if cookie was still valid
    try {
      await AuthApiService.logout();
    } catch (error) {
      // If logout fails (network error, etc.), still clear local storage
      console.warn('Backend logout failed during session timeout:', error);
      // Continue with local cleanup
    }
    
    // Clear all authentication-related storage
    AuthApiService.clearAllStorage();
    
    // Clear session timestamp
    localStorage.removeItem(SESSION_TIMEOUT_KEY);
    
    // console.log('Session timeout: Cleared all authentication data and backend session');
  } catch (error) {
    console.error('Error clearing session on timeout:', error);
  }
}

/**
 * Initializes session timeout monitoring
 * Should be called on app initialization
 */
export function initializeSessionTimeout(): void {
  // Check on load if session expired
  if (isSessionExpired()) {
    // Clear session (async) and redirect
    clearSessionOnTimeout().then(() => {
      // Redirect to login if we're on a protected page
      if (!isPublicRoute(window.location.pathname)) {
        window.location.href = getLoginUrl();
      }
    }).catch(error => {
      console.error('Error during session timeout cleanup:', error);
      // Still redirect even if cleanup failed
      if (!isPublicRoute(window.location.pathname)) {
        window.location.href = getLoginUrl();
      }
    });
    return;
  }
  
  // Update activity timestamp
  updateSessionActivity();
  
  // Monitor user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  const handleActivity = () => {
    updateSessionActivity();
  };
  
  // Add event listeners
  activityEvents.forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true });
  });
  
  // Check for timeout periodically (every 5 minutes)
  const timeoutCheckInterval = setInterval(() => {
    if (isSessionExpired()) {
      clearSessionOnTimeout().then(() => {
        clearInterval(timeoutCheckInterval);
        
        // Redirect to login
        if (!isPublicRoute(window.location.pathname)) {
          window.location.href = getLoginUrl();
        }
      }).catch(error => {
        console.error('Error during session timeout cleanup:', error);
        clearInterval(timeoutCheckInterval);
        // Still redirect even if cleanup failed
        if (!isPublicRoute(window.location.pathname)) {
          window.location.href = getLoginUrl();
        }
      });
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(timeoutCheckInterval);
    activityEvents.forEach(event => {
      document.removeEventListener(event, handleActivity);
    });
  });
}

/**
 * Gets remaining session time in minutes
 */
export function getRemainingSessionTime(): number {
  try {
    const lastActivity = localStorage.getItem(SESSION_TIMEOUT_KEY);
    if (!lastActivity) {
      return SESSION_TIMEOUT_MS / (60 * 1000); // Return full timeout
    }
    
    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;
    const remaining = SESSION_TIMEOUT_MS - timeSinceActivity;
    
    return Math.max(0, Math.floor(remaining / (60 * 1000)));
  } catch {
    return 0;
  }
}

