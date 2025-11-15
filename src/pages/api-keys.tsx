import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Key, Eye, EyeOff, Trash2, Copy } from 'lucide-react';
import { ApiKeyApiService } from '@/services/api/api-keys/api-key-api';
import { toast } from 'sonner';
import { ResponsiveTable } from '@/components/shared/responsive-table';

interface ApiKey {
  id: string;
  name: string;
  description?: string;
  key: string;
  isActive: boolean;
  permissions: string[];
  environment: string;
  createdAt: string;
  lastUsed?: string;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState({
    name: '',
    description: '',
    environment: 'production'
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await ApiKeyApiService.getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      const newApiKey = await ApiKeyApiService.generateApiKey({
        name: newKey.name,
        description: newKey.description,
        environment: newKey.environment
      });
      
      setApiKeys(prev => [newApiKey, ...prev]);
      setShowCreateDialog(false);
      setNewKey({ name: '', description: '', environment: 'production' });
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Failed to create API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await ApiKeyApiService.revokeApiKey(keyId);
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, isActive: false } : key
      ));
      toast.success('API key revoked successfully');
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      toast.error('Failed to revoke API key');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await ApiKeyApiService.deleteApiKey(keyId);
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const handleActivateKey = async (keyId: string) => {
    try {
      await ApiKeyApiService.activateApiKey(keyId);
      setApiKeys(prev => prev.map(key => 
        key.id === keyId ? { ...key, isActive: true } : key
      ));
      toast.success('API key activated successfully');
    } catch (error) {
      console.error('Failed to activate API key:', error);
      toast.error('Failed to activate API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">API Keys</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">API Keys</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newKey.name}
                  onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter API key name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newKey.description}
                  onChange={(e) => setNewKey(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description"
                />
              </div>
              <div>
                <Label htmlFor="environment">Environment</Label>
                <select
                  id="environment"
                  value={newKey.environment}
                  onChange={(e) => setNewKey(prev => ({ ...prev, environment: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={!newKey.name}>
                  Create Key
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="h-5 w-5 mr-2" />
            Your API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API key to start using the API
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          ) : (
            <ResponsiveTable
              data={apiKeys}
              getRowKey={(item) => item.id}
              renderMobileCard={(apiKey) => ({
                id: apiKey.name,
                primaryFields: [
                  {
                    label: 'Key',
                    value: (
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {showKeys[apiKey.id] 
                          ? apiKey.key 
                          : `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 8)}`
                        }
                      </code>
                    ),
                  },
                  {
                    label: 'Environment',
                    value: <Badge variant="outline" className="text-xs">{apiKey.environment}</Badge>,
                  },
                  {
                    label: 'Status',
                    value: (
                      <Badge variant={apiKey.isActive ? "default" : "secondary"} className="text-xs">
                        {apiKey.isActive ? "Active" : "Revoked"}
                      </Badge>
                    ),
                  },
                ],
                secondaryFields: [
                  {
                    label: 'Description',
                    value: <span className="text-xs">{apiKey.description || 'N/A'}</span>,
                  },
                  {
                    label: 'Created',
                    value: <span className="text-xs">{formatDate(apiKey.createdAt)}</span>,
                  },
                  {
                    label: 'Last Used',
                    value: <span className="text-xs">{apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}</span>,
                  },
                ],
                actions: {
                  copy: () => copyToClipboard(apiKey.key),
                  delete: () => handleDeleteKey(apiKey.id),
                  edit: apiKey.isActive 
                    ? () => handleRevokeKey(apiKey.id)
                    : () => handleActivateKey(apiKey.id),
                },
              })}
              emptyMessage="No API keys found"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{apiKey.name}</div>
                          {apiKey.description && (
                            <div className="text-sm text-muted-foreground">
                              {apiKey.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {showKeys[apiKey.id] 
                              ? apiKey.key 
                              : `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 8)}`
                            }
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                          >
                            {showKeys[apiKey.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {apiKey.environment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                          {apiKey.isActive ? "Active" : "Revoked"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(apiKey.createdAt)}
                      </TableCell>
                      <TableCell>
                        {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {apiKey.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeKey(apiKey.id)}
                            >
                              Revoke
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivateKey(apiKey.id)}
                              className="text-green-600 hover:text-green-600"
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteKey(apiKey.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
