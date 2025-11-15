import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AuditLog } from '@/types/audit';
import { formatDistanceToNow } from 'date-fns';
import { ResponsiveTable } from '@/components/shared/responsive-table';

interface AuditLogsTableProps {
  logs: AuditLog[];
  onViewDetails: (log: AuditLog) => void;
  onExport: (log: AuditLog) => void;
  isLoading?: boolean;
}

export function AuditLogsTable({ logs, onViewDetails, onExport, isLoading }: AuditLogsTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else if (statusCode >= 500) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return 'success';
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'warning';
    } else if (statusCode >= 500) {
      return 'destructive';
    }
    return 'secondary';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'default';
      case 'POST':
        return 'success';
      case 'PUT':
        return 'warning';
      case 'DELETE':
        return 'destructive';
      case 'PATCH':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    return `${duration}ms`;
  };

  const formatJsonData = (data: any) => {
    if (!data) return 'No data';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <ResponsiveTable
              data={logs}
              getRowKey={(log) => log.id}
              renderMobileCard={(log) => ({
                id: (
                  <div className="flex items-center gap-2">
                    <Badge variant={getMethodColor(log.method)} className="text-xs">
                      {log.method}
                    </Badge>
                    <span className="text-xs font-mono truncate">{log.endpoint}</span>
                  </div>
                ),
                primaryFields: [
                  {
                    label: 'Action',
                    value: <span className="text-xs">{log.action}</span>,
                  },
                  {
                    label: 'Status',
                    value: (
                      <div className="flex items-center gap-1">
                        {getStatusIcon(log.statusCode)}
                        <Badge variant={getStatusColor(log.statusCode)} className="text-xs">
                          {log.statusCode}
                        </Badge>
                      </div>
                    ),
                  },
                  {
                    label: 'User',
                    value: (
                      <span className="text-xs">
                        {log.user ? log.user.name : 'System'}
                      </span>
                    ),
                  },
                ],
                secondaryFields: [
                  {
                    label: 'Timestamp',
                    value: (
                      <span className="text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    ),
                  },
                  {
                    label: 'Duration',
                    value: <span className="text-xs">{formatDuration(log.duration)}</span>,
                  },
                  {
                    label: 'IP Address',
                    value: <span className="text-xs font-mono">{log.ipAddress}</span>,
                  },
                  {
                    label: 'Type',
                    value: <span className="text-xs">{log.type || 'N/A'}</span>,
                  },
                ],
                actions: {
                  view: () => onViewDetails(log),
                  copy: () => onExport(log),
                },
              })}
              emptyMessage="No audit logs found"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {log.user ? (
                            <>
                              <div className="text-sm font-medium">{log.user.name}</div>
                              <div className="text-xs text-muted-foreground">{log.user.email}</div>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">System</span>
                          )}
                          {log.apiKey && (
                            <div className="text-xs text-muted-foreground">
                              API: {log.apiKey.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{log.action}</div>
                          {log.type && (
                            <div className="text-xs text-muted-foreground">{log.type}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getMethodColor(log.method)}>
                          {log.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={log.endpoint}>
                          {log.endpoint}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.statusCode)}
                          <Badge variant={getStatusColor(log.statusCode)}>
                            {log.statusCode}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDuration(log.duration)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{log.ipAddress}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails(log)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onExport(log)}>
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResponsiveTable>
          </div>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ID</label>
                  <p className="text-sm font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                  <p className="text-sm">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Action</label>
                  <p className="text-sm">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Method</label>
                  <Badge variant={getMethodColor(selectedLog.method)}>
                    {selectedLog.method}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endpoint</label>
                  <p className="text-sm font-mono">{selectedLog.endpoint}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status Code</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedLog.statusCode)}
                    <Badge variant={getStatusColor(selectedLog.statusCode)}>
                      {selectedLog.statusCode}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-sm">{formatDuration(selectedLog.duration)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                  <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                </div>
              </div>

              {/* User Info */}
              {selectedLog.user && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">{selectedLog.user.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedLog.user.email}</p>
                  </div>
                </div>
              )}

              {/* API Key Info */}
              {selectedLog.apiKey && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">API Key</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">{selectedLog.apiKey.name}</p>
                    {selectedLog.apiKey.description && (
                      <p className="text-sm text-muted-foreground">{selectedLog.apiKey.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Request Data */}
              {selectedLog.requestData && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Request Data</label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {formatJsonData(selectedLog.requestData)}
                  </pre>
                </div>
              )}

              {/* Response Data */}
              {selectedLog.responseData && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Response Data</label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                    {formatJsonData(selectedLog.responseData)}
                  </pre>
                </div>
              )}

              {/* User Agent */}
              {selectedLog.userAgent && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                  <p className="text-sm font-mono break-all">{selectedLog.userAgent}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
