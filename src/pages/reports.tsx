import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Calendar, Filter, Plus, BarChart3, Settings } from 'lucide-react';
import { ReportsApiService, type Report } from '@/services/api/reports/reports-api';

function saveBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<string>('reports');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ReportsApiService.getReports();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadReports(); }, []);

  const handleGenerateReport = async (reportId: string) => {
    setGeneratingId(reportId);
    try {
      await ReportsApiService.generateReport(reportId);
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    setDownloadingId(reportId);
    try {
      const report = reports.find(r => r.id === reportId);
      const blob = await ReportsApiService.downloadReport(reportId);
      if (report) saveBlob(blob, `${report.name}.${report.format}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredReports = reports.filter(report => {
    const typeMatch = selectedType === 'all' || report.type.toLowerCase() === selectedType;
    const statusMatch = selectedStatus === 'all' || report.status === selectedStatus;
    return typeMatch && statusMatch;
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'secondary';
      case 'generating': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'performance': return 'blue';
      case 'users': return 'green';
      case 'api': return 'purple';
      case 'security': return 'red';
      case 'errors': return 'orange';
      default: return 'gray';
    }
  };

  // Derive stats
  const reportStats = {
    total: reports.length,
    ready: reports.filter(r => r.status === 'ready').length,
    generating: reports.filter(r => r.status === 'generating').length,
    scheduled: reports.filter(r => r.schedule !== 'Manual').length,
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate, manage, and download system reports
          </p>
        </div>
        <Button onClick={() => {}} disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create Report
        </Button>
      </div>
      {isLoading && <div className="text-muted-foreground py-8 text-center">Loading reports...</div>}
      {error && <div className="text-destructive py-2 text-center">{error}</div>}
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.total}</div>
            <p className="text-xs text-muted-foreground">All report types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <Download className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reportStats.ready}</div>
            <p className="text-xs text-muted-foreground">Available for download</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generating</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{reportStats.generating}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reportStats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Automated reports</p>
          </CardContent>
        </Card>
      </div>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Scheduled</span>
          </TabsTrigger>
        </TabsList>
        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Type:</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="performance">Performance</option>
                    <option value="users">Users</option>
                    <option value="api">API</option>
                    <option value="security">Security</option>
                    <option value="errors">Errors</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Status:</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="ready">Ready</option>
                    <option value="generating">Generating</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Reports List */}
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={getStatusColor(report.status) as any}>{report.status}</Badge>
                          <Badge variant="outline" style={{ backgroundColor: `var(--${getTypeColor(report.type)}-100)`, color: `var(--${getTypeColor(report.type)}-800)` }}>
                            {report.type}
                          </Badge>
                          <Badge variant="secondary">{report.format}</Badge>
                          <Badge variant="outline">{report.schedule}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {report.status === 'ready' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                          disabled={!!downloadingId}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {downloadingId === report.id ? 'Downloading...' : 'Download'}
                        </Button>
                      )}
                      {report.status === 'generating' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={!!generatingId}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {generatingId === report.id ? 'Generating...' : 'Generate'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Last Generated:</span>
                      <p className="text-muted-foreground">
                        {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <p className="text-muted-foreground">{report.size ? (report.size/1024/1024).toFixed(2)+' MB' : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Format:</span>
                      <p className="text-muted-foreground">{report.format}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredReports.length === 0 && !isLoading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No reports found</h3>
                <p className="text-muted-foreground text-center">
                  No reports match your current filter criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* The remaining Analytics, Templates, Scheduled tabs will remain mock/static, can be handled next if wanted */}
      </Tabs>
    </div>
  );
}
