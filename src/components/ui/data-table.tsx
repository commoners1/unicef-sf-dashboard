import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Column<T> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date';
  filterOptions?: { value: string; label: string }[];
  width?: string;
  align?: 'left' | 'center' | 'right';
  mobilePriority?: 'primary' | 'secondary'; // Primary shows by default, secondary shows in "View More"
  exportable?: boolean; // Whether this column should be included in exports (default: true if not specified)
  exportKey?: string; // Custom key for export (defaults to title)
  exportValue?: (record: T) => any; // Custom function to extract value for export
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSearch?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  searchValue?: string; // Controlled search value (for server-side search)
  actions?: {
    view?: (record: T) => void;
    edit?: (record: T) => void;
    delete?: (record: T) => void;
    export?: (record: T) => void;
    copy?: (record: T) => void;
  };
  rowKey?: keyof T;
  className?: string;
  emptyMessage?: string;
  serverSidePagination?: boolean;
  showSelectionFilters?: boolean; // Show dropdown/select-based filters
  showSearchFilter?: boolean; // Show typing-based search input
  customFilters?: React.ReactNode; // Custom filter content to show when showSearchFilter is true
  hasCustomFiltersActive?: boolean; // Indicates when custom filters (managed outside DataTable) are active
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  onPaginationChange,
  onSort,
  onFilter,
  onSearch,
  searchPlaceholder = 'Search...',
  searchValue: controlledSearchValue,
  actions,
  rowKey = 'id' as keyof T,
  className = '',
  emptyMessage = 'No data available',
  serverSidePagination = false,
  showSelectionFilters = true, // Default to true for backward compatibility
  showSearchFilter = true, // Default to true for backward compatibility
  customFilters,
  hasCustomFiltersActive = false,
}: DataTableProps<T>) {
  // Use controlled search value if provided (for server-side), otherwise use local state
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTerm = controlledSearchValue !== undefined ? controlledSearchValue : localSearchTerm;
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile/tablet for card view
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        result = result.filter((item) => {
          const itemValue = item[key];
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(String(value).toLowerCase());
          }
          return itemValue === value;
        });
      }
    });

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortField, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    
    // If server-side pagination is enabled, return data as-is (already paginated by server)
    if (serverSidePagination) {
      return filteredData;
    }
    
    // Otherwise, do client-side pagination
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pagination, serverSidePagination]);

  const handleSort = (field: string) => {
    if (onSort) {
      const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
      setSortField(field);
      setSortDirection(newDirection);
      onSort(field, newDirection);
    }
  };

  const handleFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  // Use local state for search input to prevent focus loss from parent re-renders
  // Only sync with controlled value when it changes externally (not from our typing)
  const [inputValue, setInputValue] = useState(controlledSearchValue || '');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  
  // Sync local input value with controlled value only when it changes externally
  useEffect(() => {
    if (controlledSearchValue !== undefined && !isTypingRef.current) {
      setInputValue(controlledSearchValue);
    }
  }, [controlledSearchValue]);
  
  // Also sync local state for uncontrolled mode
  useEffect(() => {
    if (controlledSearchValue === undefined) {
      setInputValue(localSearchTerm);
    }
  }, [localSearchTerm, controlledSearchValue]);
  
  const handleSearch = useCallback((value: string) => {
    // Update local input value immediately
    setInputValue(value);
    isTypingRef.current = true;
    
    // Update local state if not controlled
    if (controlledSearchValue === undefined) {
      setLocalSearchTerm(value);
    }
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce only the parent callback to prevent focus loss from re-renders
    searchTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      if (onSearch) {
        onSearch(value);
      }
    }, 300); // 300ms debounce
  }, [controlledSearchValue, onSearch]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const clearFilters = () => {
    setFilters({});
    setInputValue('');
    if (controlledSearchValue === undefined) {
      setLocalSearchTerm('');
    }
    if (onFilter) onFilter({});
    if (onSearch) onSearch('');
    isTypingRef.current = false;
  };
  
  const handleClearFilters = clearFilters;

  const getSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? (
        <SortAsc className="h-4 w-4" />
      ) : (
        <SortDesc className="h-4 w-4" />
      );
    }
    // Show a neutral sort icon when not sorted
    return <SortAsc className="h-4 w-4 opacity-40" />;
  };

  const getFilterableColumns = () => {
    return columns.filter(col => col.filterable);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '') || (inputValue || searchTerm) || hasCustomFiltersActive;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>Search & Filters</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs ml-1">
                  {Object.values(filters).filter(v => v !== undefined && v !== '').length + (inputValue || searchTerm ? 1 : 0)} active
                </Badge>
              )}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {/* Show "Show Filters" button if showSelectionFilters (with customFilters) or showSearchFilter (with filterable columns) is true */}
              {(showSelectionFilters && customFilters) || (showSearchFilter && getFilterableColumns().length > 0) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 sm:flex-initial min-w-[100px]"
                >
                  <Filter className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
                  <span className="sm:hidden">{showFilters ? 'Hide' : 'Show'}</span>
                </Button>
              ) : null}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex-1 sm:flex-initial min-w-[100px]"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Search - Always show if onSearch is provided */}
            {onSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  ref={searchInputRef}
                  placeholder={searchPlaceholder}
                  value={inputValue}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                  }}
                  className="pl-10 h-9 sm:h-10"
                />
              </div>
            )}

            {/* Selection Filters (customFilters) - Show when showFilters is true and showSelectionFilters is true */}
            {showSelectionFilters && showFilters && customFilters && (
              <div className="pt-2 border-t border-border">
                {customFilters}
              </div>
            )}

            {/* Specific Search Filters (text inputs for filterable columns) - Show when showFilters is true and showSearchFilter is true */}
            {showSearchFilter && showFilters && getFilterableColumns().length > 0 && (
              <div className="pt-2 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {getFilterableColumns().map((column) => (
                    <div key={column.key} className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-foreground block">
                        {column.title}
                      </label>
                      <Input
                        placeholder={`Filter by ${column.title}`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilter(column.key, e.target.value || undefined)}
                        className="h-9 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table - Desktop Table View / Mobile Card View */}
      <Card>
        <CardContent className="p-0">
          {isMobile ? (
            // Mobile/Tablet Card View - Optimized for 4 records per screen
            <div className="space-y-2 p-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loading variant="spinner" size="lg" text="Loading data..." />
                </div>
              ) : paginatedData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-muted-foreground">
                                {inputValue || searchTerm ? (
                              <div className="space-y-2">
                                <p className="text-sm sm:text-base">{emptyMessage}</p>
                                <p className="text-xs sm:text-sm">
                                  No results found for <span className="font-semibold text-foreground">"{inputValue || searchTerm}"</span>
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSearch('')}
                                  className="mt-2 text-xs h-7"
                                >
                                  Clear search
                                </Button>
                              </div>
                            ) : hasActiveFilters ? (
                        <div className="space-y-2">
                          <p className="text-sm sm:text-base">{emptyMessage}</p>
                          <p className="text-xs sm:text-sm">Try adjusting your filters</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            className="mt-2 text-xs h-7"
                          >
                            Clear all filters
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base">{emptyMessage}</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                paginatedData.map((record, index) => {
                  const recordKey = String(record[rowKey] || index);
                  const isExpanded = expandedRows.has(recordKey);
                  
                  // Get ID column (usually first column or one with 'id' in key)
                  const idColumn = columns.find(col => 
                    col.key.toLowerCase().includes('id') || 
                    col.key.toLowerCase().includes('name') ||
                    col.key === columns[0]?.key
                  ) || columns[0];
                  
                  // Separate primary and secondary columns
                  // If mobilePriority is set, use it; otherwise, first 3 columns are primary
                  const primaryColumns = columns.filter((col, colIndex) => 
                    col !== idColumn && (
                      col.mobilePriority === 'primary' || 
                      (col.mobilePriority !== 'secondary' && colIndex < 3)
                    )
                  );
                  const secondaryColumns = columns.filter((col, colIndex) => 
                    col !== idColumn && (
                      col.mobilePriority === 'secondary' || 
                      (col.mobilePriority !== 'primary' && colIndex >= 3)
                    )
                  );
                  
                  const toggleExpand = () => {
                    const newExpanded = new Set(expandedRows);
                    if (isExpanded) {
                      newExpanded.delete(recordKey);
                    } else {
                      newExpanded.add(recordKey);
                    }
                    setExpandedRows(newExpanded);
                  };

                  return (
                    <Card key={recordKey} className="border shadow-sm">
                      <CardContent className="p-3">
                        {/* Header Row: ID + Action Icons */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b">
                          <div className="flex-1 min-w-0">
                            {idColumn && (
                              <div className="text-sm font-semibold truncate">
                                {idColumn.render
                                  ? idColumn.render(record[idColumn.dataIndex], record)
                                  : String(record[idColumn.dataIndex] || '-')
                                }
                              </div>
                            )}
                          </div>
                          {actions && (
                            <div className="flex items-center gap-1 ml-2">
                              {actions.view && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => actions.view!(record)}
                                  aria-label="View"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              {actions.copy && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    actions.copy!(record);
                                  }}
                                  aria-label="Copy"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                              {actions.export && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => actions.export!(record)}
                                  aria-label="Export"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              {actions.delete && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => actions.delete!(record)}
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                              {actions.edit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => actions.edit!(record)}
                                  aria-label="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Primary Details - Always Visible */}
                        <div className="space-y-2 mb-2">
                          {primaryColumns.map((column) => (
                            <div key={column.key} className="flex items-start justify-between gap-2">
                              <span className="text-xs text-muted-foreground font-medium min-w-[80px] flex-shrink-0">
                                {column.title}:
                              </span>
                              <div className="text-xs text-foreground flex-1 text-right flex justify-end items-center">
                                {column.render
                                  ? column.render(record[column.dataIndex], record)
                                  : String(record[column.dataIndex] || '-')
                                }
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Secondary Details - Expandable */}
                        {secondaryColumns.length > 0 && (
                          <>
                            {isExpanded && (
                              <div className="space-y-2 pt-2 border-t mt-2">
                                {secondaryColumns.map((column) => (
                                  <div key={column.key} className="flex items-start justify-between gap-2">
                                    <span className="text-xs text-muted-foreground font-medium min-w-[80px] flex-shrink-0">
                                      {column.title}:
                                    </span>
                                    <div className="text-xs text-foreground flex-1 text-right flex justify-end items-center">
                                      {column.render
                                        ? column.render(record[column.dataIndex], record)
                                        : String(record[column.dataIndex] || '-')
                                      }
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* View More Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleExpand}
                              className="w-full mt-2 h-8 text-xs"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  View Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  View More
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={column.key}
                        className={`${column.width ? `w-[${column.width}]` : ''} ${
                          column.align === 'center' ? 'text-center' : 
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{column.title}</span>
                          {column.sortable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-accent"
                              onClick={() => handleSort(column.key)}
                              title="Click to sort"
                            >
                              {getSortIcon(column.key)}
                            </Button>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    {actions && (
                      <TableHead className="w-[100px] text-center">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-12">
                        <Loading variant="spinner" size="lg" text="Loading data..." />
                      </TableCell>
                    </TableRow>
                  ) : paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-muted-foreground">
                            {inputValue || searchTerm ? (
                              <div className="space-y-2">
                                <p className="text-sm sm:text-base">{emptyMessage}</p>
                                <p className="text-xs sm:text-sm">
                                  No results found for <span className="font-semibold text-foreground">"{inputValue || searchTerm}"</span>
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSearch('')}
                                  className="mt-2 text-xs h-7"
                                >
                                  Clear search
                                </Button>
                              </div>
                            ) : hasActiveFilters ? (
                              <div className="space-y-2">
                                <p className="text-sm sm:text-base">{emptyMessage}</p>
                                <p className="text-xs sm:text-sm">Try adjusting your filters</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleClearFilters}
                                  className="mt-2 text-xs h-7"
                                >
                                  Clear all filters
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm sm:text-base">{emptyMessage}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((record, index) => (
                      <TableRow key={String(record[rowKey] || index)}>
                        {columns.map((column) => (
                          <TableCell
                            key={column.key}
                            className={`${
                              column.align === 'center' ? 'text-center' : 
                              column.align === 'right' ? 'text-right' : 'text-left'
                            }`}
                          >
                            {column.render
                              ? column.render(record[column.dataIndex], record)
                              : String(record[column.dataIndex] || '-')
                            }
                          </TableCell>
                        ))}
                        {actions && (
                          <TableCell className="text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {actions.view && (
                                  <DropdownMenuItem onClick={() => actions.view!(record)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                )}
                                {actions.edit && (
                                  <DropdownMenuItem onClick={() => actions.edit!(record)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {actions.export && (
                                  <DropdownMenuItem onClick={() => actions.export!(record)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                  </DropdownMenuItem>
                                )}
                                {actions.delete && (
                                  <DropdownMenuItem 
                                    onClick={() => actions.delete!(record)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPaginationChange?.(1, pagination.pageSize)}
                    disabled={pagination.current <= 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPaginationChange?.(pagination.current - 1, pagination.pageSize)}
                    disabled={pagination.current <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs sm:text-sm whitespace-nowrap">
                    Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPaginationChange?.(pagination.current + 1, pagination.pageSize)}
                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPaginationChange?.(Math.ceil(pagination.total / pagination.pageSize), pagination.pageSize)}
                    disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
                {pagination.showSizeChanger && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm">Show:</span>
                    <Select
                      value={pagination.pageSize.toString()}
                      onValueChange={(value) => onPaginationChange?.(1, parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
