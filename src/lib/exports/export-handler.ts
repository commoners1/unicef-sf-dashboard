import { generateExportDataFromDesignatedColumns, type ExportColumn } from '@/lib/export-utils';
import { ExportApiService } from '@/services/api/export/export-api';
import { formatDateForFilename } from '@/lib/utils';

/**
 * Configuration for export handler
 */
export interface ExportHandlerConfig<T> {
  // Fetch function to get data (should return paginated response)
  fetchFn: (filters: any) => Promise<{ 
    [key: string]: any;
    pagination: { pages?: number; totalPages?: number; total: number; [key: string]: any };
  }>;
  // Key in response that contains the data array (e.g., 'logs', 'data', 'errors')
  dataKey: string;
  // Export column definitions
  exportColumns: ExportColumn<T>[];
  // Clean filters function (removes pagination, undefined values, etc.)
  cleanFilters?: (filters: any) => any;
  // Client-side filter function (optional, for additional filtering after fetch)
  clientSideFilter?: (data: T[]) => T[];
  // Filename prefix for export
  filenamePrefix: string;
  // Page size for batch fetching
  pageSize?: number;
  // Batch size for parallel fetching
  batchSize?: number;
}

/**
 * Export progress callback
 */
export type ExportProgressCallback = (progress: { current: number; total: number }) => void;

/**
 * Reusable export handler for pages with DataTable, export, and filters
 * Handles fetching all data in batches, applying filters, and exporting
 */
export async function handleExport<T>({
  fetchFn,
  dataKey,
  exportColumns,
  cleanFilters,
  clientSideFilter,
  filenamePrefix,
  pageSize = 1000,
  batchSize = 5,
  includeFilters = false,
  serverFilters = {},
  onProgress,
  onError,
}: ExportHandlerConfig<T> & {
  includeFilters?: boolean;
  serverFilters?: any;
  onProgress?: ExportProgressCallback;
  onError?: (error: Error) => void;
}): Promise<void> {
  try {
    // Clean server filters if needed
    const cleanedFilters = cleanFilters 
      ? (includeFilters ? cleanFilters(serverFilters) : {})
      : (includeFilters ? serverFilters : {});

    // First, fetch first page to know total pages
    const firstResponse = await fetchFn({
      ...cleanedFilters,
      page: 1,
      limit: pageSize,
    });

    // Handle both 'pages' and 'totalPages' in pagination response
    const totalPages = firstResponse.pagination.pages || firstResponse.pagination.totalPages || 1;
    let allData: T[] = [...(firstResponse[dataKey] as T[])];

    onProgress?.({ current: 1, total: totalPages });

    // Fetch remaining pages in parallel batches
    const remainingPages = totalPages > 1 
      ? Array.from({ length: totalPages - 1 }, (_, i) => i + 2) 
      : [];

    for (let i = 0; i < remainingPages.length; i += batchSize) {
      const batch = remainingPages.slice(i, i + batchSize);
      
      // Fetch batch in parallel
      const batchPromises = batch.map(page =>
        fetchFn({
          ...cleanedFilters,
          page,
          limit: pageSize,
        })
      );

      const batchResponses = await Promise.all(batchPromises);
      
      // Combine results
      batchResponses.forEach(response => {
        allData = [...allData, ...(response[dataKey] as T[])];
      });

      // Update progress
      const currentPage = Math.min(i + batchSize + 1, totalPages);
      onProgress?.({ current: currentPage, total: totalPages });
      
      // Yield to browser to keep UI responsive
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    // Apply client-side filters if provided
    let filteredData = allData;
    if (clientSideFilter) {
      onProgress?.({ current: totalPages, total: totalPages + 1 });
      filteredData = clientSideFilter(allData);
    }

    // Generate export data from designated export columns
    onProgress?.({ current: totalPages + 1, total: totalPages + 2 });
    const { data: exportData, headers } = generateExportDataFromDesignatedColumns(
      filteredData,
      exportColumns
    );

    // Export client-side
    onProgress?.({ current: totalPages + 2, total: totalPages + 3 });
    const filename = includeFilters
      ? `${filenamePrefix}-filtered-${formatDateForFilename()}`
      : `${filenamePrefix}-all-${formatDateForFilename()}`;
    
    await ExportApiService.exportToXLSX(exportData, filename, headers);
    
    onProgress?.({ current: totalPages + 3, total: totalPages + 3 });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('Export failed:', error);
    onError?.(error);
    throw error;
  }
}

