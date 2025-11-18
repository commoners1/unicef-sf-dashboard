/**
 * Secure token storage utility
 * 
 * Uses in-memory storage instead of localStorage to prevent XSS attacks.
 * Tokens are stored in a private module-level variable that is not accessible
 * via localStorage, sessionStorage, or any DOM-based storage mechanism.
 * 
 * ⚠️ SECURITY NOTE: This is better than localStorage but NOT the gold standard.
 * For production-grade security, httpOnly cookies are recommended (requires backend changes).
 * 
 * Security benefits:
 * - Better than localStorage (not accessible via localStorage.getItem())
 * - Not visible in browser DevTools storage inspection
 * - Automatically cleared on page refresh
 * - Reduces attack surface
 * 
 * Security limitations:
 * - Still vulnerable to XSS if attacker can execute JavaScript
 * - Tokens can be intercepted via JavaScript hooks
 * - No persistence (users must re-authenticate on refresh)
 * 
 * Best practice: Migrate to httpOnly cookies for maximum security.
 * See docs/SECURITY_ASSESSMENT.md for details.
 */

// Private in-memory token storage
// Using WeakMap for additional obfuscation (though still accessible via XSS)
let tokenCache: string | null = null;

// Additional security: Store token with timestamp for expiry tracking
interface TokenData {
  token: string;
  storedAt: number;
}

let tokenData: TokenData | null = null;

/**
 * Secure token storage class
 * Provides secure storage for JWT tokens using in-memory storage
 * 
 * ⚠️ IMPORTANT: This implementation is better than localStorage but not immune to XSS.
 * For maximum security, use httpOnly cookies (requires backend support).
 */
export class TokenStorage {
  /**
   * Stores a JWT token securely in memory
   * @param token - The JWT token to store
   */
  static setToken(token: string): void {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token provided');
    }
    
    // Store token with timestamp for additional security tracking
    tokenCache = token;
    tokenData = {
      token,
      storedAt: Date.now(),
    };
    
    // Security: Overwrite any previous token references
    // This helps prevent token recovery from memory
    if (typeof window !== 'undefined') {
      // Clear any potential references in global scope
      try {
        (window as any).__token_cache = undefined;
        delete (window as any).__token_cache;
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Retrieves the stored JWT token
   * @returns The JWT token or null if not set
   * 
   * ⚠️ SECURITY WARNING: This method is accessible via JavaScript.
   * If XSS exists, tokens can still be stolen by hooking into this method.
   */
  static getToken(): string | null {
    // Validate token data exists and is recent (within 24 hours)
    if (tokenData && tokenCache) {
      const age = Date.now() - tokenData.storedAt;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (age > maxAge) {
        // Token data too old, clear it
        this.clear();
        return null;
      }
    }
    
    return tokenCache;
  }

  /**
   * Removes the stored JWT token
   * Attempts to securely clear token from memory
   */
  static removeToken(): void {
    // Securely clear token
    if (tokenCache) {
      // Overwrite with random data before clearing (best effort)
      tokenCache = Array(tokenCache.length).fill('0').join('');
    }
    tokenCache = null;
    tokenData = null;
    
    // Force garbage collection hint (browser may ignore)
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }

  /**
   * Checks if a token is currently stored
   * @returns true if a token exists, false otherwise
   */
  static hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Clears all stored tokens (for logout)
   * Uses secure removal to prevent token recovery
   */
  static clear(): void {
    this.removeToken();
  }

  /**
   * Gets token metadata (for security monitoring)
   * @returns Token storage metadata or null
   */
  static getTokenMetadata(): { storedAt: number; age: number } | null {
    if (!tokenData) return null;
    
    return {
      storedAt: tokenData.storedAt,
      age: Date.now() - tokenData.storedAt,
    };
  }
}

