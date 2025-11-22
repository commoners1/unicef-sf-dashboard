import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLoading } from '@/components/ui/loading';
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

  if (isLoading) return <PageLoading text="Loading settings" subtitle="Please wait while we fetch your configuration" />;
  if (error) return <div className="text-center m-12 text-destructive text-sm sm:text-base">{error}</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="pt-6 sm:pt-0 pb-6 sm:pb-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Configure system settings and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-1.5"
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">{tab.label} Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {Object.entries(settings[tab.id] || {}).map(([key, value]) => {
                  let inputType: 'text' | 'number' | 'checkbox' | 'textarea' | 'select' = 'text';
                  if (typeof value === 'boolean') inputType = 'checkbox';
                  else if (typeof value === 'number') inputType = 'number';
                  else if (Array.isArray(value)) inputType = 'textarea';
                  else if (/theme|frequency|timezone|language/.test(key)) inputType = 'select';
                  return (
                    <div key={key} className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium capitalize block">{key.replace(/([A-Z])/g, ' $1')}</label>
                      {inputType === 'text' && (
                        <input
                          type="text"
                          value={value}
                          className="w-full px-3 py-2 text-sm sm:text-base border rounded-md bg-background"
                          onChange={e => updateSetting(tab.id, key, e.target.value)}
                        />
                      )}
                      {inputType === 'number' && (
                        <input
                          type="number"
                          value={value}
                          className="w-full px-3 py-2 text-sm sm:text-base border rounded-md bg-background"
                          onChange={e => updateSetting(tab.id, key, Number(e.target.value))}
                        />
                      )}
                      {inputType === 'checkbox' && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded"
                            checked={!!value}
                            onChange={e => updateSetting(tab.id, key, e.target.checked)}
                          />
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {value ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      )}
                      {inputType === 'textarea' && (
                        <textarea
                          className="w-full px-3 py-2 text-sm sm:text-base border rounded-md bg-background resize-y"
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
                            className="w-full px-3 py-2 text-sm sm:text-base border rounded-md bg-background"
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
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end pt-2">
        {hasChanges && (
          <Button variant="outline" size="sm" onClick={handleReset} className="flex-1 sm:flex-initial min-w-[100px]">
            <RefreshCw className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Reset</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        )}
        <Button size="sm" onClick={handleSave} disabled={!hasChanges} className="flex-1 sm:flex-initial min-w-[100px]">
          <Save className="h-4 w-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">Save Changes</span>
          <span className="sm:hidden">Save</span>
        </Button>
      </div>
    </div>
  );
}
