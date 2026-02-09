import { CalendarProvider, CalendarIntegration } from '../types';

const TOKEN_STORAGE_PREFIX = 'flowease_calendar_token_';

/**
 * Simple encryption/decryption using base64 (note: for production, use a proper crypto library)
 * In production, tokens should be stored server-side, not in browser
 */

/**
 * Encrypt a token string (basic implementation)
 * WARNING: This is for demonstration. Use proper encryption in production.
 */
const encryptToken = (token: string): string => {
  // For now, we'll use base64 encoding as a basic obfuscation
  // In production, use a library like TweetNaCl.js or crypto-js
  return btoa(token);
};

/**
 * Decrypt a token string
 */
const decryptToken = (encrypted: string): string => {
  try {
    return atob(encrypted);
  } catch (error) {
    console.error('Token decryption failed:', error);
    return '';
  }
};

/**
 * Save calendar integration credentials to localStorage
 */
export const saveTokens = (provider: CalendarProvider, integration: CalendarIntegration): void => {
  const key = `${TOKEN_STORAGE_PREFIX}${provider}`;
  
  const tokenData = {
    provider: integration.provider,
    email: integration.email,
    accessToken: integration.accessToken ? encryptToken(integration.accessToken) : undefined,
    refreshToken: integration.refreshToken ? encryptToken(integration.refreshToken) : undefined,
    expiresAt: integration.expiresAt,
    syncEnabled: integration.syncEnabled,
    selectedCalendarId: integration.selectedCalendarId,
    isConnected: integration.isConnected,
    lastSyncedAt: integration.lastSyncedAt
  };

  try {
    localStorage.setItem(key, JSON.stringify(tokenData));
  } catch (error) {
    console.error(`Failed to save tokens for ${provider}:`, error);
  }
};

/**
 * Retrieve calendar integration credentials from localStorage
 */
export const loadTokens = (provider: CalendarProvider): CalendarIntegration | null => {
  const key = `${TOKEN_STORAGE_PREFIX}${provider}`;
  
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const tokenData = JSON.parse(stored);
    
    return {
      provider: tokenData.provider,
      isConnected: tokenData.isConnected,
      email: tokenData.email,
      accessToken: tokenData.accessToken ? decryptToken(tokenData.accessToken) : undefined,
      refreshToken: tokenData.refreshToken ? decryptToken(tokenData.refreshToken) : undefined,
      expiresAt: tokenData.expiresAt,
      syncEnabled: tokenData.syncEnabled,
      selectedCalendarId: tokenData.selectedCalendarId,
      lastSyncedAt: tokenData.lastSyncedAt
    };
  } catch (error) {
    console.error(`Failed to load tokens for ${provider}:`, error);
    return null;
  }
};

/**
 * Clear calendar integration credentials from localStorage
 */
export const clearTokens = (provider: CalendarProvider): void => {
  const key = `${TOKEN_STORAGE_PREFIX}${provider}`;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear tokens for ${provider}:`, error);
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (expiresAt?: number): boolean => {
  if (!expiresAt) return false;
  return Date.now() >= expiresAt * 1000;
};

/**
 * Check if token will expire soon (within 5 minutes)
 */
export const isTokenExpiringSoon = (expiresAt?: number): boolean => {
  if (!expiresAt) return false;
  const fiveMinutesInSeconds = 5 * 60;
  return (expiresAt - Math.floor(Date.now() / 1000)) < fiveMinutesInSeconds;
};

/**
 * Get all stored calendar integrations
 */
export const loadAllTokens = (): Record<CalendarProvider, CalendarIntegration | null> => {
  return {
    [CalendarProvider.GOOGLE]: loadTokens(CalendarProvider.GOOGLE),
    [CalendarProvider.MICROSOFT]: loadTokens(CalendarProvider.MICROSOFT),
    [CalendarProvider.ICLOUD]: loadTokens(CalendarProvider.ICLOUD)
  };
};

/**
 * Wipe all stored tokens (used in Purge All Records)
 */
export const clearAllTokens = (): void => {
  Object.values(CalendarProvider).forEach(provider => {
    clearTokens(provider);
  });
};
