/**
 * Downloads a blob as a file
 * 
 * @param blob - Blob to download
 * @param filename - Name of the file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Downloads JSON data as a file
 * 
 * @param data - Data to download as JSON
 * @param filename - Name of the file (without extension)
 */
export function downloadJSON(data: unknown, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Downloads text data as a file
 * 
 * @param text - Text to download
 * @param filename - Name of the file
 * @param mimeType - MIME type of the file
 */
export function downloadText(text: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([text], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Formats a date for use in filenames
 * 
 * @param date - Date to format (defaults to now)
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForFilename(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

