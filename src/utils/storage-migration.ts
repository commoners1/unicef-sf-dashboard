/**
 * Storage Migration Utility
 * 
 * Migrates old unencrypted localStorage data to new secure format
 * Cleans up sensitive data that should not be stored
 * 
 * Run this on app initialization to migrate existing data
 */

import { SecureStorage } from '@/lib/security-enhancements';

interface LegacyUserProfile {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  company?: string;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

interface LegacyAuthStorage {
  state?: {
    user?: LegacyUserProfile;
    isAuthenticated?: boolean;
  };
  version?: number;
}

/**
 * Checks if a string is likely encrypted (base64 format)
 */
function isEncrypted(data: string): boolean {
  // Encrypted data is base64, typically longer and matches base64 pattern
  if (!data || data.length < 20) return false;
  
  // Check if it's valid base64 (AES-GCM encrypted data)
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  return base64Pattern.test(data) && data.length > 50;
}

/**
 * Migrates old localStorage data to secure format
 * Removes sensitive data (email, role) from storage
 */
export async function migrateStorage(): Promise<void> {
  try {
    // Check for legacy user_profile
    const legacyProfile = localStorage.getItem('user_profile');
    if (legacyProfile) {
      try {
        let user: LegacyUserProfile | null = null;
        
        // Check if data is already encrypted
        if (isEncrypted(legacyProfile)) {
          // Try to decrypt it first (silent mode to avoid console noise for expected failures)
          try {
            const decrypted = await SecureStorage.getItem('user_profile', true, true);
            if (decrypted) {
              user = JSON.parse(decrypted) as LegacyUserProfile;
            } else {
              // Decryption returned null, data is corrupted
              console.debug('user_profile data is corrupted or cannot be decrypted, removing it');
              SecureStorage.removeItem('user_profile');
              return; // Skip migration for this item
            }
          } catch (decryptError) {
            // If decryption fails, it might be corrupted encrypted data
            console.debug('Failed to decrypt user_profile, removing corrupted data');
            SecureStorage.removeItem('user_profile');
            return; // Skip migration for this item
          }
        } else {
          // Not encrypted, parse as JSON
          try {
            user = JSON.parse(legacyProfile) as LegacyUserProfile;
          } catch (parseError) {
            // Not valid JSON, might be corrupted
            console.warn('Failed to parse user_profile as JSON, removing corrupted data:', parseError);
            SecureStorage.removeItem('user_profile');
            return; // Skip migration for this item
          }
        }
        
        // Only proceed if we have valid user data
        if (user && user.id) {
          // SECURITY: Only migrate minimal non-sensitive data
          const minimalUser = {
            id: user.id,
            name: user.name || '',
            // DO NOT migrate: email, role, or any sensitive data
          };
          
          // Check if we need to update (if email or role exists in current data)
          const needsUpdate = user.email || user.role;
          
          if (needsUpdate) {
            // Store in encrypted format with minimal data
            await SecureStorage.setItem('user_profile', minimalUser, true);
            
            // Remove old unencrypted data
            SecureStorage.removeItem('user_profile');
            
            // console.log('Migrated user_profile to secure storage (removed sensitive data)');
          } else {
            // Already migrated, no action needed
            // console.log('user_profile already in secure format');
          }
        }
      } catch (error) {
        console.warn('Error migrating user_profile:', error);
        // Remove corrupted data
        SecureStorage.removeItem('user_profile');
      }
    }
    
    // Check for legacy auth-storage (Zustand persist)
    const legacyAuth = localStorage.getItem('auth-storage');
    if (legacyAuth) {
      try {
        // Check if it's encrypted (unlikely for Zustand persist, but check anyway)
        let auth: LegacyAuthStorage | null = null;
        
        if (isEncrypted(legacyAuth)) {
          // Zustand persist data shouldn't be encrypted, but handle it
          console.warn('auth-storage appears encrypted, skipping migration');
          return;
        }
        
        try {
          auth = JSON.parse(legacyAuth) as LegacyAuthStorage;
        } catch (parseError) {
          // Not valid JSON, might be corrupted
          console.warn('Failed to parse auth-storage as JSON, removing corrupted data:', parseError);
          localStorage.removeItem('auth-storage');
          return;
        }
        
        if (auth?.state?.user) {
          // SECURITY: Remove sensitive data from auth storage
          const user = auth.state.user;
          
          // Check if sensitive data exists
          const hasSensitiveData = user.email || user.role;
          
          if (hasSensitiveData) {
            // Create minimal user object
            const minimalUser = {
              id: user.id,
              name: user.name || '',
              // DO NOT store: email, role, or any sensitive data
            };
            
            // Update auth storage with minimal data
            const updatedAuth: LegacyAuthStorage = {
              state: {
                user: minimalUser,
                isAuthenticated: auth.state.isAuthenticated || false,
              },
              version: auth.version || 0,
            };
            
            // Store updated auth (Zustand will handle persistence)
            localStorage.setItem('auth-storage', JSON.stringify(updatedAuth));
            
            // console.log('Cleaned sensitive data from auth-storage');
          } else {
            // Already cleaned, no action needed
            // console.log('auth-storage already cleaned');
          }
        }
      } catch (error) {
        console.warn('Error migrating auth-storage:', error);
        // Remove corrupted data
        localStorage.removeItem('auth-storage');
      }
    }
    
    // Clean up any other sensitive data
    cleanupSensitiveData();
    
  } catch (error) {
    console.error('Storage migration error:', error);
  }
}

/**
 * Cleans up any remaining sensitive data from localStorage
 */
function cleanupSensitiveData(): void {
  const keysToCheck = [
    'user_profile',
    'auth-storage',
    'user',
    'auth',
    'token',
    'jwt',
  ];
  
  keysToCheck.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        
        // Check if it contains sensitive fields
        if (parsed.email || parsed.role || parsed.password || parsed.token) {
          console.warn(`Found sensitive data in ${key}, removing...`);
          SecureStorage.removeItem(key);
        }
      } catch {
        // Not JSON, might be encrypted or other format - leave it
      }
    }
  });
}

/**
 * Clears all legacy unencrypted data
 * Use this for a complete cleanup
 */
export function clearLegacyData(): void {
  const legacyKeys = [
    'user_profile',
    'auth-storage',
    'user',
    'auth',
    'token',
    'jwt',
    'access_token',
    'refresh_token',
  ];
  
  legacyKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        // Check if it's encrypted (starts with base64 pattern)
        const isEncrypted = /^[A-Za-z0-9+/=]+$/.test(value) && value.length > 50;
        
        if (!isEncrypted) {
          // Likely unencrypted legacy data - remove it
          SecureStorage.removeItem(key);
          // console.log(`Cleared legacy data: ${key}`);
        }
      }
    } catch (error) {
      console.warn(`Error clearing ${key}:`, error);
    }
  });
}

