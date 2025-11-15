/**
 * Comprehensive security enhancements for the dashboard
 * Protects against common web vulnerabilities
 */

import { SecurityUtils } from '@/utils/security';

/**
 * Enhanced input validation and sanitization
 */
export class InputValidator {
  /**
   * Validates email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validates password strength
   */
  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitizes HTML to prevent XSS
   */
  static sanitizeHTML(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  /**
   * Validates and sanitizes user input
   */
  static sanitizeInput(input: string, options: {
    maxLength?: number;
    allowHTML?: boolean;
    allowedChars?: RegExp;
  } = {}): string {
    const { maxLength = 1000, allowHTML = false, allowedChars } = options;
    
    let sanitized = input.trim();
    
    // Apply length limit
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    // Remove HTML if not allowed
    if (!allowHTML) {
      sanitized = SecurityUtils.sanitizeInput(sanitized);
      sanitized = this.sanitizeHTML(sanitized);
    }
    
    // Apply character whitelist if provided
    if (allowedChars) {
      sanitized = sanitized.split('').filter(char => allowedChars.test(char)).join('');
    }
    
    return sanitized;
  }

  /**
   * Validates URL to prevent open redirect attacks
   */
  static validateURL(url: string, allowedDomains: string[] = []): boolean {
    try {
      const urlObj = new URL(url);
      
      // Prevent javascript: and data: protocols
      if (['javascript:', 'data:', 'vbscript:'].includes(urlObj.protocol.toLowerCase())) {
        return false;
      }
      
      // If allowed domains specified, check against them
      if (allowedDomains.length > 0) {
        return allowedDomains.some(domain => urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`));
      }
      
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * CSRF Protection
 */
export class CSRFProtection {
  private static tokenKey = 'csrf_token';
  private static tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Gets or generates CSRF token
   */
  static getToken(): string {
    const stored = sessionStorage.getItem(this.tokenKey);
    const storedData = stored ? JSON.parse(stored) : null;
    
    // Check if token exists and is not expired
    if (storedData && storedData.expiry > Date.now()) {
      return storedData.token;
    }
    
    // Generate new token
    const token = SecurityUtils.generateCSRFToken();
    const expiry = Date.now() + this.tokenExpiry;
    
    sessionStorage.setItem(this.tokenKey, JSON.stringify({ token, expiry }));
    return token;
  }

  /**
   * Validates CSRF token
   */
  static validateToken(token: string): boolean {
    const stored = sessionStorage.getItem(this.tokenKey);
    if (!stored) return false;
    
    const storedData = JSON.parse(stored);
    return SecurityUtils.validateCSRFToken(token, storedData.token);
  }

  /**
   * Adds CSRF token to request headers
   */
  static addTokenToHeaders(headers: Record<string, string>): Record<string, string> {
    return {
      ...headers,
      'X-CSRF-Token': this.getToken(),
    };
  }
}

/**
 * Rate Limiting (Client-side)
 * Note: Real rate limiting should be enforced server-side
 */
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();

  /**
   * Checks if request should be rate limited
   */
  static checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limited
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    
    return true; // Allowed
  }

  /**
   * Clears rate limit for a key
   */
  static clearLimit(key: string): void {
    this.requests.delete(key);
  }
}

/**
 * Content Security Policy helper
 */
export class CSPHelper {
  /**
   * Generates CSP header value
   */
  static generateCSP(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: unsafe-eval needed for some libs
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');
  }
}

/**
 * Secure storage wrapper
 * Provides additional security for sensitive data
 */
export class SecureStorage {
  /**
   * Stores data with encryption (basic obfuscation)
   * Note: For production, use proper encryption libraries
   */
  static setItem(key: string, value: string, encrypt = false): void {
    if (encrypt) {
      // Basic obfuscation (not real encryption - use crypto libraries in production)
      const obfuscated = btoa(unescape(encodeURIComponent(value)));
      localStorage.setItem(key, obfuscated);
    } else {
      localStorage.setItem(key, value);
    }
  }

  /**
   * Gets data with decryption
   */
  static getItem(key: string, decrypt = false): string | null {
    const value = localStorage.getItem(key);
    if (!value) return null;
    
    if (decrypt) {
      try {
        return decodeURIComponent(escape(atob(value)));
      } catch {
        return null;
      }
    }
    
    return value;
  }

  /**
   * Removes item securely
   */
  static removeItem(key: string): void {
    localStorage.removeItem(key);
    // Overwrite with null to prevent recovery
    try {
      localStorage.setItem(key, '');
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Request signing for critical operations
 */
export class RequestSigner {
  /**
   * Generates a request signature
   */
  static generateSignature(method: string, url: string, body: string, timestamp: number): string {
    const message = `${method}:${url}:${body}:${timestamp}`;
    // In production, use HMAC with a secret key
    // This is a simplified version
    return btoa(message).substring(0, 32);
  }

  /**
   * Validates request signature
   */
  static validateSignature(
    signature: string,
    method: string,
    url: string,
    body: string,
    timestamp: number,
    maxAge = 60000 // 1 minute
  ): boolean {
    // Check timestamp freshness
    if (Date.now() - timestamp > maxAge) {
      return false;
    }
    
    const expected = this.generateSignature(method, url, body, timestamp);
    return signature === expected;
  }
}

/**
 * Security event logger
 */
export class SecurityLogger {
  /**
   * Logs security events
   */
  static log(event: string, details: Record<string, any> = {}, severity: 'low' | 'medium' | 'high' = 'low'): void {
    const logEntry = {
      event,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      details,
    };
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.warn('[SECURITY]', logEntry);
    }
    
    // In production, send to security monitoring service
    // Example: sendToSecurityService(logEntry);
  }

  /**
   * Logs suspicious activity
   */
  static logSuspiciousActivity(activity: string, details: Record<string, any> = {}): void {
    this.log(`SUSPICIOUS_ACTIVITY: ${activity}`, details, 'high');
  }

  /**
   * Logs authentication events
   */
  static logAuthEvent(event: 'login' | 'logout' | 'failed_login' | 'token_refresh', details: Record<string, any> = {}): void {
    this.log(`AUTH_${event.toUpperCase()}`, details, event === 'failed_login' ? 'high' : 'medium');
  }
}

// Re-export for convenience
export { SECURITY_CONFIG } from '@/utils/security';
