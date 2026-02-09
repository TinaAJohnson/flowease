import { CalendarProvider } from '../types';

export interface GoogleAuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
  authorizationUrl: string;
  tokenUrl: string;
}

// Google OAuth Configuration
export const GOOGLE_CONFIG: OAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  scope: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.readonly',
    'openid',
    'email',
    'profile'
  ],
  authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token'
};

// Microsoft OAuth Configuration
export const MICROSOFT_CONFIG: OAuthConfig = {
  clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || 'http://localhost:5173/auth/callback',
  scope: [
    'Calendars.Read',
    'Calendars.ReadWrite',
    'User.Read',
    'offline_access'
  ],
  authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
};

/**
 * Generate OAuth authorization URL
 */
export const getAuthorizationUrl = (provider: CalendarProvider): string => {
  const config = provider === CalendarProvider.GOOGLE ? GOOGLE_CONFIG : MICROSOFT_CONFIG;
  
  if (!config.clientId) {
    throw new Error(`OAuth client ID not configured for ${provider}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });

  return `${config.authorizationUrl}?${params.toString()}`;
};

/**
 * Extract authorization code from callback URL
 */
export const extractAuthCode = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

/**
 * Extract error from callback URL (if auth failed)
 */
export const extractAuthError = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('error');
};

/**
 * Get OAuth config for a provider
 */
export const getOAuthConfig = (provider: CalendarProvider): OAuthConfig => {
  switch (provider) {
    case CalendarProvider.GOOGLE:
      return GOOGLE_CONFIG;
    case CalendarProvider.MICROSOFT:
      return MICROSOFT_CONFIG;
    case CalendarProvider.ICLOUD:
      throw new Error('iCloud OAuth not yet implemented');
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};

/**
 * Exchange authorization code for access token
 * Note: This should be done server-side in production to keep client_secret secure
 */
export const exchangeCodeForToken = async (
  code: string,
  provider: CalendarProvider
): Promise<GoogleAuthResponse> => {
  const config = getOAuthConfig(provider);

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
        redirect_uri: config.redirectUri
      }).toString()
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string,
  provider: CalendarProvider
): Promise<GoogleAuthResponse> => {
  const config = getOAuthConfig(provider);

  try {
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
      }).toString()
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Redirect user to OAuth provider for authentication
 */
export const initiateOAuthFlow = (provider: CalendarProvider): void => {
  try {
    const authUrl = getAuthorizationUrl(provider);
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to initiate OAuth flow:', error);
    alert(`Authentication setup incomplete. Check console for details.`);
  }
};
