import React, { useState } from 'react';
import { CalendarProvider, CalendarIntegration, PracticeSettings } from '../types';
import { initiateOAuthFlow } from '../utils/oauth';
import { clearTokens, saveTokens } from '../utils/storage';

interface CalendarIntegrationsProps {
  settings: PracticeSettings;
  setSettings: (s: PracticeSettings) => void;
}

const PROVIDER_CONFIG = {
  [CalendarProvider.GOOGLE]: {
    name: 'Google Calendar',
    icon: '🔵',
    color: 'blue',
    description: 'Sync your Google Calendar events and manage scheduling',
    website: 'google.com/calendar'
  },
  [CalendarProvider.MICROSOFT]: {
    name: 'Microsoft 365 / Outlook',
    icon: '🟦',
    color: 'blue',
    description: 'Connect your Microsoft 365 calendar for seamless integration',
    website: 'outlook.com'
  },
  [CalendarProvider.ICLOUD]: {
    name: 'iCloud Calendar',
    icon: '🍎',
    color: 'gray',
    description: 'Integrate with your Apple iCloud calendar',
    website: 'icloud.com'
  }
};

const CalendarIntegrations: React.FC<CalendarIntegrationsProps> = ({
  settings,
  setSettings
}) => {
  const [expandedProvider, setExpandedProvider] = useState<CalendarProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState<CalendarProvider | null>(null);

  const handleConnect = async (provider: CalendarProvider) => {
    setIsConnecting(provider);
    
    try {
      // Store provider in session storage so callback knows which one to update
      sessionStorage.setItem('oauth_provider', provider);
      
      // Initiate OAuth flow
      initiateOAuthFlow(provider);
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error);
      setIsConnecting(null);
      alert('Failed to initiate authentication. Check console for details.');
    }
  };

  const handleDisconnect = (provider: CalendarProvider) => {
    if (confirm(`Disconnect ${PROVIDER_CONFIG[provider].name}? Your events will no longer sync.`)) {
      const updated = {
        ...settings,
        calendarIntegrations: {
          ...settings.calendarIntegrations,
          [provider]: {
            ...settings.calendarIntegrations[provider],
            isConnected: false,
            accessToken: undefined,
            refreshToken: undefined,
            email: undefined,
            selectedCalendarId: undefined
          }
        }
      };
      setSettings(updated);
      clearTokens(provider);
    }
  };

  const handleToggleSync = (provider: CalendarProvider) => {
    const integration = settings.calendarIntegrations[provider];
    const newSyncEnabled = !integration.syncEnabled;
    
    const updated = {
      ...settings,
      calendarIntegrations: {
        ...settings.calendarIntegrations,
        [provider]: {
          ...integration,
          syncEnabled: newSyncEnabled
        }
      }
    };
    setSettings(updated);
    
    // Save updated tokens to storage
    if (integration.isConnected) {
      saveTokens(provider, updated.calendarIntegrations[provider]);
    }
  };

  const renderIntegrationCard = (provider: CalendarProvider) => {
    const config = PROVIDER_CONFIG[provider];
    const integration = settings.calendarIntegrations[provider];
    const isExpanded = expandedProvider === provider;

    return (
      <div
        key={provider}
        className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden transition-all hover:shadow-xl"
      >
        {/* Card Header */}
        <div
          className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => setExpandedProvider(isExpanded ? null : provider)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-3xl mt-1">{config.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{config.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {integration.isConnected && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-semibold text-emerald-700">Connected</span>
                </div>
              )}
              {!integration.isConnected && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-xs font-semibold text-slate-600">Disconnected</span>
                </div>
              )}
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-slate-100 p-6 space-y-6 bg-slate-50">
            {integration.isConnected && (
              <>
                {/* Connected Account Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 text-sm">Connected Account</h4>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    {integration.email && (
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Email</p>
                        <p className="text-sm font-medium text-slate-900 truncate">{integration.email}</p>
                      </div>
                    )}
                    {integration.lastSyncedAt && (
                      <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Last Synced</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(integration.lastSyncedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sync Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Auto Sync Events</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {integration.syncEnabled 
                        ? 'Your events will sync automatically'
                        : 'Sync is currently disabled'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleSync(provider)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      integration.syncEnabled
                        ? 'bg-emerald-500'
                        : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        integration.syncEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={() => handleDisconnect(provider)}
                  className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
                >
                  Disconnect {config.name}
                </button>
              </>
            )}

            {!integration.isConnected && (
              <>
                <p className="text-sm text-slate-600">
                  Connect your {config.name} account to sync events automatically with FLOWEASE. Your data is secure and encrypted.
                </p>
                <button
                  onClick={() => handleConnect(provider)}
                  disabled={isConnecting === provider}
                  className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isConnecting === provider ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Connect {config.name}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6l6 6m0 0l-6 6m6-6H3" />
                      </svg>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="space-y-3">
        <div className="inline-flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Calendar Integrations</span>
        </div>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
          Connect Your Calendars
        </h3>
        <p className="text-slate-500 text-base font-medium leading-relaxed italic max-w-2xl">
          Sync your scheduling across multiple calendar platforms. Your appointments and events will stay organized and up-to-date.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {Object.values(CalendarProvider).map(provider => renderIntegrationCard(provider))}
      </div>

      {/* Privacy Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="text-xl mt-0.5">🔒</div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900">Your Data is Secure</h4>
            <p className="text-sm text-slate-600">
              All calendar integrations use OAuth 2.0 authentication. Your passwords are never stored. We only access what's necessary for syncing your events. You can revoke access at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarIntegrations;
