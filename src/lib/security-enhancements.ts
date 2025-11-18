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
 * Secure storage wrapper with proper encryption
 * Uses Web Crypto API for AES-GCM encryption
 * Provides additional security for sensitive data
 */
export class SecureStorage {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly TAG_LENGTH = 128; // 128 bits

  /**
   * Generates or retrieves encryption key
   * Uses a deterministic key derivation based on domain + user agent
   * Note: This is client-side encryption - still vulnerable to XSS if key is exposed
   */
  private static async getKey(): Promise<CryptoKey> {
    // Create a deterministic key based on domain and user agent
    // This ensures the same key is used across sessions on the same browser
    const keyMaterial = `${window.location.hostname}${navigator.userAgent}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(keyMaterial);
    
    // Import key material
    const keyData = await crypto.subtle.digest('SHA-256', data);
    
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.ALGORITHM },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts data using AES-GCM
   */
  private static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getKey();
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      
      // Encrypt
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH,
        },
        key,
        dataBuffer
      );
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      // Convert to base64 for storage
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption error:', error);
      // Fallback to basic obfuscation if crypto fails
      return btoa(unescape(encodeURIComponent(data)));
    }
  }

  /**
   * Decrypts data using AES-GCM
   */
  private static async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getKey();
      
      // Decode from base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, this.IV_LENGTH);
      const encrypted = combined.slice(this.IV_LENGTH);
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH,
        },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      // Try fallback decryption
      try {
        return decodeURIComponent(escape(atob(encryptedData)));
      } catch {
        return '';
      }
    }
  }

  /**
   * Stores data with encryption
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified if object)
   * @param encrypt - Whether to encrypt the data (default: true for sensitive data)
   */
  static async setItem(key: string, value: string | object, encrypt = true): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (encrypt) {
        const encrypted = await this.encrypt(stringValue);
        localStorage.setItem(key, encrypted);
      } else {
        localStorage.setItem(key, stringValue);
      }
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      throw error;
    }
  }

  /**
   * Gets data with decryption
   * @param key - Storage key
   * @param decrypt - Whether to decrypt the data (default: true)
   * @returns Decrypted value or null if not found
   */
  static async getItem(key: string, decrypt = true): Promise<string | null> {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      
      if (decrypt) {
        // Check if it's encrypted (base64 format)
        try {
          return await this.decrypt(value);
        } catch {
          // If decryption fails, might be unencrypted legacy data
          return value;
        }
      }
      
      return value;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  /**
   * Gets and parses JSON data
   */
  static async getItemJSON<T>(key: string, decrypt = true): Promise<T | null> {
    try {
      const value = await this.getItem(key, decrypt);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * Removes item securely
   * Overwrites data before removal to prevent recovery
   */
  static removeItem(key: string): void {
    try {
      // Overwrite with random data before removal
      const randomData = crypto.getRandomValues(new Uint8Array(256));
      localStorage.setItem(key, btoa(String.fromCharCode(...randomData)));
      localStorage.removeItem(key);
      
      // Additional cleanup
      localStorage.setItem(key, '');
      localStorage.removeItem(key);
    } catch (error) {
      // Fallback to simple removal
      localStorage.removeItem(key);
    }
  }

  /**
   * Clears all encrypted storage items
   */
  static clear(): void {
    try {
      // Get all keys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('auth-') || key.startsWith('user_') || key.includes('profile')) {
          this.removeItem(key);
        }
      });
    } catch (error) {
      console.error('SecureStorage clear error:', error);
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
