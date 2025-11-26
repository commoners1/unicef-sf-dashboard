import type { Column } from '@/components/ui/data-table';

/**
 * Export column definition - allows custom columns for export that may differ from table columns
 */
export interface ExportColumn<T> {
  key: string; // Unique identifier
  header: string; // Column header in export
  getValue: (record: T) => any; // Function to extract value from record
}

/**
 * Generate export data from designated export columns
 * This allows exports to have different columns than what's displayed in the table
 */
export function generateExportDataFromDesignatedColumns<T>(
  data: T[],
  exportColumns: ExportColumn<T>[]
): { data: Record<string, any>[]; headers: string[] } {
  const headers = exportColumns.map(col => col.header);

  const exportData = data.map((record) => {
    const row: Record<string, any> = {};
    
    exportColumns.forEach((col) => {
      const value = col.getValue(record);
      row[col.header] = formatValueForExport(value);
    });
    
    return row;
  });

  return { data: exportData, headers };
}

/**
 * Generate export data from table columns and data
 * Respects exportable flag and custom export configurations
 * Use this when you want exports to match table columns
 */
export function generateExportDataFromColumns<T>(
  data: T[],
  columns: Column<T>[]
): { data: Record<string, any>[]; headers: string[] } {
  // Filter columns: exclude actions, and only include columns marked as exportable (default: true)
  const exportableColumns = columns.filter(
    col => {
      // Always exclude action columns
      if (col.key === 'actions' || col.key === 'action') return false;
      // Must have dataIndex
      if (!col.dataIndex) return false;
      // Check exportable flag (defaults to true if not specified)
      return col.exportable !== false;
    }
  );

  // Generate headers from column exportKey or title
  const headers = exportableColumns.map(col => col.exportKey || col.title);

  // Generate data rows
  const exportData = data.map((record) => {
    const row: Record<string, any> = {};
    
    exportableColumns.forEach((col) => {
      const exportHeader = col.exportKey || col.title;
      
      // Use custom exportValue function if provided
      if (col.exportValue) {
        row[exportHeader] = formatValueForExport(col.exportValue(record));
        return;
      }
      
      // Otherwise use dataIndex
      let value = record[col.dataIndex as keyof T];
      
      // Handle nested paths (e.g., if dataIndex is 'user' but we want 'user.name')
      // Check if the value is an object and try to extract meaningful data
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Try common nested properties
        if ('name' in value) value = (value as any).name;
        else if ('email' in value) value = (value as any).email;
        else if ('id' in value) value = (value as any).id;
      }
      
      row[exportHeader] = formatValueForExport(value);
    });
    
    return row;
  });

  return { data: exportData, headers };
}

/**
 * Format a value for export (handle dates, objects, etc.)
 */
function formatValueForExport(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  if (typeof value === 'object') {
    // Handle nested objects (e.g., user: { name: 'John' })
    if ('name' in value && typeof value.name === 'string') {
      return value.name;
    }
    if ('email' in value && typeof value.email === 'string') {
      return value.email;
    }
    // For arrays, join with comma
    if (Array.isArray(value)) {
      return value.map(v => formatValueForExport(v)).join(', ');
    }
    // For other objects, try to extract meaningful string representation
    if (Object.keys(value).length === 0) {
      return '';
    }
    // Try to find a common property like 'name', 'title', 'id'
    const commonProps = ['name', 'title', 'id', 'label', 'value'];
    for (const prop of commonProps) {
      if (prop in value && typeof value[prop] === 'string') {
        return value[prop];
      }
    }
    // Last resort: stringify
    return JSON.stringify(value);
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  return String(value);
}

/**
 * Helper to extract nested values from objects (e.g., user.name)
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
}

