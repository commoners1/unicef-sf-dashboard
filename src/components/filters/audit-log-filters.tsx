import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  Download,
  RefreshCw
} from 'lucide-react';
import type { AuditLogFilters } from '@/types/audit';
import { formatGMT7Date } from '@/lib/utils/timezone.util';

interface AuditLogFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onExport: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const statusCodeOptions = [
  { value: '200', label: '200 - OK' },
  { value: '201', label: '201 - Created' },
  { value: '400', label: '400 - Bad Request' },
  { value: '401', label: '401 - Unauthorized' },
  { value: '403', label: '403 - Forbidden' },
  { value: '404', label: '404 - Not Found' },
  { value: '500', label: '500 - Internal Server Error' },
];

const methodOptions = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'QUEUE', label: 'QUEUE' },
  { value: 'SCHEDULER', label: 'SCHEDULER' },
];

const actionOptions = [
  { value: 'API_CALL', label: 'API Call' },
  { value: 'JOB_STARTED', label: 'Job Started' },
  { value: 'JOB_COMPLETED', label: 'Job Completed' },
  { value: 'JOB_FAILED', label: 'Job Failed' },
  { value: 'JOB_SCHEDULED', label: 'Job Scheduled' },
  { value: 'QUEUE_JOB_ADDED', label: 'Queue Job Added' },
  { value: 'QUEUE_JOB_REMOVED', label: 'Queue Job Removed' },
  { value: 'QUEUE_JOB_RETRIED', label: 'Queue Job Retried' },
  { value: 'QUEUE_CLEARED', label: 'Queue Cleared' },
  { value: 'CRON_JOB', label: 'Cron Job' },
];

export function AuditLogFiltersComponent({ 
  filters, 
  onFiltersChange, 
  onExport, 
  onRefresh,
  isLoading 
}: AuditLogFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: AuditLogFilters = {
      page: 1,
      limit: 50,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(localFilters).forEach(([key, value]) => {
      if (key !== 'page' && key !== 'limit' && value !== undefined && value !== null && value !== '') {
        count++;
      }
    });
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Method</label>
              <Select
                value={localFilters.method || ''}
                onValueChange={(value) => handleFilterChange('method', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All methods</SelectItem>
                  {methodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status Code</label>
              <Select
                value={localFilters.statusCode?.toString() || ''}
                onValueChange={(value) => handleFilterChange('statusCode', value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All status codes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All status codes</SelectItem>
                  {statusCodeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Action</label>
                  <Select
                    value={localFilters.action || ''}
                    onValueChange={(value) => handleFilterChange('action', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All actions</SelectItem>
                      {actionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Delivered Status</label>
                  <Select
                    value={localFilters.isDelivered?.toString() || ''}
                    onValueChange={(value) => handleFilterChange('isDelivered', value === '' ? undefined : value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="true">Delivered</SelectItem>
                      <SelectItem value="false">Not Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters.startDate ? formatGMT7Date(new Date(localFilters.startDate)) : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.startDate ? new Date(localFilters.startDate) : undefined}
                        onSelect={(date) => handleFilterChange('startDate', date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {localFilters.endDate ? formatGMT7Date(new Date(localFilters.endDate)) : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={localFilters.endDate ? new Date(localFilters.endDate) : undefined}
                        onSelect={(date) => handleFilterChange('endDate', date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center space-x-2 pt-4 border-t">
              <span className="text-sm font-medium">Active filters:</span>
              {Object.entries(localFilters).map(([key, value]) => {
                if (key === 'page' || key === 'limit' || !value) return null;
                
                return (
                  <Badge key={key} variant="secondary" className="flex items-center space-x-1">
                    <span>{key}: {String(value)}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange(key as keyof AuditLogFilters, undefined)}
                    />
                  </Badge>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
