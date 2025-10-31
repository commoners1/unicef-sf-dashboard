// Security utilities for the dashboard

export const SECURITY_CONFIG = {
  // Token storage key
  TOKEN_KEY: 'jwt_token',
  USER_KEY: 'user_profile',
  
  // Token validation
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  
  // Session timeout
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 hours
  
  // Rate limiting
  API_RATE_LIMIT: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
} as const;

export class SecurityUtils {
  // Validate JWT token format and expiry
  static validateToken(token: string): boolean {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Check if token needs refresh
  static needsRefresh(token: string): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = (payload.exp - now) * 1000;
      
      return timeUntilExpiry < SECURITY_CONFIG.TOKEN_REFRESH_THRESHOLD;
    } catch {
      return true;
    }
  }

  // Sanitize user input
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length === 64;
  }

  // Check if user is idle
  static isUserIdle(lastActivity: number): boolean {
    const now = Date.now();
    return (now - lastActivity) > SECURITY_CONFIG.SESSION_TIMEOUT;
  }

  // Clear sensitive data
  static clearSensitiveData(): void {
    localStorage.removeItem(SECURITY_CONFIG.TOKEN_KEY);
    localStorage.removeItem(SECURITY_CONFIG.USER_KEY);
    sessionStorage.clear();
  }

  // Log security events
  static logSecurityEvent(event: string, details: Record<string, any> = {}): void {
    console.warn(`[SECURITY] ${event}:`, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details,
    });
  }
}
