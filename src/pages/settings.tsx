import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Save, RefreshCw, Shield } from 'lucide-react';
import { SettingsApiService, type SettingsObject } from '@/services/api/settings/settings-api';

const DEFAULTS: SettingsObject = {
  general: {
    siteName: 'SF Dashboard',
    timezone: 'UTC',
    language: 'English',
    theme: 'light',
    maintenanceMode: false,
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requireTwoFactor: false,
    passwordMinLength: 8,
    enableAuditLog: true,
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsObject>(DEFAULTS);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    SettingsApiService.getSettings().then(data => {
      // Only import general and security
      const filtered: SettingsObject = {
        general: data.general || DEFAULTS.general,
        security: data.security || DEFAULTS.security
      };
      setSettings(filtered);
      setIsLoading(false);
    }).catch(err => {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      setIsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await SettingsApiService.updateSettings(settings);
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };
  const handleReset = () => {
    setSettings(DEFAULTS);
    setHasChanges(false);
  };
  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  if (isLoading) return <div className="text-center m-12 text-muted-foreground">Loading settings...</div>;
  if (error) return <div className="text-center m-12 text-destructive">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          {hasChanges && (
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-muted transition-colors ${activeTab === tab.id ? 'bg-muted border-r-2 border-primary' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>
        <div className="lg:col-span-3 space-y-6">
          {tabs.map(tab => activeTab === tab.id && (
            <Card key={tab.id}>
              <CardHeader>
                <CardTitle>{tab.label} Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(settings[tab.id] || {}).map(([key, value]) => {
                  let inputType: 'text' | 'number' | 'checkbox' | 'textarea' | 'select' = 'text';
                  if (typeof value === 'boolean') inputType = 'checkbox';
                  else if (typeof value === 'number') inputType = 'number';
                  else if (Array.isArray(value)) inputType = 'textarea';
                  else if (/theme|frequency|timezone|language/.test(key)) inputType = 'select';
                  return (
                    <div key={key} className="space-y-2">
                      <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                      {inputType === 'text' && (
                        <input
                          type="text"
                          value={value}
                          className="w-full px-3 py-2 border rounded-md"
                          onChange={e => updateSetting(tab.id, key, e.target.value)}
                        />
                      )}
                      {inputType === 'number' && (
                        <input
                          type="number"
                          value={value}
                          className="w-full px-3 py-2 border rounded-md"
                          onChange={e => updateSetting(tab.id, key, Number(e.target.value))}
                        />
                      )}
                      {inputType === 'checkbox' && (
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={!!value}
                          onChange={e => updateSetting(tab.id, key, e.target.checked)}
                        />
                      )}
                      {inputType === 'textarea' && (
                        <textarea
                          className="w-full px-3 py-2 border rounded-md"
                          value={value.join('\n')}
                          onChange={e => updateSetting(tab.id, key, e.target.value.split('\n'))}
                          rows={3}
                        />
                      )}
                      {inputType === 'select' && (() => {
                        const options = (() => {
                          if (key === 'theme') return ['light', 'dark', 'auto'];
                          if (key === 'frequency' || key === 'digestFrequency') return ['realtime','hourly','daily','weekly','monthly'];
                          if (key === 'timezone') return ['UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles'];
                          if (key === 'language') return ['English','Spanish','French','German'];
                          return [];
                        })();
                        return (
                          <select
                            className="w-full px-3 py-2 border rounded-md"
                            value={value}
                            onChange={e => updateSetting(tab.id, key, e.target.value)}
                          >
                            {options.map(opt => (
                              <option value={opt} key={opt}>{opt.charAt(0).toUpperCase()+opt.slice(1)}</option>
                            ))}
                          </select>
                        );
                      })()}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
