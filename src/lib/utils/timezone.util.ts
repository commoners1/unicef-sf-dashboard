/**
 * Timezone utilities for GMT+7 (Asia/Bangkok)
 * Dashboard displays and filters in GMT+7, backend uses UTC
 */

// const GMT7_OFFSET_MS = 7 * 60 * 60 * 1000; // 7 hours in milliseconds

/**
 * Format date in GMT+7 for display
 * Converts UTC date from backend to GMT+7 for display
 * Format: DD/MM/YYYY, HH:MM:SS
 */
export function formatGMT7(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Use toLocaleString with Asia/Bangkok timezone, day-first format
  const dateStr = d.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const timeStr = d.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${dateStr}, ${timeStr}`;
}

/**
 * Format date in GMT+7 for display (date only, no time)
 * Format: DD/MM/YYYY
 */
export function formatGMT7Date(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Convert GMT+7 date (from calendar picker) to UTC date string for API
 * 
 * When user selects Nov 20 GMT+7, we want to include the full day:
 * - Nov 20 00:00:00 GMT+7 = Nov 19 17:00:00 UTC
 * - Nov 20 23:59:59 GMT+7 = Nov 20 16:59:59 UTC
 * 
 * Backend uses: new Date(startDate) which creates midnight UTC
 * So we need to send the UTC date that when used as >= will include our GMT+7 day.
 * 
 * Solution: Send the UTC date with time "17:00:00" included
 * Format: "YYYY-MM-DDTHH:mm:ssZ"
 */
export function convertDateFilterToUTC(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Create date string as midnight GMT+7
  const gmt7DateString = `${year}-${month}-${day}T00:00:00+07:00`;
  const gmt7Date = new Date(gmt7DateString);
  
  // Convert to UTC ISO string with time included
  // Nov 20 00:00 GMT+7 = Nov 19 17:00:00 UTC
  // Return format: "2025-11-19T17:00:00.000Z"
  return gmt7Date.toISOString();
}

/**
 * Convert GMT+7 date to UTC date for end date (inclusive)
 * 
 * When user selects Nov 20 GMT+7 as end date, we want to include:
 * - Nov 20 23:59:59 GMT+7 = Nov 20 16:59:59 UTC
 * - So we send the end of Nov 20 in UTC (16:59:59 UTC)
 * - Format: "YYYY-MM-DDTHH:mm:ssZ"
 */
export function convertEndDateFilterToUTC(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Create date string as end of day GMT+7 (23:59:59)
  const gmt7DateString = `${year}-${month}-${day}T23:59:59+07:00`;
  const gmt7Date = new Date(gmt7DateString);
  
  // Convert to UTC ISO string
  // Nov 20 23:59:59 GMT+7 = Nov 20 16:59:59 UTC
  // Return format: "2025-11-20T16:59:59.000Z"
  return gmt7Date.toISOString();
}

