import React, { useEffect, useState } from 'react';
import { CalendarProvider, PracticeSettings } from '../types';
import { extractAuthCode, extractAuthError, exchangeCodeForToken } from '../utils/oauth';
import { saveTokens } from '../utils/storage';

interface OAuthCallbackProps {
  settings: PracticeSettings;
  setSettings: (s: PracticeSettings) => void;
  onSuccess?: (provider: CalendarProvider) => void;
  onError?: (error: string) => void;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ settings, setSettings, onSuccess, onError }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');
  const [provider, setProvider] = useState<CalendarProvider | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for auth errors
        const error = extractAuthError();
        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          onError?.(error);
          return;
        }

        // Get authorization code
        const code = extractAuthCode();
        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          onError?.('No authorization code');
          return;
        }

        // Determine which provider based on URL params or state
        // For now, we'll try to detect from the state parameter or use a default
        const params = new URLSearchParams(window.location.search);
        const state = params.get('state');
        
        // In a real implementation, the state parameter would contain provider info
        // For now, we'll use a simple approach: check session storage
        const storedProvider = sessionStorage.getItem('oauth_provider') as CalendarProvider;
        if (!storedProvider) {
          throw new Error('Provider information not found');
        }

        setProvider(storedProvider);

        // Exchange code for token
        setMessage('Exchanging authorization code for access token...');
        const tokenResponse = await exchangeCodeForToken(code, storedProvider);

        // Calculate expiration time
        const expiresAt = Math.floor(Date.now() / 1000) + tokenResponse.expires_in;

        // Fetch user email/profile info
        let userEmail = '';
        if (storedProvider === CalendarProvider.GOOGLE) {
          userEmail = await fetchGoogleUserInfo(tokenResponse.access_token);
        } else if (storedProvider === CalendarProvider.MICROSOFT) {
          userEmail = await fetchMicrosoftUserInfo(tokenResponse.access_token);
        }

        // Update settings with new integration
        const updated = {
          ...settings,
          calendarIntegrations: {
            ...settings.calendarIntegrations,
            [storedProvider]: {
              ...settings.calendarIntegrations[storedProvider],
              isConnected: true,
              email: userEmail,
              accessToken: tokenResponse.access_token,
              refreshToken: tokenResponse.refresh_token || undefined,
              expiresAt,
              syncEnabled: true,
              lastSyncedAt: new Date().toISOString()
            }
          }
        };

        setSettings(updated);

        // Save tokens to localStorage
        saveTokens(storedProvider, updated.calendarIntegrations[storedProvider]);

        // Clear session storage
        sessionStorage.removeItem('oauth_provider');

        setStatus('success');
        setMessage(`${storedProvider} calendar connected successfully!`);
        onSuccess?.(storedProvider);

        // Redirect back to settings after 2 seconds
        setTimeout(() => {
          window.location.hash = '#/settings';
        }, 2000);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        onError?.(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    handleCallback();
  }, [settings, setSettings, onSuccess, onError]);

  /**
   * Fetch Google user email
   */
  const fetchGoogleUserInfo = async (accessToken: string): Promise<string> => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Google');
    }

    const data = await response.json();
    return data.email || '';
  };

  /**
   * Fetch Microsoft user email
   */
  const fetchMicrosoftUserInfo = async (accessToken: string): Promise<string> => {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info from Microsoft');
    }

    const data = await response.json();
    return data.mail || data.userPrincipalName || '';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-white rounded-[3rem] p-16 shadow-2xl max-w-md w-full mx-4 text-center space-y-8">
        {status === 'loading' && (
          <>
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">Connecting Calendar</h2>
              <p className="text-slate-500 text-sm">{message}</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center text-4xl">✅</div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">Connected!</h2>
              <p className="text-slate-500 text-sm">{message}</p>
              <p className="text-xs text-slate-400 pt-4">Redirecting to settings...</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center text-4xl">❌</div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-red-600">Connection Failed</h2>
              <p className="text-slate-500 text-sm">{message}</p>
              <button
                onClick={() => window.location.hash = '#/settings'}
                className="mt-6 w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                Back to Settings
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
